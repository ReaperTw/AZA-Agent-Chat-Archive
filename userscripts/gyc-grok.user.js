// ==UserScript==
// @name        GYC - Grok
// @namespace   https://github.com/ReaperTw/AZA-AI-Chat-Archive
// @version     1.0.0
// @description Grab Your Chat - Grok 端對話匯出器；最後更新於 20260824
// @match       https://grok.com/*
// @match       https://x.com/i/grok/*
// @run-at      document-idle
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    // --- 核心參數 ---
    const CONFIG = {
        CONTENT_NODES: '[data-testid="user-message"], [data-testid="assistant-message"], .message-bubble',
        NOISE_NODES: 'button, .sr-only, nav, header, .tiptap, .ProseMirror, [contenteditable="true"], a, [role="button"], [role="navigation"], svg, img',
        NOISE_WORDS: ['Copy text', 'Share', 'Edit', 'Regenerate', 'Search', 'New chat', 'Home', 'Profile', 'Grok'],
        MAX_UPWARD_LOOPS: 40,
        MAX_CONTENT_WAIT: 15,
        MAX_RETRIES: 5,
        MAX_END_CHECK: 2,
        SLOW_UPWARD_WAIT: 900,
        SLOW_SCROLL_STEP: 400,
        SLOW_BASE_WAIT: 900,
        FAST_UPWARD_WAIT: 500,
        FAST_SCROLL_STEP: 2000,
        FAST_BASE_WAIT: 500,
        SNAPSHOT_STABLE_CHECKS: 3,
        SNAPSHOT_MAX_CHECKS: 15,
        SNAPSHOT_WAIT: 600
    };

    const EXPORT_MODES = {
        direct: {
            label: 'Direct',
            skipUpward: true,
            upwardWait: 0,
            scrollStep: CONFIG.FAST_SCROLL_STEP,
            baseWait: CONFIG.FAST_BASE_WAIT,
            maxEndCheck: CONFIG.MAX_END_CHECK
        },
        fast: {
            label: 'Fast',
            skipUpward: false,
            upwardWait: CONFIG.FAST_UPWARD_WAIT,
            scrollStep: CONFIG.FAST_SCROLL_STEP,
            baseWait: CONFIG.FAST_BASE_WAIT,
            maxEndCheck: CONFIG.MAX_END_CHECK
        },
        full: {
            label: 'Full',
            skipUpward: false,
            upwardWait: CONFIG.SLOW_UPWARD_WAIT,
            scrollStep: CONFIG.SLOW_SCROLL_STEP,
            baseWait: CONFIG.SLOW_BASE_WAIT,
            maxEndCheck: CONFIG.MAX_END_CHECK
        }
    };

    function sanitizeFileName(str) {
        if (!str) return '';
        return str.replace(/[\r\n]+/g, ' ')
            .replace(/[\\/:"*?<>|]+/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 60);
    }

    function getTimestamp() {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
            `_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    }

    function findScrollContainer() {
        const msg = document.querySelector(CONFIG.CONTENT_NODES);
        if (msg) {
            let curr = msg.parentElement;
            while (curr && curr !== document.body && curr !== document.documentElement) {
                const style = window.getComputedStyle(curr);
                if (['auto', 'scroll', 'overlay'].includes(style.overflowY) && curr.scrollHeight > curr.clientHeight) return curr;
                curr = curr.parentElement;
            }
        }
        let bestDiv = document.documentElement;
        let maxDiff = 0;
        document.querySelectorAll('div').forEach(el => {
            const diff = el.scrollHeight - el.clientHeight;
            if (diff > 50 && ['auto', 'scroll', 'overlay'].includes(window.getComputedStyle(el).overflowY)) {
                if (diff > maxDiff) { maxDiff = diff; bestDiv = el; }
            }
        });
        return bestDiv;
    }

    function isLastMessageLoaded(scroller) {
        const elements = scroller.querySelectorAll(CONFIG.CONTENT_NODES);
        return elements.length === 0 || elements[elements.length - 1].innerText.trim().length > 0;
    }

    function cleanContent(text) {
        return (text || "").replace(/[\r\n]{2,}/g, '\n\n').replace(/Copy text\n/gi, '').replace(/Share\n/gi, '').replace(/Grok \d\.\d.*/g, '').trim();
    }

    function determineTitle() {
        try {
            const title = document.title
                .replace(/\s*[-–—|]?\s*Grok\s*$/i, '')
                .replace(/\s*\/\s*X\s*$/i, '')
                .trim();
            if (title) return sanitizeFileName(title);
        } catch (error) {
            console.error('[Grok Exporter] 擷取標題失敗', error);
        }
        return 'Grok-Chat';
    }

    function showNotification(message, isError = false, duration = 3500) {
        document.getElementById('grok-export-toast')?.remove();
        const toast = document.createElement('div');
        toast.id = 'grok-export-toast';
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: isError ? '#d93025' : '#3c4043',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: '2147483647',
            boxShadow: '0 4px 10px rgba(0,0,0,.3)',
            fontSize: '14px',
            fontWeight: 'bold',
            maxWidth: '80vw',
            whiteSpace: 'pre-line'
        });
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }

    function showSaveModal(defaultTitle, textContent, report, onSave) {
        document.getElementById('grok-export-save-overlay')?.remove();

        const overlay = document.createElement('div');
        overlay.id = 'grok-export-save-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,.6)',
            zIndex: '2147483646',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            background: 'linear-gradient(180deg, #151515 0%, #0d0d0d 100%)',
            padding: '24px',
            borderRadius: '12px',
            width: '430px',
            maxWidth: 'calc(100vw - 40px)',
            border: '1px solid rgba(255,255,255,.14)',
            boxShadow:
                '0 24px 70px rgba(0,0,0,.68), inset 0 1px 0 rgba(255,255,255,.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            color: '#f5f5f5',
            fontFamily: 'system-ui, sans-serif'
        });

        const heading = document.createElement('h3');
        heading.textContent =
            `掃描完成：${report.messageCount} 則訊息／${textContent.length} 字`;
        Object.assign(heading.style, {
            margin: '0',
            color: '#f5f5f5',
            fontSize: '18px'
        });

        const status = document.createElement('div');
        status.textContent = report.warning || '未發現掃描斷層';
        Object.assign(status.style, {
            padding: '9px 11px',
            borderRadius: '6px',
            fontSize: '13px',
            background: report.warning
                ? 'rgba(245,158,11,.13)'
                : 'rgba(255,255,255,.055)',
            color: report.warning ? '#fbbf24' : '#c8c8c8',
            border: report.warning
                ? '1px solid rgba(245,158,11,.3)'
                : '1px solid rgba(255,255,255,.09)',
            whiteSpace: 'pre-line'
        });

        const label = document.createElement('label');
        label.textContent = '請確認檔名（無需副檔名）：';
        Object.assign(label.style, {
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

        const buttons = document.createElement('div');
        Object.assign(buttons.style, {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
        });

        const cancel = document.createElement('button');
        cancel.textContent = '取消';
        const save = document.createElement('button');
        save.textContent = '下載 .md';
        for (const button of [cancel, save]) {
            Object.assign(button.style, {
                padding: '8px 16px',
                border: '1px solid transparent',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontFamily: 'system-ui, sans-serif'
            });
        }
        Object.assign(cancel.style, {
            background: '#242424',
            color: '#e8e8e8',
            borderColor: 'rgba(255,255,255,.12)'
        });
        Object.assign(save.style, {
            background: '#10a37f',
            color: '#fff',
            borderColor: 'rgba(255,255,255,.08)'
        });

        cancel.onclick = () => overlay.remove();
        save.onclick = () => {
            onSave(input.value.trim() || 'Untitled');
            overlay.remove();
        };
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') save.click();
            if (event.key === 'Escape') overlay.remove();
        });
        overlay.onclick = event => {
            if (event.target === overlay) overlay.remove();
        };

        buttons.append(cancel, save);
        modal.append(heading, status, label, input, buttons);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        input.focus();
        input.select();
    }

    function getVisibleTimeline(scroller) {
        // querySelectorAll 會讀取容器內所有已掛載節點，不只螢幕可見區域。
        const allCandidates = Array.from(scroller.querySelectorAll(CONFIG.CONTENT_NODES));
        let validNodes = allCandidates.filter(node => {
            if (allCandidates.some(parent => parent !== node && parent.contains(node))) return false;
            if (node.closest(CONFIG.NOISE_NODES)) return false;
            const text = node.innerText.trim();
            if (text.length < 2 || CONFIG.NOISE_WORDS.includes(text)) return false;
            return true;
        });

        let timeline = [];
        validNodes.forEach(node => {
            const isUser =
                node.matches('[data-testid="user-message"]') ||
                node.closest('.items-end');
            const contentNode =
                node.querySelector('.response-content-markdown') || node;
            timeline.push({
                type: isUser ? 'user' : 'ai',
                text: contentNode.innerText.trim()
            });
        });
        return timeline;
    }

    function getTimelineSignature(timeline) {
        return timeline
            .map(message => `${message.type}\u0000${message.text}`)
            .join('\u0001');
    }

    function openTimelineSaveModal(timeline, scanWarnings = []) {
        const exportTimeline = timeline
            .map(message => ({
                type: message.type,
                text: cleanContent(message.text)
            }))
            .filter(message => message.text);

        if (!exportTimeline.length) {
            throw new Error('沒有取得任何有效對話');
        }

        let userIndex = 1;
        let modelIndex = 1;
        let output = '';
        for (const message of exportTimeline) {
            const heading = message.type === 'user'
                ? `User ${userIndex++}`
                : `Model ${modelIndex++}`;
            output += `--- [${heading}] ---\n${message.text}\n\n`;
        }

        const warning = scanWarnings.length
            ? `⚠️ ${scanWarnings.join('\n')}`
            : '';
        let title = determineTitle();
        if (warning) title += '_INCOMPLETE';
        const finalOutput = output.trimEnd() + '\n';

        showSaveModal(title, finalOutput, {
            messageCount: exportTimeline.length,
            warning
        }, finalTitle => {
            const blob = new Blob(['\uFEFF' + finalOutput], {
                type: 'text/markdown;charset=utf-8'
            });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download =
                `Grok_${sanitizeFileName(finalTitle)}_${getTimestamp()}.md`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });

        return {
            candidateCount: timeline.length,
            messageCount: exportTimeline.length,
            filteredCount: timeline.length - exportTimeline.length,
            warning
        };
    }

    function sameTurn(a, b, allowGrow) {
        if (a.type !== b.type) return false;
        if (a.text === b.text) return true;
        // ponytail: contains only on the touching last turn; whole-book includes() ate short "好"
        return allowGrow && (a.text.includes(b.text) || b.text.includes(a.text));
    }

    function mergeTimelines(master, fragment) {
        if (master.length === 0) return { merged: fragment, hasGap: false };
        if (fragment.length === 0) return { merged: master, hasGap: false };

        for (let overlapLength = Math.min(master.length, fragment.length); overlapLength > 0; overlapLength--) {
            let isMatch = true;
            for (let i = 0; i < overlapLength; i++) {
                const mItem = master[master.length - overlapLength + i];
                const fItem = fragment[i];
                if (!sameTurn(mItem, fItem, i === overlapLength - 1)) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                for (let i = 0; i < overlapLength; i++) {
                     if (fragment[i].text.length > master[master.length - overlapLength + i].text.length) {
                         master[master.length - overlapLength + i].text = fragment[i].text;
                     }
                }
                return { merged: master.concat(fragment.slice(overlapLength)), hasGap: false };
            }
        }

        return { merged: master, hasGap: true };
    }

    // --- 主流程 ---
    async function moveToTop(btn) {
        if (!btn || btn.disabled) return;
        const originalText = btn.innerText;
        btn.disabled = true;

        try {
            const scroller = findScrollContainer();
            const isWindow = (scroller === document.documentElement || scroller === document.body);
            let lastHeight = -1;
            let stable = 0;

            for (let i = 0; i < CONFIG.MAX_UPWARD_LOOPS && stable < 2; i++) {
                if (isWindow) window.scrollTo({ top: 0, behavior: 'auto' });
                else scroller.scrollTo({ top: 0, behavior: 'auto' });

                await new Promise(r => setTimeout(r, CONFIG.FAST_UPWARD_WAIT));
                const currentScroll = isWindow ? window.scrollY : scroller.scrollTop;
                const currentHeight = isWindow
                    ? document.documentElement.scrollHeight
                    : scroller.scrollHeight;
                stable = currentScroll <= 1 && currentHeight === lastHeight
                    ? stable + 1
                    : 0;
                lastHeight = currentHeight;
                btn.innerText = `定位頂端 ${i + 1}/${CONFIG.MAX_UPWARD_LOOPS}`;
            }
            if (stable < 2) {
                throw new Error('頂端內容仍在載入，請稍後再試');
            }
            showNotification('✅ 已到頂端', false, 3500);
        } catch (error) {
            console.error('[Grok Exporter] 到頂端失敗', error);
            showNotification(`❌ 到頂端失敗：${error.message}`, true, 6000);
        } finally {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    }

    async function processSnapshotExport(btn) {
        if (!btn || btn.disabled) return;
        const originalText = btn.innerText;
        btn.disabled = true;

        try {
            const scroller = findScrollContainer();
            if (!scroller.querySelector(CONFIG.CONTENT_NODES)) {
                throw new Error('目前滾動容器內找不到 Grok 訊息節點');
            }

            const isWindow =
                scroller === document.documentElement ||
                scroller === document.body;

            let lastHeight = -1;
            let topStable = 0;
            for (
                let index = 0;
                index < CONFIG.MAX_UPWARD_LOOPS && topStable < 2;
                index++
            ) {
                while (document.hidden) {
                    btn.innerText = '⏸️ 暫停｜等待頁面顯示';
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                if (isWindow) {
                    window.scrollTo({ top: 0, behavior: 'auto' });
                } else {
                    scroller.scrollTo({ top: 0, behavior: 'auto' });
                }

                await new Promise(resolve =>
                    setTimeout(resolve, CONFIG.FAST_UPWARD_WAIT)
                );
                const currentScroll = isWindow
                    ? window.scrollY
                    : scroller.scrollTop;
                const currentHeight = isWindow
                    ? document.documentElement.scrollHeight
                    : scroller.scrollHeight;
                topStable = currentScroll <= 1 && currentHeight === lastHeight
                    ? topStable + 1
                    : 0;
                lastHeight = currentHeight;
                btn.innerText =
                    `定位頂端 ${index + 1}/${CONFIG.MAX_UPWARD_LOOPS}`;
            }

            if (topStable < 2) {
                throw new Error('無法穩定回到對話最頂端');
            }

            if (isWindow) {
                window.scrollTo({ top: 0, behavior: 'auto' });
            } else {
                scroller.scrollTo({ top: 0, behavior: 'auto' });
            }
            await new Promise(resolve => setTimeout(resolve, 1000));

            let timeline = [];
            let previousSignature = '';
            let stableChecks = 0;

            for (
                let index = 0;
                index < CONFIG.SNAPSHOT_MAX_CHECKS &&
                    stableChecks < CONFIG.SNAPSHOT_STABLE_CHECKS;
                index++
            ) {
                while (document.hidden) {
                    btn.innerText = '⏸️ 暫停｜等待頁面顯示';
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                timeline = getVisibleTimeline(scroller);
                const signature = getTimelineSignature(timeline);
                stableChecks = signature && signature === previousSignature
                    ? stableChecks + 1
                    : 0;
                previousSignature = signature;
                btn.innerText =
                    `確認快照 ${stableChecks}/${CONFIG.SNAPSHOT_STABLE_CHECKS}` +
                    `｜候選 ${timeline.length} 則`;

                if (stableChecks < CONFIG.SNAPSHOT_STABLE_CHECKS) {
                    await new Promise(resolve =>
                        setTimeout(resolve, CONFIG.SNAPSHOT_WAIT)
                    );
                }
            }

            if (stableChecks < CONFIG.SNAPSHOT_STABLE_CHECKS) {
                throw new Error('頂端訊息仍在載入，請稍後再試');
            }

            const report = openTimelineSaveModal(timeline);
            console.info('[Grok Exporter] 快照報告', {
                mode: 'Snapshot',
                candidates: report.candidateCount,
                messages: report.messageCount,
                filtered: report.filteredCount
            });
        } catch (error) {
            console.error('[Grok Exporter] 快照匯出失敗', error);
            showNotification(`❌ 快照匯出失敗：${error.message}`, true, 6000);
        } finally {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    }

    // ChatGPT 匯出流程的 Grok adapter：僅保留 Grok 容器、節點與角色辨識。
    async function processAndExport(mode, btn) {
        if (!btn || btn.disabled) return;
        const scan = typeof mode === 'string' ? EXPORT_MODES[mode] : mode;
        if (!scan) return;
        const originalText = btn.innerText;
        btn.disabled = true;

        try {
            const scroller = findScrollContainer();
            if (!scroller.querySelector(CONFIG.CONTENT_NODES)) {
                throw new Error('目前滾動容器內找不到 Grok 訊息節點');
            }

            const isWindow =
                scroller === document.documentElement ||
                scroller === document.body;
            const getScrollTop = () => isWindow ? window.scrollY : scroller.scrollTop;
            const getScrollHeight = () => isWindow
                ? document.documentElement.scrollHeight
                : scroller.scrollHeight;
            const getClientHeight = () => isWindow
                ? window.innerHeight
                : scroller.clientHeight;
            const setScrollTop = value => {
                if (isWindow) window.scrollTo(0, value);
                else {
                    scroller.scrollTop = value;
                    scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
                }
            };

            let globalTimeline = [];
            const scanWarnings = [];

            async function waitIfHidden() {
                while (document.hidden) {
                    btn.innerText = `⏸️ 暫停｜已存 ${globalTimeline.length} 則`;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            if (!scan.skipUpward) {
                let lastHeight = -1;
                let stable = 0;
                for (
                    let index = 0;
                    index < CONFIG.MAX_UPWARD_LOOPS && stable < 2;
                    index++
                ) {
                    await waitIfHidden();
                    setScrollTop(0);
                    await new Promise(resolve =>
                        setTimeout(resolve, scan.upwardWait)
                    );

                    const currentHeight = getScrollHeight();
                    stable = getScrollTop() <= 1 && currentHeight === lastHeight
                        ? stable + 1
                        : 0;
                    lastHeight = currentHeight;
                    btn.innerText =
                        `定位起點 ${index + 1}/${CONFIG.MAX_UPWARD_LOOPS}`;
                }
                if (getScrollTop() > 1) {
                    throw new Error('無法穩定回到對話最頂端');
                }
                setScrollTop(0);
                await new Promise(resolve =>
                    setTimeout(resolve, Math.max(scan.upwardWait, 1000))
                );
            }

            globalTimeline = getVisibleTimeline(scroller);
            const viewport = Math.max(getClientHeight(), 400);
            const effectiveStep = Math.max(
                200,
                Math.min(scan.scrollStep, Math.floor(viewport * 0.6))
            );
            const estimatedPasses = Math.ceil(getScrollHeight() / effectiveStep);
            const maxPasses = Math.min(
                5000,
                Math.max(100, estimatedPasses * 4 + 50)
            );
            let bottomStable = 0;
            let retryCount = 0;

            for (let pass = 0; pass < maxPasses; pass++) {
                await waitIfHidden();

                const beforeTop = getScrollTop();
                const beforeHeight = getScrollHeight();
                const clientHeight = getClientHeight();
                const maxTop = Math.max(0, beforeHeight - clientHeight);
                const progress = maxTop > 0
                    ? Math.min(100, Math.round(beforeTop / maxTop * 100))
                    : 100;
                btn.innerText =
                    `掃描 ${progress}%｜已存 ${globalTimeline.length} 則`;

                let contentWaitTimer = 0;
                while (
                    !isLastMessageLoaded(scroller) &&
                    contentWaitTimer < CONFIG.MAX_CONTENT_WAIT
                ) {
                    await waitIfHidden();
                    contentWaitTimer++;
                    btn.innerText =
                        `等待內容 ${contentWaitTimer}s` +
                        `｜已存 ${globalTimeline.length} 則`;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                setScrollTop(Math.min(maxTop, beforeTop + effectiveStep));
                await new Promise(resolve =>
                    setTimeout(resolve, scan.baseWait)
                );
                await waitIfHidden();

                const fragment = getVisibleTimeline(scroller);
                const mergeResult = mergeTimelines(globalTimeline, fragment);
                if (
                    mergeResult.hasGap &&
                    fragment.length > 0 &&
                    globalTimeline.length > 0
                ) {
                    retryCount++;
                    if (retryCount <= CONFIG.MAX_RETRIES) {
                        btn.innerText =
                            `回訪缺口 ${retryCount}/${CONFIG.MAX_RETRIES}` +
                            `｜已存 ${globalTimeline.length} 則`;
                        setScrollTop(Math.max(
                            0,
                            getScrollTop() - effectiveStep * 0.5
                        ));
                        await new Promise(resolve => setTimeout(
                            resolve,
                            Math.max(1000, scan.baseWait * 2)
                        ));
                        continue;
                    }

                    scanWarnings.push(
                        `掃描位置 ${Math.round(getScrollTop())} 的內容斷層` +
                        '經回訪後仍無法安全銜接'
                    );
                    globalTimeline = globalTimeline.concat(fragment);
                    retryCount = 0;
                } else {
                    globalTimeline = mergeResult.merged;
                    retryCount = 0;
                }

                const afterTop = getScrollTop();
                const afterHeight = getScrollHeight();
                const atBottom =
                    afterHeight - getClientHeight() - afterTop <= 5;
                const didNotMove = Math.abs(afterTop - beforeTop) < 5;
                if (atBottom && didNotMove) bottomStable++;
                else bottomStable = 0;

                const afterMaxTop = Math.max(
                    0,
                    afterHeight - getClientHeight()
                );
                const afterProgress = afterMaxTop > 0
                    ? Math.min(100, Math.round(afterTop / afterMaxTop * 100))
                    : 100;
                btn.innerText =
                    `掃描 ${afterProgress}%｜已存 ${globalTimeline.length} 則`;

                if (bottomStable >= scan.maxEndCheck) break;
                if (pass === maxPasses - 1) {
                    scanWarnings.push(`掃描達到安全上限 ${maxPasses} 步`);
                }
            }

            const report = openTimelineSaveModal(globalTimeline, scanWarnings);
            btn.innerText = `整理內容｜有效 ${report.messageCount} 則`;

            console.info('[Grok Exporter] 掃描報告', {
                mode: scan.label,
                candidates: report.candidateCount,
                messages: report.messageCount,
                filtered: report.filteredCount,
                effectiveStep,
                scanWarnings
            });
        } catch (error) {
            console.error('[Grok Exporter] 匯出失敗', error);
            showNotification(`❌ 匯出失敗：${error.message}`, true, 6000);
        } finally {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    }

    function createButton() {
        if (document.getElementById('grok-export-container')) return;
        const container = document.createElement('div');
        container.id = 'grok-export-container';
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 2147483645,
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
        const makeButton = (text, action) => {
            const button = document.createElement('button');
            button.innerText = text;
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
            button.addEventListener('click', () => action(button));
            return button;
        };

        const btnTop = makeButton(
            '↑  到頂端',
            button => moveToTop(button)
        );
        const btnSnapshot = makeButton(
            '◇  快照匯出',
            button => processSnapshotExport(button)
        );
        const btnDirect = makeButton(
            '↓  往下匯出',
            button => processAndExport('direct', button)
        );
        const btnFast = makeButton(
            '»  正常匯出',
            button => processAndExport('fast', button)
        );
        const btnFull = makeButton(
            '◆  慢速匯出',
            button => processAndExport('full', button)
        );
        btnTop.title = '載入並回到對話最頂端';
        btnSnapshot.title = 'Snapshot：自動載入頂端後，直接匯出所有已載入訊息';
        btnDirect.title = 'Direct：從目前位置開始往下匯出';
        btnFast.title = 'Fast：正常速度，從頂端完整匯出';
        btnFull.title = 'Full：較慢速度，從頂端保守完整匯出';
        menu.append(btnTop, btnSnapshot, btnDirect, btnFast, btnFull);

        const fab = document.createElement('button');
        fab.innerText = '𝕏';
        fab.title = 'GYC - Grok - v1.0.0';
        fab.setAttribute('aria-label', '開啟 Grab Your Chat - Grok 工具');
        Object.assign(fab.style, {
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.18)',
            background: 'linear-gradient(180deg, #111 0%, #030303 100%)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '24px',
            fontWeight: 'bold',
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
            menu.style.transform = open
                ? 'translateY(0) scale(1)'
                : 'translateY(20px) scale(.9)';
            menu.style.pointerEvents = open ? 'auto' : 'none';
        });

        container.append(menu, fab);
        document.body.appendChild(container);
    }

    const observer = new MutationObserver(() => createButton());
    observer.observe(document.body, { childList: true, subtree: true });
    createButton();
})();
