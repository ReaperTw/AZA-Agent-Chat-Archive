// ==UserScript==
// @name         GYC - Gemini
// @namespace    https://github.com/ReaperTw/AZA-Agent-Chat-Archive
// @version      1.2.5
// @description  Grab Your Chat - Gemini 端對話匯出器；最後更新於 20261022
// @updateURL    https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-gemini.user.js
// @downloadURL  https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-gemini.user.js
// @match        https://gemini.google.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
'use strict';

// --- Pure parsers and fetch helpers (Node + browser, for tests via injected fetchImpl) ---
// MIT reference style: original concise stdlib impl based on public Gemini batchexecute protocol (hNvQHb, SNlM0e, FdrFJe, cfb2h, [cid,limit,null,1,[1],[4],null,1] selector). Source: protocol facts from live probe evidence. No AGPL copy.

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

function cleanContent(text) {
    if (!text) return "";
    return text
        .replace(/^你說了[\r\n]*/gm, '')
        .replace(/^顯示思路[\r\n]*/gm, '')
        .replace(/^Gemini 說了[\r\n]*/gm, '')
        .replace(/^image[\r\n]*/gm, '')
        .replace(/[\r\n]{2,}/g, '\n')
        .trim();
}

// Protocol fields verified against the user's hNvQHb response, not UI text.
function parseGeminiApiData(rawTurns) {
    if (!Array.isArray(rawTurns)) throw new Error('Gemini 回合格式已改變');
    const turns = [];
    const warnings = new Set();
    const seen = new Set();
    for (const turn of rawTurns.slice().reverse()) {
        if (!Array.isArray(turn)) { warnings.add('部分回合格式無法解析'); continue; }
        const id = turn[0]?.[1];
        if (id && seen.has(id)) continue;
        if (id) seen.add(id);
        const stamp = turn[4];
        const ms = Array.isArray(stamp) && Number.isFinite(stamp[0]) ? stamp[0] * 1000 + (stamp[1] || 0) / 1e6 : NaN;
        const timestamp = Number.isFinite(ms) ? new Date(ms) : null;
        const dateStr = timestamp && !Number.isNaN(timestamp.getTime()) ? timestamp.toLocaleString('zh-TW') : '';
        const user = turn[2]?.[0]?.[0];
        if (typeof user === 'string' && user.trim()) {
            turns.push({ type: 'user', text: cleanContent(user), timestamp, dateStr });
        } else {
            warnings.add('部分使用者訊息沒有文字，可能含未嵌入的附件');
            turns.push({ type: 'user', text: '> [非文字或空白使用者訊息；附件本體未嵌入]', timestamp, dateStr });
        }
        const candidates = Array.isArray(turn[3]?.[0]) ? turn[3][0] : [];
        const selectedId = turn[3]?.[3];
        const hasSelection = typeof selectedId === 'string' && selectedId.length > 0;
        const matched = hasSelection ? candidates.filter(candidate => candidate?.[0] === selectedId) : [];
        let selected;
        let isAlt = false;
        if (matched.length === 1) selected = matched;
        else if (!hasSelection && candidates.length === 1) selected = candidates;
        else {
            selected = candidates;
            isAlt = candidates.length > 1;
            warnings.add(candidates.length ? '無法確認目前回答，已保留可取得的候選回答' : '部分回合沒有回答正文，可能仍在生成');
        }
        const answers = selected.map((candidate, index) => {
            let text = candidate?.[1]?.[0];
            if (typeof text !== 'string' || !text.trim()) {
                text = '> [非文字或空白回答；本體未嵌入]';
                warnings.add('部分回答沒有文字正文');
            }
            return (isAlt ? `**候選回答 ${index + 1}（目前選取未確認）**\n\n` : '') + cleanContent(text);
        });
        if (answers.length) turns.push({ type: 'ai', text: answers.join('\n\n---\n\n'), timestamp, dateStr, isAlt });
    }
    return { turns, parseWarnings: [...warnings] };
}

function renderGeminiApiMarkdown(turns, warnings = []) {
    let out = '';
    let uIdx = 1;
    let mIdx = 1;
    for (const turn of turns) {
        // Gemini timestamps are per exchange: emit them on the user message only.
        if (turn.type === 'user' && turn.dateStr) out += `\n> **對話時間**：${turn.dateStr}\n`;
        if (turn.type === 'user') out += `\n--- [User ${uIdx++}] ---\n${turn.text}\n`;
        else out += `\n--- [Model ${mIdx++}] ---\n${turn.text}\n`;
    }
    if (warnings.length) out += `\n> **匯出注意事項**\n>\n${warnings.map(text => `> ${text}`).join('\n')}\n`;
    return out;
}

function parseGeminiRpc(text) {
    for (const line of text.replace(/^\)\]\}'\s*/, '').split('\n')) {
        if (!line.trim().startsWith('[')) continue;
        let frames;
        try { frames = JSON.parse(line); } catch { continue; }
        if (!Array.isArray(frames)) continue;
        for (const frame of frames) {
            if (frame?.[0] !== 'wrb.fr' || frame[1] !== 'hNvQHb') continue;
            if (typeof frame[2] !== 'string') throw new Error('Gemini 拒絕歷史讀取或對話不存在');
            const data = JSON.parse(frame[2]);
            if (!Array.isArray(data?.[0])) throw new Error('Gemini 歷史回應格式已改變');
            return data;
        }
    }
    throw new Error('Gemini RPC 回應無法解析');
}

async function geminiFetchHistory(cid, limit, tokens, authuser, fetchImpl = fetch) {
    if (!tokens?.SNlM0e || !tokens?.cfb2h) throw new Error('缺少 Gemini 登入資訊');
    const query = new URLSearchParams({
        rpcids: 'hNvQHb', 'source-path': authuser ? `/u/${authuser}/app` : '/app',
        bl: tokens.cfb2h, hl: 'en', _reqid: String(100000 + limit), rt: 'c', authuser: String(authuser || 0)
    });
    if (tokens.FdrFJe) query.set('f.sid', tokens.FdrFJe);
    const body = new URLSearchParams({
        at: tokens.SNlM0e,
        'f.req': JSON.stringify([[['hNvQHb', buildRpcRequest(cid, limit), null, 'generic']]])
    });
    const response = await fetchImpl('/_/BardChatUi/data/batchexecute?' + query, {
        method: 'POST', credentials: 'include', signal: AbortSignal.timeout(30000),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: body.toString()
    });
    if (!response.ok) throw new Error(`Gemini API HTTP ${response.status}`);
    return parseGeminiRpc(await response.text());
}

async function collectGeminiHistory(cid, tokens, authuser, fetchImpl = fetch) {
    const collected = new Map();
    const warnings = [];
    let exhausted = false;
    // No verified cursor request slot: grow the known history-limit field.
    for (let limit = 100; ; limit = Math.min(10000, limit * 2)) {
        let data;
        try { data = await geminiFetchHistory(cid, limit, tokens, authuser, fetchImpl); }
        catch (error) {
            if (!collected.size) throw error;
            warnings.push('擴大歷史讀取時失敗，僅保留已取得的回合');
            break;
        }
        const previous = collected.size;
        for (const turn of data[0]) {
            const id = turn?.[0]?.[1];
            if (typeof id !== 'string' || !id) {
                warnings.push('部分回合缺少 ID，無法安全合併');
                continue;
            }
            collected.set(id, turn);
        }
        if (!data[1] && data[0].length < limit) { exhausted = true; break; }
        if (limit === 10000) { warnings.push('達到 10000 回合安全上限，無法確認全文'); break; }
        if (collected.size === previous) { warnings.push('伺服器沒有回傳更早回合，仍無法確認全文'); break; }
    }
    return { rawTurns: [...collected.values()], warnings, exhausted };
}

function getAuthParams() {
    if (typeof location === 'undefined') return { authuser: 0 };
    let authuser = 0;
    const url = location.href;
    let m = url.match(/\/u\/(\d+)\//);
    if (m) authuser = parseInt(m[1], 10);
    m = url.match(/[?&]authuser=(\d+)/);
    if (m) authuser = parseInt(m[1], 10);
    return { authuser };
}


function findCurrentConversationId() {
    const match = location.pathname.match(/^\/(?:u\/\d+\/)?app\/([0-9a-f]+)\/?$/i);
    return match ? `c_${match[1]}` : null;
}

function buildRpcRequest(cid, limit) {
    return JSON.stringify([cid, limit, null, 1, [1], [4], null, 1]);
}

// Browser-only code guarded
if (typeof document !== 'undefined') {
    (function() {
        'use strict';

        // --- 參數設定 ---
        const MAX_UPWARD_LOOPS = 80;   // 向上滾動最大次數


        // 【滿速保險模式參數】
        const FAST_UPWARD_WAIT = 800;
        const FAST_SCROLL_STEP = 3000;
        const FAST_BASE_WAIT = 500;

        // --- 工具函式 (reused) ---
        function findScrollContainer() {
            let target = document.querySelector('infinite-scroller.chat-history') ||
                         document.querySelector('infinite-scroller');
            return target || document.documentElement;
        }

        function determineTitle() {
             try {
                let selectedItem = document.querySelector('mat-sidenav [aria-current="page"] .mdc-list-item__primary-text') ||
                                   document.querySelector('mat-sidenav .gds-nav-item-selected') ||
                                   document.querySelector('.gds-sidenav-list [aria-current="page"]');
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

        function showSaveModal(defaultTitle, textContent, report, onSave) {
            document.getElementById('gemini-export-modal')?.remove();
            const overlay = document.createElement('div');
            overlay.id = 'gemini-export-modal';
            Object.assign(overlay.style, {
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.6)', zIndex: '2147483646',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            });
            const modal = document.createElement('div');
            Object.assign(modal.style, {
                background: '#202124', color: '#e8eaed', padding: '24px', borderRadius: '12px',
                width: 'min(90vw, 520px)', boxShadow: '0 8px 30px rgba(0,0,0,.4)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            });
            const heading = document.createElement('div');
            heading.textContent = `${report.heading || '掃描完成'}：${report.messageCount} 則訊息／${textContent.length} 字`;
            Object.assign(heading.style, { fontSize: '18px', fontWeight: '600', marginBottom: '12px' });
            const status = document.createElement('div');
            status.textContent = [report.status, report.warning].filter(Boolean).join('\n') || '未發現匯出警告';
            Object.assign(status.style, {
                padding: '9px 11px', borderRadius: '6px', fontSize: '13px',
                background: report.warning ? 'rgba(245,158,11,.13)' : 'rgba(255,255,255,.055)',
                color: report.warning ? '#fbbf24' : '#c8c8c8',
                border: report.warning ? '1px solid rgba(245,158,11,.3)' : '1px solid rgba(255,255,255,.09)',
                whiteSpace: 'pre-line', marginBottom: '14px'
            });
            const inputLabel = document.createElement('label');
            inputLabel.textContent = '檔案名稱（不含副檔名）';
            inputLabel.htmlFor = 'gemini-export-filename';
            Object.assign(inputLabel.style, { fontSize: '13px', marginBottom: '6px', opacity: '0.8', display: 'block' });
            const input = document.createElement('input');
            input.id = 'gemini-export-filename';
            input.type = 'text';
            input.value = defaultTitle;
            Object.assign(input.style, {
                width: '100%', padding: '10px 12px', fontSize: '15px',
                border: '1px solid #5f6368', borderRadius: '8px', background: '#303134',
                color: '#e8eaed', marginBottom: '20px', boxSizing: 'border-box'
            });
            const btnContainer = document.createElement('div');
            Object.assign(btnContainer.style, { display: 'flex', justifyContent: 'flex-end', gap: '10px' });
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = '取消';
            Object.assign(cancelBtn.style, {
                padding: '8px 18px', background: '#3c4043', color: '#e8eaed',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
            });
            const saveBtn = document.createElement('button');
            saveBtn.textContent = '儲存 .md';
            Object.assign(saveBtn.style, {
                padding: '8px 18px', background: '#8ab4f8', color: '#202124',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
            });
            btnContainer.appendChild(cancelBtn);
            btnContainer.appendChild(saveBtn);
            modal.appendChild(heading);
            modal.appendChild(status);
            modal.appendChild(inputLabel);
            modal.appendChild(input);
            modal.appendChild(btnContainer);
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            input.focus();
            input.select();
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
        }

        function sameTurn(a, b, allowGrow) {
            if (a.type !== b.type) return false;
            if (a.text === b.text) return true;
            return allowGrow && (a.text.includes(b.text) || b.text.includes(a.text));
        }

        function mergeTimelines(master, fragment) {
            if (master.length === 0) return { merged: fragment, hasGap: false };
            if (fragment.length === 0) return { merged: master, hasGap: false };
            for (let overlapLength = Math.min(master.length, fragment.length); overlapLength > 0; overlapLength--) {
                let isMatch = true;
                for (let i = 0; i < overlapLength; i++) {
                    if (!sameTurn(master[master.length - overlapLength + i], fragment[i], i === overlapLength - 1)) {
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

        function collectTurns(scroller) {
            const specific = Array.from(scroller.querySelectorAll('.user-query-bubble-with-background, .model-response'));
            const nodes = specific.length
                ? specific
                : Array.from(scroller.querySelectorAll('.response-container'));
            return nodes
                .filter(node => !nodes.some(other => other !== node && other.contains(node)))
                .map(node => ({
                    type: node.classList.contains('user-query-bubble-with-background') ? 'user' : 'ai',
                    text: cleanContent(node.innerText || '')
                }))
                .filter(turn => turn.text);
        }

        async function scrollToTop(btn) {
            if (!btn) return;
            btn.disabled = true;
            const originalText = btn.innerText;
            try {
                btn.innerText = '⬆️ 狂奔至頂端中...';
                const scroller = findScrollContainer();
                let stagnantCount = 0;
                for (let i = 0; i < MAX_UPWARD_LOOPS; i++) {
                    const pre = scroller.scrollHeight;
                    scroller.scrollTop = 0;
                    await new Promise(r => setTimeout(r, FAST_UPWARD_WAIT));
                    if (scroller.scrollHeight <= pre) {
                        stagnantCount++;
                        if (stagnantCount >= 3) break;
                    } else {
                        stagnantCount = 0;
                    }
                }
                btn.innerText = '✅ 已達最頂端';
            } finally {
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerText = originalText;
                }, 2000);
            }
        }

        // Shared download helper (extracted for reuse in DOM + API paths)
        function performDownload(finalTitle, content, method) {
            const marked = `> **匯出來源**：${method}\n\n${content.replace(/^\uFEFF/, '')}`;
            const blob = new Blob(['\uFEFF' + marked], { type: 'text/markdown;charset=utf-8' });
            const anchor = document.createElement('a');
            const url = URL.createObjectURL(blob);
            anchor.href = url;
            anchor.download = `GEM_${method}_${sanitizeFileName(finalTitle)}_${getTimestamp()}.md`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        async function processAndExport(config, btn) {
            if (!btn) return;
            btn.disabled = true;
            const originalText = btn.innerText;
            const warnings = [];
            try {
                const scroller = findScrollContainer();
                {
                    btn.innerText = '定位起點...';
                    let stagnantCount = 0;
                    for (let i = 0; i < MAX_UPWARD_LOOPS; i++) {
                        const pre = scroller.scrollHeight;
                        scroller.scrollTop = 0;
                        await new Promise(r => setTimeout(r, config.upWait));
                        if (scroller.scrollHeight <= pre) {
                            stagnantCount++;
                            if (stagnantCount >= 3) break;
                        } else {
                            stagnantCount = 0;
                        }
                    }
                    scroller.scrollTop = 0;
                }

                let timeline = collectTurns(scroller);
                const step = Math.max(200, config.step || 800);
                const estimated = Math.ceil((scroller.scrollHeight || 1) / step);
                const maxPasses = Math.min(5000, Math.max(100, estimated * 4 + 50));
                let bottomStable = 0;
                let retryCount = 0;
                for (let pass = 0; pass < maxPasses; pass++) {
                    const before = scroller.scrollTop;
                    const maxTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
                    scroller.scrollTop = Math.min(maxTop, before + step);
                    await new Promise(r => setTimeout(r, config.baseWait));
                    const fragment = collectTurns(scroller);
                    const merged = mergeTimelines(timeline, fragment);
                    if (merged.hasGap && fragment.length && timeline.length) {
                        retryCount++;
                        if (retryCount <= 3) {
                            scroller.scrollTop = Math.max(0, scroller.scrollTop - step * 0.5);
                            await new Promise(r => setTimeout(r, Math.max(1000, config.baseWait * 2)));
                            continue;
                        }
                        warnings.push('掃描斷層，前後訊息可能不連續');
                        timeline = timeline.concat(
                            [{ type: 'gap', text: '⚠️ 此處掃描斷層，前後訊息可能不連續' }],
                            fragment
                        );
                        retryCount = 0;
                    } else {
                        timeline = merged.merged;
                        retryCount = 0;
                    }
                    const atBottom = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop <= 5;
                    if (atBottom && Math.abs(scroller.scrollTop - before) < 5) bottomStable++;
                    else bottomStable = 0;
                    const percent = maxTop > 0 ? Math.min(100, Math.round(scroller.scrollTop / maxTop * 100)) : 100;
                    btn.innerText = `掃描 ${percent}%｜已存 ${timeline.filter(turn => turn.type !== 'gap').length} 則`;
                    if (bottomStable >= 2) break;
                    if (pass === maxPasses - 1) warnings.push(`達到安全迴圈上限 ${maxPasses}`);
                }

                if (!timeline.some(turn => turn.type !== 'gap' && turn.text)) {
                    showNotification('❌ 未找到任何對話內容', true);
                    return;
                }

                const exportTurns = timeline.filter(turn => turn.type !== 'gap' && turn.text);
                let out = '';
                let uIdx = 1;
                let mIdx = 1;
                for (const turn of timeline) {
                    if (turn.type === 'gap') {
                        out += `\n${turn.text}\n`;
                        continue;
                    }
                    const head = turn.type === 'user' ? `User ${uIdx++}` : `Model ${mIdx++}`;
                    out += `\n--- [${head}] ---\n${turn.text}\n`;
                }
                if (warnings.length) out += `\n> **匯出注意事項**\n>\n${warnings.map(text => `> ${text}`).join('\n')}\n`;
                let title = determineTitle();
                if (warnings.length) title += '_INCOMPLETE';
                showSaveModal(title, out, {
                    heading: '掃描完成',
                    messageCount: exportTurns.length,
                    warning: warnings.length ? `⚠️ ${warnings.join('\n')}` : '',
                    status: warnings.length ? '' : '未發現掃描斷層'
                }, finalTitle => performDownload(finalTitle, out, 'DOM'));
            } catch (error) {
                console.error('[Gemini Exporter] 匯出失敗', error);
                showNotification(`❌ 匯出失敗：${error.message}`, true);
            } finally {
                btn.disabled = false;
                btn.innerText = originalText;
            }
        }

        // API export for API button: protocol-based, no raw log, warnings in body + _INCOMPLETE, no silent fallback
        async function exportViaApi(btn) {
            if (!btn) return;
            btn.disabled = true;
            const originalText = btn.innerText;
            btn.innerText = 'API 擷取中...';
            const warnings = [];
            try {
                const { authuser } = getAuthParams();
                const app = await fetch(authuser ? `/u/${authuser}/app` : '/app', { credentials: 'include', signal: AbortSignal.timeout(30000) });
                if (!app.ok) throw new Error(`Gemini 登入頁 HTTP ${app.status}`);
                const html = await app.text();
                const getToken = key => html.match(new RegExp('"' + key + '":"([^"\\\\]+)"'))?.[1] || '';
                const tokens = { SNlM0e: getToken('SNlM0e'), cfb2h: getToken('cfb2h'), FdrFJe: getToken('FdrFJe') };
                if (!tokens.SNlM0e) {
                    throw new Error('無法取得 SNlM0e token，請重新整理頁面後再試');
                }
                const cid = findCurrentConversationId();
                if (!cid) {
                    throw new Error('無法取得目前對話 cid，請用正常匯出');
                }
                const history = await collectGeminiHistory(cid, tokens, authuser);
                const allRawTurns = history.rawTurns;
                const exhausted = history.exhausted;
                warnings.push(...history.warnings);
                if (allRawTurns.length === 0) {
                    throw new Error('未取得任何對話資料');
                }
                const parseRes = parseGeminiApiData(allRawTurns);
                warnings.push(...parseRes.parseWarnings);
                const parsedTurns = parseRes.turns;
                let title = determineTitle();
                const hadIssue = warnings.length > 0 || !exhausted;
                if (hadIssue) {
                    if (warnings.length === 0) warnings.push('API 尚未確認歷史已讀取完畢');
                    title += '_INCOMPLETE';
                }
                const finalOutput = renderGeminiApiMarkdown(parsedTurns, warnings);
                showSaveModal(title, finalOutput, {
                    heading: 'API 讀取完成',
                    messageCount: parsedTurns.length,
                    warning: warnings.length ? `⚠️ ${warnings.join('\n')}` : '',
                    status: exhausted ? 'API 已回報無後續歷史；內容疑慮會另外列出。' : 'API 歷史可能尚未完整'
                }, finalTitle => performDownload(finalTitle, finalOutput, 'API'));
            } catch (error) {
                showNotification(`❌ API匯出失敗：${error.message}。可改用正常匯出。`, true);
            } finally {
                btn.disabled = false;
                btn.innerText = originalText;
            }
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
            const apiButton = makeButton('API匯出', button => exportViaApi(button));
            const normalButton = makeButton('正常匯出', button => processAndExport({
                upWait: FAST_UPWARD_WAIT,
                step: FAST_SCROLL_STEP, baseWait: FAST_BASE_WAIT
            }, button));
            btnTop.title = '只回到對話最頂端，不進行匯出';
            apiButton.title = '讀取 Gemini API 歷史；未確認全文時會警告';
            normalButton.title = '從頂端捲動掃描畫面，不使用 API';
            menu.append(btnTop, apiButton, normalButton);

            const fab = document.createElement('button');
            fab.textContent = '✦';
            fab.title = 'GYC - Gemini - v1.2.5';
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
}

// Node module.exports for pure parsers/fetch helpers (consumer edge cases use injected RPC/fetch)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderGeminiApiMarkdown,
        parseGeminiApiData,
        parseGeminiRpc,
        geminiFetchHistory,
        collectGeminiHistory,
        sanitizeFileName,
        cleanContent
    };
}
})();
