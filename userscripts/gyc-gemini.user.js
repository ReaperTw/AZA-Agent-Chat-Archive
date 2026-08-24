// ==UserScript==
// @name         GYC - Gemini
// @namespace    https://github.com/ReaperTw/AZA-AI-Chat-Archive
// @version      1.0.0
// @description  Grab Your Chat - Gemini 端對話匯出器；最後更新於 20260824
// @match        https://gemini.google.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- 參數設定 ---
    const MAX_UPWARD_LOOPS = 80;   // 向上滾動最大次數
    const RETRY_EMPTY_MAX = 5;     // 發現空白內容時，最大重試次數
    const RETRY_EMPTY_WAIT = 2000; // 發現空白內容時，每次重試等待時間

    // 【慢速安全模式參數】
    const SLOW_UPWARD_WAIT = 2000;
    const SLOW_SCROLL_STEP = 1000;
    const SLOW_BASE_WAIT = 1500;

    // 【滿速保險模式參數】
    const FAST_UPWARD_WAIT = 800;
    const FAST_SCROLL_STEP = 3000;
    const FAST_BASE_WAIT = 500;

    // --- 工具函式 ---
    function sanitizeFileName(str) {
        if (!str) return "";
        let clean = str.replace(/[\r\n]+/g, ' ')
                       .replace(/[\\/:"*?<>|]+/g, '')
                       .replace(/\s+/g, '-')      // 空格轉減號
                       .replace(/-+/g, '-')       // 壓縮連續減號
                       .replace(/^-+|-+$/g, '');  // 移除頭尾減號
        return clean.substring(0, 60);
    }

    function getTimestamp() {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
               `_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    }

    function findScrollContainer() {
        let target = document.querySelector('infinite-scroller.chat-history') ||
                     document.querySelector('infinite-scroller');
        return target || document.documentElement;
    }

    function cleanContent(text) {
        if (!text) return "";
        return text
            .replace(/^你說了[\r\n]*/gm, '')        // 移除「你說了」與後面的換行
            .replace(/^顯示思路[\r\n]*/gm, '')      // 移除「顯示思路」與後面的換行
            .replace(/^Gemini 說了[\r\n]*/gm, '')   // 移除「Gemini 說了」與後面的換行
            .replace(/^image[\r\n]*/gm, '')         // 移除圖片代位符「image」
            .replace(/[\r\n]{2,}/g, '\n')           // 壓縮多餘連續換行為單一換行
            .trim();
    }

    function determineTitle() {
         try {
            // 優先尋找現代 Gemini 側邊欄中具有 aria-current="page" 或帶有高亮選中屬性的項目
            let selectedItem = document.querySelector('mat-sidenav [aria-current="page"] .mdc-list-item__primary-text') ||
                               document.querySelector('mat-sidenav .gds-nav-item-selected') ||
                               document.querySelector('.gds-sidenav-list [aria-current="page"]');

            // 備用方案：如果上述屬性被混淆，則尋找側邊對話清單中，具有特定行為選單按鈕的同級活動文字
            if (!selectedItem) {
                const activeMenuBtn = document.querySelector('button.gem-conversation-actions-menu-button');
                if (activeMenuBtn && activeMenuBtn.closest('.mat-mdc-list-item')) {
                    selectedItem = activeMenuBtn.closest('.mat-mdc-list-item');
                }
            }

            if (selectedItem) {
                return sanitizeFileName(selectedItem.innerText.split('\n')[0].trim());
            }
        } catch (e) {
            console.error("Exporter: 擷取標題失敗", e);
        }
        return "Gemini-Chat";
    }

    // --- 自訂 UI 通知與輸入框 (取代 alert 與 prompt) ---
    function showNotification(message, isError = false) {
        document.getElementById('gemini-export-toast')?.remove();
        const toast = document.createElement('div');
        toast.id = 'gemini-export-toast';
        Object.assign(toast.style, {
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            background: isError ? '#d93025' : '#3c4043', color: '#fff',
            padding: '12px 24px', borderRadius: '8px', zIndex: '2147483647',
            boxShadow: '0 4px 10px rgba(0,0,0,.3)', fontSize: '14px',
            fontWeight: 'bold', maxWidth: '80vw', whiteSpace: 'pre-line'
        });
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function showSaveModal(defaultTitle, textContent, onSave) {
        document.getElementById('gemini-export-save-overlay')?.remove();
        const overlay = document.createElement('div');
        overlay.id = 'gemini-export-save-overlay';
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0',
            background: 'rgba(0,0,0,.6)', zIndex: '2147483646', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            background: 'linear-gradient(180deg, #151515 0%, #0d0d0d 100%)',
            padding: '24px', borderRadius: '12px', width: '430px',
            maxWidth: 'calc(100vw - 40px)',
            border: '1px solid rgba(255,255,255,.14)',
            boxShadow: '0 24px 70px rgba(0,0,0,.68), inset 0 1px 0 rgba(255,255,255,.05)',
            display: 'flex', flexDirection: 'column', gap: '14px',
            color: '#f5f5f5',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
        });

        const title = document.createElement('h3');
        title.textContent = `掃描完成：${textContent.length} 字`;
        Object.assign(title.style, {
            margin: '0',
            color: '#f5f5f5',
            fontSize: '18px'
        });

        const inputLabel = document.createElement('label');
        inputLabel.textContent = '請確認檔名（無需副檔名）：';
        Object.assign(inputLabel.style, {
            fontSize: '14px',
            color: '#c8c8c8'
        });

        const input = document.createElement('input');
        input.type = 'text';
        input.value = defaultTitle;
        Object.assign(input.style, {
            padding: '10px 11px',
            background: '#1a1a1a',
            color: '#f5f5f5',
            caretColor: '#fff',
            border: '1px solid rgba(255,255,255,.2)',
            borderRadius: '6px',
            fontSize: '14px',
            width: '100%',
            boxSizing: 'border-box',
            outline: 'none',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,.45)'
        });
        input.addEventListener('focus', () => {
            input.style.borderColor = 'rgba(255,255,255,.48)';
            input.style.boxShadow =
                '0 0 0 3px rgba(255,255,255,.08), ' +
                'inset 0 1px 2px rgba(0,0,0,.45)';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = 'rgba(255,255,255,.2)';
            input.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,.45)';
        });

        const btnContainer = document.createElement('div');
        Object.assign(btnContainer.style, {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        const saveBtn = document.createElement('button');
        saveBtn.textContent = '下載 .md';
        for (const button of [cancelBtn, saveBtn]) {
            Object.assign(button.style, {
                padding: '8px 16px',
                border: '1px solid transparent',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontFamily: 'system-ui, sans-serif'
            });
        }
        Object.assign(cancelBtn.style, {
            background: '#242424',
            color: '#e8e8e8',
            borderColor: 'rgba(255,255,255,.12)'
        });
        Object.assign(saveBtn.style, {
            background: '#10a37f',
            color: '#fff',
            borderColor: 'rgba(255,255,255,.08)'
        });
        cancelBtn.onclick = () => overlay.remove();
        saveBtn.onclick = () => {
            onSave(input.value.trim() || 'Untitled');
            overlay.remove();
        };
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') saveBtn.click();
            if (event.key === 'Escape') overlay.remove();
        });
        overlay.onclick = event => {
            if (event.target === overlay) overlay.remove();
        };

        btnContainer.appendChild(cancelBtn);
        btnContainer.appendChild(saveBtn);

        modal.appendChild(title);
        modal.appendChild(inputLabel);
        modal.appendChild(input);
        modal.appendChild(btnContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    // --- 核心邏輯 ---
    async function scrollToTop(btn) {
        if (!btn) return;
        btn.disabled = true;
        const originalText = btn.innerText;
        const scroller = findScrollContainer();

        btn.innerText = '⬆️ 狂奔至頂端中...';

        let stagnantCount = 0; // 停滯計數器
        for (let i = 0; i < MAX_UPWARD_LOOPS; i++) {
            let pre = scroller.scrollHeight;
            scroller.scrollTop = 0;
            await new Promise(r => setTimeout(r, FAST_UPWARD_WAIT));

            // 如果高度沒有改變
            if (scroller.scrollHeight <= pre) {
                stagnantCount++;
                if (stagnantCount >= 3) break; // 给與 3 次網路延遲的容錯機會
            } else {
                stagnantCount = 0; // 有新內容載入，重新計數
            }
        }

        btn.innerText = '✅ 已達最頂端';
        setTimeout(() => {
            btn.disabled = false;
            btn.innerText = originalText;
        }, 2000);
    }

    async function processAndExport(config, btn) {
        if (!btn) return;

        btn.disabled = true;
        const originalText = btn.innerText;
        const scroller = findScrollContainer();

        // 1. 定位起點 (向上滾動)
        if (!config.skipUpward) {
            btn.innerText = '定位起點...';
            let stagnantCount = 0; // 停滯計數器
            for (let i = 0; i < MAX_UPWARD_LOOPS; i++) {
                let pre = scroller.scrollHeight;
                scroller.scrollTop = 0;
                await new Promise(r => setTimeout(r, config.upWait));

                // 相同容錯機制
                if (scroller.scrollHeight <= pre) {
                    stagnantCount++;
                    if (stagnantCount >= 3) break;
                } else {
                    stagnantCount = 0;
                }
            }
        }

        // 2. 向下滾動 (觸發初次渲染)
        btn.innerText = '掃描中...';
        if (!config.skipUpward) scroller.scrollTop = 0;

        while (true) {
            const currentScroll = scroller.scrollTop;
            scroller.scrollTop += config.step;
            await new Promise(r => setTimeout(r, config.baseWait));
            if (Math.abs(scroller.scrollTop - currentScroll) < 10) break; // 到底了
        }

        // 3. 收集元素
        btn.innerText = '精確提取中...';
        const messages = Array.from(scroller.querySelectorAll('.user-query-bubble-with-background, .model-response, .response-container'));

        if (messages.length === 0) {
            showNotification('❌ 未找到任何對話內容', true);
            btn.disabled = false;
            btn.innerText = originalText;
            return;
        }

        // 4. 解析與二次檢查
        let out = '';
        let uIdx = 1, mIdx = 1, emptyCount = 0;

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            let txt = msg.innerText.trim();

            // 【二次檢查機制】: 如果這區塊抓下來是空的，強制滾動到它並等待渲染
            if (!txt) {
                btn.innerText = `二次檢查空白區塊 (${i+1}/${messages.length})...`;
                msg.scrollIntoView({ behavior: 'smooth', block: 'center' });

                let retry = 0;
                while (!txt && retry < RETRY_EMPTY_MAX) {
                    await new Promise(r => setTimeout(r, RETRY_EMPTY_WAIT));
                    txt = msg.innerText.trim();
                    retry++;
                }
            }

            if (!txt) {
                emptyCount++;
                txt = "(( Empty Content - 嘗試渲染失敗 ))";
            }

            let head = msg.classList.contains('user-query-bubble-with-background') ? `User ${uIdx++}` : `Model ${mIdx++}`;
            out += `\n--- [${head}] ---\n${cleanContent(txt)}\n`;
        }

        let title = determineTitle();
        if (emptyCount > 0) title += "_INCOMPLETE";
        const defaultFileName = title; // 統一輸出檔名，不因模式細分加上後綴

        // 檔案下載模式：使用自訂 Modal
        showSaveModal(defaultFileName, out, (finalTitle) => {
            const blob = new Blob(['\uFEFF' + out], { type: 'text/markdown;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `GEM_${sanitizeFileName(finalTitle)}_${getTimestamp()}.md`;
            a.click();
            URL.revokeObjectURL(a.href);
        });
        btn.disabled = false;
        btn.innerText = originalText;
    }

    function createButton() {
        if (document.getElementById('gemini-export-fab-container')) return;

        const oldContainer = document.getElementById('gemini-export-container');
        if (oldContainer) oldContainer.remove();

        const container = document.createElement('div');
        container.id = 'gemini-export-fab-container';
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: '2147483645',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '15px'
        });

        const menu = document.createElement('div');
        Object.assign(menu.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '7px',
            padding: '8px',
            background: 'rgba(8,8,8,.88)',
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: '18px',
            boxShadow:
                '0 16px 40px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04)',
            backdropFilter: 'blur(14px)',
            opacity: '0',
            transform: 'translateY(20px) scale(.9)',
            pointerEvents: 'none',
            transition: 'all .25s ease',
            transformOrigin: 'bottom right'
        });

        const commonStyle = {
            padding: '11px 16px',
            color: '#f5f5f5',
            background: 'linear-gradient(180deg, #1d1d1d 0%, #151515 100%)',
            border: '1px solid rgba(255,255,255,.12)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '650',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            letterSpacing: '.01em',
            textAlign: 'left',
            boxShadow:
                '0 4px 12px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.04)',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            transition:
                'background .16s ease, border-color .16s ease, ' +
                'transform .16s ease, box-shadow .16s ease'
        };
        const makeButton = (text, handler) => {
            const button = document.createElement('button');
            button.textContent = text;
            Object.assign(button.style, commonStyle);
            button.addEventListener('mouseenter', () => {
                button.style.background =
                    'linear-gradient(180deg, #292929 0%, #202020 100%)';
                button.style.borderColor = 'rgba(255,255,255,.24)';
                button.style.transform = 'translateY(-1px)';
                button.style.boxShadow =
                    '0 7px 18px rgba(0,0,0,.38), ' +
                    'inset 0 1px 0 rgba(255,255,255,.07)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.background =
                    'linear-gradient(180deg, #1d1d1d 0%, #151515 100%)';
                button.style.borderColor = 'rgba(255,255,255,.12)';
                button.style.transform = 'translateY(0)';
                button.style.boxShadow =
                    '0 4px 12px rgba(0,0,0,.28), ' +
                    'inset 0 1px 0 rgba(255,255,255,.04)';
            });
            button.addEventListener('mousedown', () => {
                button.style.background = '#0b0b0b';
                button.style.transform = 'translateY(0)';
            });
            button.addEventListener('mouseup', () => {
                button.style.background =
                    'linear-gradient(180deg, #292929 0%, #202020 100%)';
                button.style.transform = 'translateY(-1px)';
            });
            button.addEventListener('click', () => handler(button));
            return button;
        };

        const btnTop = makeButton(
            '↑  到頂端',
            button => scrollToTop(button)
        );
        const btnDirect = makeButton(
            '↓  往下匯出',
            button => processAndExport({
                skipUpward: true,
                upWait: 0,
                step: FAST_SCROLL_STEP,
                baseWait: FAST_BASE_WAIT
            }, button)
        );
        const btnFast = makeButton(
            '»  正常匯出',
            button => processAndExport({
                skipUpward: false,
                upWait: FAST_UPWARD_WAIT,
                step: FAST_SCROLL_STEP,
                baseWait: FAST_BASE_WAIT
            }, button)
        );
        const btnFull = makeButton(
            '◆  慢速匯出',
            button => processAndExport({
                skipUpward: false,
                upWait: SLOW_UPWARD_WAIT,
                step: SLOW_SCROLL_STEP,
                baseWait: SLOW_BASE_WAIT
            }, button)
        );
        btnTop.title = '只回到對話最頂端，不進行匯出';
        btnDirect.title = 'Direct：從目前位置開始往下匯出';
        btnFast.title = 'Fast：正常速度，從頂端完整匯出';
        btnFull.title = 'Full：較慢速度，從頂端保守完整匯出';
        menu.append(btnTop, btnDirect, btnFast, btnFull);

        const fab = document.createElement('button');
        fab.textContent = '✦';
        fab.title = 'GYC - Gemini - v1.0.0';
        fab.setAttribute('aria-label', '開啟 Grab Your Chat - Gemini 工具');
        Object.assign(fab.style, {
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.18)',
            background: 'linear-gradient(180deg, #111 0%, #030303 100%)',
            color: '#fff',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            lineHeight: '1',
            boxShadow:
                '0 8px 22px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.08)',
            transition:
                'transform .25s ease, border-color .16s ease, ' +
                'box-shadow .16s ease'
        });
        fab.addEventListener('mouseenter', () => {
            fab.style.borderColor = 'rgba(255,255,255,.38)';
            fab.style.boxShadow =
                '0 10px 28px rgba(0,0,0,.58), ' +
                'inset 0 1px 0 rgba(255,255,255,.12)';
        });
        fab.addEventListener('mouseleave', () => {
            fab.style.borderColor = 'rgba(255,255,255,.18)';
            fab.style.boxShadow =
                '0 8px 22px rgba(0,0,0,.48), ' +
                'inset 0 1px 0 rgba(255,255,255,.08)';
        });

        let open = false;
        fab.addEventListener('click', () => {
            open = !open;
            fab.style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)';
            menu.style.opacity = open ? '1' : '0';
            menu.style.transform =
                open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(.9)';
            menu.style.pointerEvents = open ? 'auto' : 'none';
        });

        container.append(menu, fab);
        document.body.appendChild(container);
    }

    const observer = new MutationObserver(() => createButton());
    observer.observe(document.body, { childList: true, subtree: true });
    createButton();
})();
