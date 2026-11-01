// ==UserScript==
// @name         GYC - ChatGPT
// @namespace    https://github.com/ReaperTw/AZA-Agent-Chat-Archive
// @version      1.4.9
// @description  Grab Your Chat - ChatGPT 端對話匯出器；最後更新於 20261101
// @updateURL    https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-chatgpt.user.js
// @downloadURL  https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-chatgpt.user.js
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const MAX_UPWARD_LOOPS = 40;
    const RETRY_EMPTY_MAX = 3;
    const RETRY_EMPTY_WAIT = 350;
    const FAST_UPWARD_WAIT = 500;
    const FAST_SCROLL_STEP = 2000;
    const FAST_BASE_WAIT = 250;

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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

    function cleanContent(text) {
        if (!text) return '';
        return text
            .replace(/^顯示思路[\r\n]*/gm, '')
            .replace(/[\r\n]{3,}/g, '\n\n')
            .trim();
    }


    // Pure API helpers (Node + browser). Source protocol facts: current_node + mapping parent/create_time chain.
    // https://github.com/mvanhorn/agent-tincan/blob/main/extension/ops.js MIT © 2026 Matthew Charles Van Horn (reference only; original impl)
    function getConversationIdFromUrl(pathname) {
        const path = pathname ?? (typeof location !== 'undefined' ? location.pathname : '');
        const match = path.match(/^\/(?:g\/[^/]+\/)?c\/([0-9a-f-]{10,})\/?$/i);
        return match ? match[1] : null;
    }

    function isPersonalChatRoute(pathname) {
        return Boolean(getConversationIdFromUrl(pathname));
    }

    async function fetchAccessToken() {
        const response = await fetch('/api/auth/session', { credentials: 'include', signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw new Error(`登入資訊 HTTP ${response.status}`);
        const session = await response.json();
        if (!session.accessToken) throw new Error('登入資訊缺少 accessToken');
        return session.accessToken;
    }

    async function fetchConversationApi(id, token) {
        const response = await fetch(`/backend-api/conversation/${encodeURIComponent(id)}`, {
            credentials: 'include', headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(30000)
        });
        if (!response.ok) throw new Error(`對話 API HTTP ${response.status}`);
        return response.json();
    }

    function formatApiDate(timestamp) {
        if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return '';
        const date = new Date(timestamp * 1000);
        return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('zh-TW');
    }

    function parseApiConversation(payload) {
        const messages = [];
        const warnings = new Set();
        const notices = new Set();
        const mapping = payload?.mapping;
        if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) throw new Error('對話 API 缺少訊息樹');
        if (!payload.current_node) warnings.add('缺少目前分支的終點');
        if (payload.has_more || payload.next_cursor) warnings.add('API 仍有後續資料，這次沒有取得全文');
        const seen = new Set();
        let id = payload.current_node;
        let completedExchange = null;
        let excludedPreambles = 0;
        while (id) {
            if (seen.has(id)) { warnings.add('訊息鏈含循環'); break; }
            seen.add(id);
            if (!Object.hasOwn(mapping, id) || !mapping[id]) { warnings.add('部分父訊息不在回應中'); break; }
            const node = mapping[id];
            const message = node.message;
            const role = message?.author?.role;
            const content = message?.content;
            const contentType = content?.content_type;
            if (role === 'assistant' && ['thoughts', 'reasoning_recap'].includes(contentType)) {
                id = node.parent;
                continue;
            }
            const internal = message?.metadata?.is_visually_hidden_from_conversation ||
                message?.channel === 'analysis' ||
                (message?.recipient && message.recipient !== 'all');
            if (message && !['user', 'assistant', 'tool', 'system'].includes(role)) {
                warnings.add('文字解析未完成：已略過無法識別角色的訊息');
            }
            const hidden = internal;
            if (role === 'user' || (role === 'assistant' && message.channel === 'final')) {
                completedExchange = null;
            }
            // Only an explicit preamble with a completed answer in the same exchange is disposable.
            if (!hidden && role === 'assistant' && message.channel === 'commentary' &&
                message.metadata?.is_thinking_preamble_message === true &&
                completedExchange && message.metadata.turn_exchange_id === completedExchange) {
                excludedPreambles++;
                id = node.parent;
                continue;
            }
            if ((role === 'user' || role === 'assistant') && !hidden) {
                const parts = Array.isArray(content?.parts) ? content.parts : [];
                let omitted = false;
                let unknown = false;
                const text = parts.map(part => {
                    if (typeof part === 'string') return part;
                    omitted = true;
                    if (part && typeof part === 'object' && part.content_type === 'image_asset_pointer') {
                        notices.add('部分圖片內容未嵌入匯出檔');
                        return '> [圖片內容未嵌入匯出檔]';
                    }
                    unknown = true;
                    return '> [非文字內容；本體未嵌入匯出檔]';
                }).join('\n\n').trim();
                const unknownContent = contentType !== 'text' && contentType !== 'multimodal_text';
                if (unknown || unknownContent) warnings.add('部分非文字內容未嵌入匯出檔');
                if (text || omitted || unknownContent) {
                    messages.push({
                        role, text: text || '> [此訊息內容格式無法解析]', channel: message.channel ?? null,
                        sourceIds: messageSourceIds({ sourceIds: [id, message.id] }),
                        ...(Array.isArray(message.metadata?.citations) ? { citations: message.metadata.citations } : {}),
                        ...(omitted ? {
                            attachments: parts.filter(part => typeof part !== 'string')
                                .map(part => ({ type: part?.content_type || 'unknown' }))
                        } : {}),
                        create_time: message.create_time, date: formatApiDate(message.create_time)
                    });
                    if (role === 'assistant' && message.channel === 'final' &&
                        message.status === 'finished_successfully' && !unknownContent &&
                        parts.some(part => typeof part === 'string' && part.trim())) {
                        completedExchange = message.metadata?.turn_exchange_id || null;
                    }
                }
            }
            id = node.parent;
        }
        messages.reverse();
        if (excludedPreambles) notices.add(`已排除 ${excludedPreambles} 則明確標記的思考前置進度；同回合正式回答已保留`);
        return {
            title: typeof payload.title === 'string' ? payload.title : 'ChatGPT-Chat',
            messages, incomplete: warnings.size > 0,
            warning: [...warnings].join('；') || null,
            notice: [...notices].join('；') || null
        };
    }

    function buildMarkdown(parsed, sourceTitle, { source = 'API', chatTime = '', timeMarkers = [] } = {}) {
        const title = sanitizeFileName(sourceTitle || parsed.title);
        let content = `> **匯出來源**：${source}\n\n`;
        let user = 1;
        let model = 1;
        const emittedTimeMarkers = new Set();
        const appendTime = (timestamp, unlocated = false) => {
            content += `> **對話時間${unlocated ? '（未定位）' : ''}**：${timestamp}\n\n`;
        };
        if (chatTime && !timeMarkers.some(marker => marker.timestamp === chatTime)) appendTime(chatTime);
        for (const message of parsed.messages) {
            for (const marker of timeMarkers) {
                if (marker.beforeTurnIndex === message.turnIndex && !emittedTimeMarkers.has(marker.key)) {
                    appendTime(marker.timestamp);
                    emittedTimeMarkers.add(marker.key);
                }
            }
            if (message.date) appendTime(message.date);
            const heading = message.role === 'user' ? `User ${user++}` : `Model ${model++}`;
            content += `--- [${heading}] ---\n${message.text}\n\n`;
        }
        for (const marker of timeMarkers) {
            if (!emittedTimeMarkers.has(marker.key)) appendTime(marker.timestamp, true);
        }
        if (parsed.incomplete) content += `> **匯出不完整**：${parsed.warning.replace(/\r?\n/g, '\n> ')}\n`;
        if (parsed.notice) content += `> **內容提示**：${parsed.notice.replace(/\r?\n/g, '\n> ')}\n`;
        return { filename: title, content: content.trimEnd() + '\n' };
    }

    function messageSourceIds(message) {
        return [...new Set((Array.isArray(message.sourceIds) ? message.sourceIds : [])
            .filter(id => typeof id === 'string' && id.trim()).map(id => id.trim()))];
    }

    function integrateTranscripts(apiMessages, domMessages, {
        apiAvailable = true, domAvailable = true, apiComplete = true, domComplete = true
    } = {}) {
        const issues = [];
        const canCheck = apiAvailable && domAvailable;
        const byId = new Map();
        apiMessages.forEach((message, index) => {
            if (!canCheck) return;
            const ids = messageSourceIds(message);
            if (!ids.length) issues.push({ kind: 'api-id-missing', apiIndex: index + 1 });
            for (const id of ids) {
                if (!byId.has(id)) byId.set(id, new Set());
                byId.get(id).add(index);
            }
        });
        for (const indices of byId.values()) {
            if (indices.size > 1) issues.push({ kind: 'ambiguous-id' });
        }
        const claims = new Map();
        const candidates = domMessages.map(message => {
            if (!canCheck) return null;
            const ids = messageSourceIds(message);
            if (!ids.length) return { kind: 'dom-id-missing' };
            const matches = new Set();
            for (const id of ids) {
                const found = byId.get(id);
                if (!found) return { kind: 'dom-unmatched' };
                for (const index of found) matches.add(index);
            }
            if (matches.size !== 1) return { kind: 'ambiguous-id' };
            const index = matches.values().next().value;
            claims.set(index, (claims.get(index) || 0) + 1);
            return { index };
        });
        const used = new Set();
        let previous = -1;
        const entries = domMessages.map((dom, index) => {
            const entry = { dom, domIndex: index + 1, api: null, apiIndex: null };
            if (!canCheck) return entry;
            const candidate = candidates[index];
            let kind = candidate.kind;
            if (!kind && claims.get(candidate.index) !== 1) kind = 'ambiguous-id';
            if (!kind && apiMessages[candidate.index].role !== dom.role) kind = 'role';
            if (kind) {
                issues.push({ kind, domIndex: index + 1,
                    ...(candidate.index !== undefined ? { apiIndex: candidate.index + 1 } : {}) });
            } else {
                entry.api = apiMessages[candidate.index];
                entry.apiIndex = candidate.index + 1;
                used.add(candidate.index);
                if (candidate.index <= previous) issues.push({ kind: 'order', apiIndex: entry.apiIndex, domIndex: entry.domIndex });
                previous = Math.max(previous, candidate.index);
            }
            return entry;
        });
        const pending = [];
        apiMessages.forEach((api, index) => {
            if (used.has(index)) return;
            const item = { kind: 'api-unmatched', api, apiIndex: index + 1 };
            pending.push(item);
            if (canCheck) issues.push({ kind: item.kind, apiIndex: item.apiIndex });
        });
        if (!apiAvailable) issues.push({ kind: 'api-unavailable' });
        if (!domAvailable) issues.push({ kind: 'dom-unavailable' });
        if (!apiComplete) issues.push({ kind: 'api-incomplete' });
        if (!domComplete) issues.push({ kind: 'dom-incomplete' });
        return {
            entries, pending,
            verification: { complete: issues.length === 0, bodyVerified: false, issues },
            counts: { matched: used.size, unverified: entries.length - used.size, pending: pending.length }
        };
    }

    function formatVerificationIssue(issue) {
        const reasons = {
            'api-id-missing': 'API 訊息缺少可核對的 ID',
            'dom-id-missing': '頁面訊息缺少可核對的 ID',
            'dom-unmatched': '頁面 ID 不在 API 目前分支；可能是分支或擷取範圍不同',
            'ambiguous-id': '訊息 ID 重複或對應多則訊息，不能唯一配對',
            role: '同一 ID 的角色不同',
            order: '頁面順序與 API 目前分支不同',
            'api-unmatched': 'API 訊息未能與頁面唯一配對；疑似缺漏，原文保留於待確認附錄',
            'api-unavailable': 'API 取得失敗，未核對訊息結構',
            'dom-unavailable': '頁面取得失敗，沒有正式正文；API 僅保留於待確認附錄',
            'api-incomplete': 'API 歷史、分支或解析尚未確認完整',
            'dom-incomplete': '頁面掃描仍有完整性或來源警告'
        };
        return [issue.apiIndex && `API #${issue.apiIndex}`, issue.domIndex && `DOM #${issue.domIndex}`,
            reasons[issue.kind]].filter(Boolean).join(' · ');
    }

    function buildIntegratedMarkdown(apiMessages, domMessages, options = {}) {
        const { apiAvailable = true, domAvailable = true, notes = [] } = options;
        const result = integrateTranscripts(apiMessages, domMessages, options);
        const summary = result.verification.complete ? '訊息 ID、角色與順序已核對' : '訊息結構尚待確認';
        let content = `> **匯出來源**：DOM 正文；API 核對訊息完整性\n\n`;
        content += `> **核對結果**：${summary}；不代表正文逐字一致。\n\n`;
        if (!apiAvailable || !domAvailable) content += `> **來源取得失敗**：${!apiAvailable && !domAvailable ? 'API、DOM' : !apiAvailable ? 'API' : 'DOM'}。\n\n`;
        if (!domAvailable) content += '> **沒有正式正文**：以下 API 資料只供待確認，不替代頁面內容。\n\n';
        if (notes.length) content += notes.map(note => `> **來源提醒**：${String(note).replace(/\r?\n/g, '\n> ')}\n\n`).join('');
        if (result.verification.issues.length) {
            content += '> **待確認事項**：\n' + result.verification.issues
                .map(issue => `> - ${formatVerificationIssue(issue)}\n`).join('') + '\n';
        }
        const supplement = (message, source) => {
            if (!message) return '';
            const lines = [];
            const timestamp = message.createdAt || message.date || message.time;
            if (timestamp) lines.push(`> **${source} 時間**：${timestamp}`);
            if (message.note) lines.push(`**${source} 備註**\n\n${message.note}`);
            for (const [field, label] of [['citations', '引用'], ['attachments', '附件']]) {
                if (!Array.isArray(message[field]) || !message[field].length) continue;
                lines.push(`**${source} ${label}**\n\n\`\`\`json\n${JSON.stringify(message[field], null, 2)}\n\`\`\``);
            }
            return lines.length ? `\n\n${lines.join('\n\n')}` : '';
        };
        let users = 0, models = 0;
        for (const entry of result.entries) {
            const role = entry.dom.role === 'user' ? `User ${++users}` : `Model ${++models}`;
            content += `--- [${role}] ---\n\n${entry.dom.text}`;
            content += supplement(entry.api, 'API') + supplement(entry.dom, 'DOM') + '\n\n';
        }
        if (result.pending.length) {
            content += '## 待確認 API 內容（不屬於正式正文）\n\n';
            content += '尚未證實以下內容是頁面漏抓、未呈現的訊息或分支差異；保留原文，不自動補入正文。\n\n';
            for (const item of result.pending) {
                const text = String(item.api.text ?? '');
                let fenceLength = 3;
                for (const match of text.matchAll(/`+/g)) fenceLength = Math.max(fenceLength, match[0].length + 1);
                const fence = '`'.repeat(fenceLength);
                content += `### 待確認 API #${item.apiIndex}（${item.api.role}）\n\n${fence}text\n${text}\n${fence}`;
                content += supplement(item.api, 'API') + '\n\n';
            }
        }
        return { ...result, content: content.trimEnd() + '\n' };
    }

    function showIntegratedDialog({ id, site, title, apiCount, domCount, integration, errors = {}, notes = [], report = '', onDownload, onApi, onDom, onReport }) {
        document.getElementById(id)?.remove();
        const overlay = document.createElement('div');
        overlay.id = id;
        overlay.dataset.gycIntegrated = '';
        const style = document.createElement('style');
        style.textContent = `
[data-gyc-integrated]{position:fixed!important;inset:0!important;z-index:2147483646!important;background:rgba(8,12,18,.62);backdrop-filter:blur(6px);display:grid;place-items:center;padding:20px;box-sizing:border-box;font:14px/1.55 system-ui,sans-serif;color-scheme:light dark;color:light-dark(#20262d,#e7edf3)}
[data-gyc-integrated] *{box-sizing:border-box}
[data-gyc-integrated] .gyc-panel{width:min(620px,100%);max-height:88vh;overflow:auto;border:1px solid light-dark(#dbe1e7,#34404c);border-radius:20px;background:light-dark(#fff,#171d25);box-shadow:0 24px 80px #0005;padding:28px}
[data-gyc-integrated] .gyc-heading{display:flex;justify-content:space-between;align-items:start;gap:20px}
[data-gyc-integrated] h2{font:600 23px/1.3 system-ui;margin:4px 0 8px;letter-spacing:-.4px;color:inherit}
[data-gyc-integrated] .gyc-eyebrow{font-size:11px;font-weight:700;letter-spacing:1.5px;color:light-dark(#667281,#98a6b7)}
[data-gyc-integrated] .gyc-title{margin:0 0 22px;color:light-dark(#667281,#a7b3c2);overflow-wrap:anywhere}
[data-gyc-integrated] button{font:600 13px/1.4 system-ui;border:1px solid light-dark(#d6dee7,#3b4757);border-radius:10px;background:transparent;color:inherit;padding:10px 14px;cursor:pointer;transition:background .15s}
[data-gyc-integrated] button:hover{background:light-dark(#edf2f7,#273240)}
[data-gyc-integrated] button:focus-visible,[data-gyc-integrated] summary:focus-visible{outline:3px solid #5b94ff;outline-offset:3px}
[data-gyc-integrated] .gyc-close{padding:4px 10px;font-size:20px;border:0}
[data-gyc-integrated] .gyc-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:18px}
[data-gyc-integrated] .gyc-stat{padding:14px 16px;border:1px solid light-dark(#e3e8ef,#303c4b);border-radius:12px;color:light-dark(#6b7785,#9eacbe)}
[data-gyc-integrated] .gyc-stat strong{display:block;color:light-dark(#20262d,#f0f4f8);font-size:26px;font-weight:600;line-height:1.4}
[data-gyc-integrated] .gyc-status{padding:14px 16px;border-radius:12px;background:light-dark(#eef8f1,#16372b);color:light-dark(#21663a,#a4e5bb);margin:0 0 18px}
[data-gyc-integrated] .gyc-warning{background:light-dark(#fff5e5,#423019);color:light-dark(#85500c,#f5cc8f)}
[data-gyc-integrated] .gyc-status strong{display:block;margin-bottom:3px}
[data-gyc-integrated] .gyc-actions{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 0}
[data-gyc-integrated] .gyc-primary{background:light-dark(#245bc4,#89b4ff);border-color:transparent;color:light-dark(#fff,#12233f)}
[data-gyc-integrated] .gyc-primary:hover{background:light-dark(#194cae,#a9c9ff)}
[data-gyc-integrated] details{border-top:1px solid light-dark(#e3e8ef,#303c4b);padding-top:14px;margin-top:16px}
[data-gyc-integrated] summary{cursor:pointer;font-weight:600}
[data-gyc-integrated] pre{font:12px/1.65 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0 0;max-height:240px;overflow:auto;color:inherit}
[data-gyc-integrated] .gyc-subtle{color:light-dark(#667281,#a7b3c2);font-size:12px;margin:12px 0 0}
@media(max-width:480px){[data-gyc-integrated]{padding:12px}[data-gyc-integrated] .gyc-panel{padding:20px}[data-gyc-integrated] .gyc-stat{padding:10px}[data-gyc-integrated] .gyc-stat strong{font-size:22px}[data-gyc-integrated] .gyc-actions>button{flex:1 1 auto}}
`;
        const el = (tag, className, text) => {
            const node = document.createElement(tag);
            if (className) node.className = className;
            if (text !== undefined) node.textContent = text;
            return node;
        };
        const panel = el('section', 'gyc-panel');
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-label', '整合匯出結果');
        const previousFocus = document.activeElement;
        const close = () => { overlay.remove(); previousFocus?.focus?.(); };
        const top = el('div', 'gyc-heading');
        const heading = el('div');
        heading.append(el('div', 'gyc-eyebrow', `GRAB YOUR CHAT / ${site}`), el('h2', '', '對話已整合'));
        const closeButton = el('button', 'gyc-close', '×');
        closeButton.setAttribute('aria-label', '關閉整合匯出結果');
        closeButton.onclick = close;
        top.append(heading, closeButton);
        panel.append(top, el('p', 'gyc-title', title));
        const stats = el('div', 'gyc-stats');
        for (const [label, value] of [['API 訊息', apiCount ?? '—'], ['頁面訊息', domCount ?? '—'], ['正式正文', integration.entries.length]]) {
            const stat = el('div', 'gyc-stat', label);
            stat.append(el('strong', '', String(value)));
            stats.append(stat);
        }
        panel.append(stats);
        const unavailable = apiCount === null || domCount === null;
        const verified = integration.verification.complete;
        const status = el('div', `gyc-status${!verified || unavailable ? ' gyc-warning' : ''}`);
        if (!verified || unavailable) status.setAttribute('role', 'alert');
        const statusTitle = unavailable ? '有來源取得失敗' : verified ? '訊息 ID、角色與順序已核對' : '訊息結構尚待確認';
        status.append(el('strong', '', statusTitle));
        status.append(el('span', '', '正式正文採用頁面內容；未進行 API／DOM 正文逐字比對。'));
        panel.append(status);
        if (!integration.entries.length) heading.lastChild.textContent = integration.pending.length ? '僅取得待確認 API 資料' : '未取得可匯出訊息';
        if (integration.pending.length) panel.append(el('p', 'gyc-subtle', `${integration.pending.length} 則 API 訊息另存待確認附錄，不混入正式正文。`));
        if (Object.keys(errors).length) panel.append(el('pre', '', Object.entries(errors).map(([key, value]) => `${key.toUpperCase()}：${value}`).join('\n')));
        const disclosure = (label, text, open = false) => {
            const details = el('details');
            details.open = open;
            details.append(el('summary', '', label), el('pre', '', text));
            panel.append(details);
            return details;
        };
        if (integration.verification.issues.length) {
            disclosure('查看待確認事項', integration.verification.issues.map(formatVerificationIssue).join('\n'), true);
        }
        if (integration.pending.length) {
            disclosure('待確認 API 內容（非正式正文）', integration.pending.map(item =>
                `API #${item.apiIndex} (${item.api.role})\n${item.api.text}`
            ).join('\n\n────────────────────\n\n'));
        }
        if (notes.length || report) disclosure('來源紀錄與補充資料', [...notes, report].filter(Boolean).join('\n\n'));
        const actions = el('div', 'gyc-actions');
        const add = (label, action, primary = false, target = actions) => {
            if (!action) return;
            const button = el('button', primary ? 'gyc-primary' : '', label);
            button.onclick = action;
            target.append(button);
        };
        if (integration.entries.length || integration.pending.length) add('下載整合 Markdown', onDownload, true);
        add('下載核對報告', onReport);
        panel.append(actions);
        if (onApi || onDom) {
            const originals = disclosure('另存個別來源', '');
            originals.lastChild.remove();
            const row = el('div', 'gyc-actions');
            add('API 原始匯出', onApi, false, row);
            add('頁面原始匯出', onDom, false, row);
            originals.append(row);
        }
        overlay.append(style, panel);
        overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
        overlay.addEventListener('keydown', event => {
            if (event.key === 'Escape') { event.preventDefault(); close(); }
            if (event.key !== 'Tab') return;
            const focusable = [...panel.querySelectorAll('button,summary')].filter(node => node.getClientRects().length);
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        });
        document.body.append(overlay);
        (actions.querySelector('button') || closeButton).focus({ preventScroll: true });
    }

    function styleExportTools(container) {
        const fab = container.querySelector('button[aria-label*="Grab Your Chat"]');
        if (!fab) return;
        const style = document.createElement('style');
        style.textContent = `#${container.id} button:not([aria-label*="Grab Your Chat"]){font-family:system-ui,sans-serif!important;font-size:13px!important;font-weight:600!important;border-radius:10px!important;border:1px solid #71809655!important;box-shadow:0 4px 16px #0002!important;background:#202b3c!important;color:#f5f8ff!important;padding:10px 15px!important}#${container.id} button:focus-visible{outline:3px solid #89b4ff!important;outline-offset:3px}#${container.id} button:disabled{opacity:.65!important;cursor:wait!important}`;
        container.append(style);
    }

    if (typeof module !== 'undefined' && module.exports && typeof document === 'undefined') {
        module.exports = { parseApiConversation, buildMarkdown, formatApiDate, isPersonalChatRoute, getConversationIdFromUrl, integrateTranscripts, buildIntegratedMarkdown };
        return;
    }

    function determineTitle() {
        try {
            const title = document.title.replace(/\s*[-–—|]?\s*ChatGPT\s*$/i, '').trim();
            if (title) return sanitizeFileName(title);
        } catch (error) {
            console.error('[ChatGPT Exporter] 擷取標題失敗', error);
        }
        return 'ChatGPT-Chat';
    }

    function parseChatTimestamp(value) {
        const localizedPatterns = [
            /(\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日(?:\s*週[一二三四五六日天])?\s*(?:於\s*)?(?:上午|下午)\s*\d{1,2}\s*:\s*\d{2}(?::\s*\d{2})?)/,
            /(\d{1,2}\s*月\s*\d{1,2}\s*日(?:\s*週[一二三四五六日天])?\s*(?:於\s*)?(?:上午|下午)\s*\d{1,2}\s*:\s*\d{2}(?::\s*\d{2})?)/,
            /((?:今天|昨天|前天)\s*(?:於\s*)?(?:上午|下午)\s*\d{1,2}\s*:\s*\d{2}(?::\s*\d{2})?)/,
            /((?:週|星期)[一二三四五六日天]\s*(?:於\s*)?(?:上午|下午)\s*\d{1,2}\s*:\s*\d{2}(?::\s*\d{2})?)/
        ];
        const normalizedValue = String(value || '').replace(/\s+/g, ' ').trim();
        const match = localizedPatterns
            .map(pattern => normalizedValue.match(pattern))
            .find(Boolean);
        if (!match) return '';
        return match[1]
            .replace(/\s*年\s*/, '年')
            .replace(/\s*月\s*/, '月')
            .replace(/\s*日\s*/, '日 ')
            .replace(/日\s+週/, '日週')
            .replace(/日\s*(上午|下午)/, '日 於 $1')
            .replace(/(週[一二三四五六日天])\s*(上午|下午)/, '$1 於 $2')
            .replace(/((?:今天|昨天|前天)|(?:週|星期)[一二三四五六日天])\s*(上午|下午)/, '$1 於 $2')
            .replace(/於\s+/, '於 ')
            .replace(/(上午|下午)\s+/, '$1')
            .replace(/\s*:\s*/g, ':');
    }

    function findChatTimestamp(scroller) {
        const searchRoot = document.body || scroller;
        for (const element of searchRoot.querySelectorAll('[aria-label], time[datetime], [datetime]')) {
            const fromLabel = parseChatTimestamp(element.getAttribute('aria-label'));
            if (fromLabel) return fromLabel;
            const fromText = parseChatTimestamp(element.innerText || element.textContent);
            if (fromText) return fromText;
        }

        for (const value of [
            scroller.innerText,
            searchRoot.innerText,
            searchRoot.textContent
        ]) {
            const found = parseChatTimestamp(value);
            if (found) return found;
        }

        const timeElement = searchRoot.querySelector('time[datetime], [datetime]');
        if (timeElement) {
            const date = new Date(timeElement.getAttribute('datetime'));
            if (!Number.isNaN(date.getTime())) {
                const parts = new Intl.DateTimeFormat('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }).formatToParts(date);
                const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
                if (values.year && values.month && values.day && values.hour && values.minute) {
                    return `${values.year}年${values.month.replace('月', '')}月${values.day}日 於 ` +
                        `${values.dayPeriod || ''}${values.hour}:${values.minute}`;
                }
            }
        }
        return '';
    }

    function hashCode(str) {
        let hash = 2166136261;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(36);
    }

    function cssEscape(value) {
        if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
        return String(value).replace(/["\\]/g, '\\$&');
    }

    const MESSAGE_SELECTOR = '[data-message-author-role], [class~="group/user-message"], ' +
        '[data-chatgpt-selection-message-id]:has([data-markdown-text-style]), ' +
        '[data-markdown-text-style="assistant-message"]';

    function getMessageRole(node) {
        return node.getAttribute('data-message-author-role') ||
            (node.classList.contains('group/user-message') ? 'user' :
                node.hasAttribute('data-chatgpt-selection-message-id') ||
                node.closest('[data-markdown-text-style="assistant-message"]') ? 'assistant' : '');
    }

    function getScrollBounds(scroller) {
        const distance = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        return getComputedStyle(scroller).flexDirection === 'column-reverse'
            ? { oldest: -distance, newest: 0 }
            : { oldest: 0, newest: distance };
    }

    function findScrollContainer() {
        const candidates = new Set();
        for (const node of document.querySelectorAll(MESSAGE_SELECTOR)) {
            let element = node.parentElement;
            while (element && element !== document.body) {
                const style = getComputedStyle(element);
                if ((style.overflowY === 'auto' || style.overflowY === 'scroll') &&
                    element.scrollHeight > element.clientHeight + 100) {
                    candidates.add(element);
                }
                element = element.parentElement;
            }
        }
        return Array.from(candidates).sort((a, b) => b.scrollHeight - a.scrollHeight)[0] ||
            document.scrollingElement ||
            document.documentElement;
    }

    function showNotification(message, isError = false, duration = 3500) {
        document.getElementById('chatgpt-export-toast')?.remove();
        const toast = document.createElement('div');
        toast.id = 'chatgpt-export-toast';
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
        document.getElementById('chatgpt-export-save-overlay')?.remove();

        const overlay = document.createElement('div');
        overlay.id = 'chatgpt-export-save-overlay';
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
        heading.textContent = `掃描完成：${report.messageCount} 則訊息／${textContent.length} 字`;
        Object.assign(heading.style, {
            margin: '0',
            color: '#f5f5f5',
            fontSize: '18px'
        });

        const status = document.createElement('div');
        status.textContent = report.warning || report.status || '未發現未解析的訊息空殼';
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

    function getTurnEnvelope(node, scroller) {
        let element = node;
        let turnCandidate = null;
        while (element && element !== scroller && element !== document.body) {
            if (/^conversation-turn-\d+$/i.test(element.getAttribute('data-testid') || '') ||
                element.hasAttribute('data-turn-key')) {
                return element;
            }
            if (element !== node &&
                (element.hasAttribute('data-turn-id') || element.hasAttribute('data-turn'))) {
                turnCandidate = element;
            }
            element = element.parentElement;
        }
        return turnCandidate || node;
    }

    function getStableId(node, envelope, role, text) {
        const attributes = ['data-message-id', 'data-dil-source-message-id',
            'data-chatgpt-selection-message-id', 'data-chatgpt-search-unit-key',
            'data-turn-id', 'data-turn-key', 'data-turn', 'data-testid'];
        for (const source of [node, envelope]) {
            if (!source) continue;
            for (const attribute of attributes) {
                const value = source.getAttribute?.(attribute);
                if (value && (attribute !== 'data-testid' || /conversation-turn-|message/i.test(value))) {
                    return `${attribute}:${value}`;
                }
            }
            // A turn can contain several messages, including repeated user text.
            if (source === node && envelope !== node) {
                const peers = Array.from(envelope.querySelectorAll(MESSAGE_SELECTOR))
                    .filter(peer => getMessageRole(peer) === role &&
                        !peer.parentElement?.closest(MESSAGE_SELECTOR));
                if (peers.length > 1) {
                    return `turn:${envelope.getAttribute('data-turn-key') || envelope.getAttribute('data-testid')}:${role}:${peers.indexOf(node)}`;
                }
            }
        }
        return `content:${role}:${hashCode(text)}`;
    }

    function getTurnIndex(node, envelope) {
        const values = [
            node.getAttribute?.('data-testid'),
            envelope?.getAttribute?.('data-testid'),
            node.getAttribute?.('data-turn'),
            envelope?.getAttribute?.('data-turn')
        ].filter(Boolean);
        for (const value of values) {
            const match = String(value).match(/(?:conversation-turn-|^)(\d+)$/i);
            if (match) return Number(match[1]);
        }
        return null;
    }

    function getMessageOrder(node) {
        const unit = node.closest('[data-chatgpt-search-unit-key]');
        const match = unit?.getAttribute('data-chatgpt-search-unit-key')
            ?.match(/^fallback-turn-(\d+):(\d+):(user|assistant)$/);
        if (!match) return null;
        let index = Number(match[2]);
        if (node.hasAttribute('data-chatgpt-copy-reference')) {
            const references = Array.from(unit.querySelectorAll('[data-dil-source-message-id][data-chatgpt-copy-reference]'))
                .map(part => Number(part.getAttribute('data-chatgpt-copy-reference')));
            // The unit key names its last message; copy references locate its earlier parts.
            index += Number(node.getAttribute('data-chatgpt-copy-reference')) - Math.max(...references);
        }
        return { turn: Number(match[1]), index };
    }

    function collectTimeMarkers(scroller, state) {
        const turnNodes = Array.from(
            scroller.querySelectorAll('[data-testid^="conversation-turn-"]')
        );
        if (!turnNodes.length) return;

        for (const element of scroller.querySelectorAll('[aria-label]')) {
            // 對話正文內自己的 aria-label 不屬於日期分隔線。
            if (element.closest('[data-testid^="conversation-turn-"]')) continue;

            const timestamp = parseChatTimestamp(element.getAttribute('aria-label'));
            if (!timestamp) continue;

            const nextTurn = turnNodes.find(turn =>
                Boolean(element.compareDocumentPosition(turn) & Node.DOCUMENT_POSITION_FOLLOWING)
            );
            if (!nextTurn) continue;

            const beforeTurnIndex = getTurnIndex(nextTurn, nextTurn);
            if (!Number.isInteger(beforeTurnIndex)) continue;

            const key = `${beforeTurnIndex}:${timestamp}`;
            if (!state.timeMarkers.has(key)) {
                state.timeMarkers.set(key, {
                    key,
                    timestamp,
                    beforeTurnIndex,
                    sequence: state.nextTimeSequence++
                });
            }
        }
    }

    function getDomSourceIds(node) {
        const ids = ['data-message-id', 'data-chatgpt-selection-message-id', 'data-dil-source-message-id']
            .map(attribute => node.getAttribute(attribute)).filter(Boolean);
        if (ids.length) return messageSourceIds({ sourceIds: ids });
        const unit = node.closest('[data-chatgpt-search-message-ids]');
        return messageSourceIds({ sourceIds: (unit?.getAttribute('data-chatgpt-search-message-ids') || '').split(/\s+/) });
    }

    function extractText(node, role) {
        const readText = element => {
            if (!element) return '';
            const renderedText = (element.innerText || '').trim();
            return renderedText || (element.textContent || '').trim();
        };
        const selectors = role === 'assistant'
            ? ['[data-markdown-text-style]', '.markdown', '[class*="markdown"]',
                '.prose', '[data-message-content]']
            : ['[data-message-content]', '.whitespace-pre-wrap', '[class*="whitespace-pre-wrap"]',
                '[class~="bg-user-message"]'];
        for (const selector of selectors) {
            const parts = Array.from(node.querySelectorAll(selector))
                .filter(part => !part.parentElement?.closest(selector));
            const text = parts.map(readText).filter(Boolean).join('\n').trim();
            if (text) return text;
        }
        return readText(node);
    }

    // Only controls explicitly marked as citations are removable. Ordinary links,
    // domains and +N text remain part of the body without structural evidence.
    const CITATION_SELECTOR = '[data-testid*="citation"], [data-citation], [class*="citation"], [data-d-component="popover-trigger"][data-d-inline-text]:has([data-d-component="badge"] [data-d-component="favicon"])';

    function extractDomContent(node, role) {
        const controls = Array.from(node.querySelectorAll(CITATION_SELECTOR))
            .filter(control => !control.parentElement?.closest(CITATION_SELECTOR));
        const citations = controls.map(control => ({
            label: (control.innerText || control.textContent || '').trim(),
            links: Array.from(control.querySelectorAll('a[href]'), link => ({
                label: (link.innerText || link.textContent || '').trim(),
                url: link.href
            }))
        }));
        const hasCode = role === 'assistant' && node.querySelector('pre code, code:not(pre code)');
        const hasTable = role === 'assistant' && node.querySelector('table');
        if (!controls.length && !hasCode && !hasTable) return { text: cleanContent(extractText(node, role)), citations };
        const clone = node.cloneNode(true);
        clone.querySelectorAll(CITATION_SELECTOR).forEach(control => control.remove());
        let prefix = 'GYC_DOM_CODE_';
        while ((node.textContent || '').includes(prefix)) prefix += '_';
        const values = [];
        if (role === 'assistant') {
            const elements = Array.from(clone.querySelectorAll('pre, code'))
                .filter(element => element.tagName !== 'CODE' || !element.closest('pre'));
            for (const element of elements) {
                const code = element.tagName === 'PRE' ? element.querySelector('code') : element;
                if (!code) continue;
                const value = (code.textContent || '').replace(/\r\n?/g, '\n');
                values.push(element.tagName === 'PRE' ? value.replace(/\n$/, '') : value);
                element.textContent = `${prefix}${values.length - 1}_END`;
            }
        }
        for (const table of clone.querySelectorAll('table')) {
            let text = Array.from(table.rows, row =>
                Array.from(row.cells, cell => cell.innerText || cell.textContent || '').join('\t')
            ).join('\n');
            for (const [index, value] of values.entries()) {
                text = text.replaceAll(`${prefix}${index}_END`, value);
            }
            const replacement = document.createElement('div');
            replacement.style.whiteSpace = 'pre';
            replacement.textContent = `${prefix}${values.length}_END`;
            values.push(text);
            table.replaceWith(replacement);
        }
        Object.assign(clone.style, {
            position: 'fixed', left: '-10000px', top: '0',
            width: `${node.getBoundingClientRect().width}px`, opacity: '0', pointerEvents: 'none'
        });
        node.parentElement.appendChild(clone);
        try {
            let text = cleanContent(extractText(clone, role));
            for (const [index, value] of values.entries()) text = text.replaceAll(`${prefix}${index}_END`, value);
            return { text, citations };
        } finally {
            clone.remove();
        }
    }

    function extractAttachmentSummary(node) {
        const summaries = [];
        const images = Array.from(node.querySelectorAll('img'))
            .filter(image => !image.closest(CITATION_SELECTOR) && (image.getAttribute('src') || image.getAttribute('alt')));
        if (images.length) {
            const descriptions = [...new Set(images
                .map(image => (image.getAttribute('alt') || image.getAttribute('aria-label') || '').trim())
                .filter(value => value && !/^(image|圖片)$/i.test(value)))]
                .slice(0, 3);
            summaries.push(`圖片附件 × ${images.length}` +
                (descriptions.length ? `（${descriptions.join('、')}）` : ''));
        }
        const videos = node.querySelectorAll('video').length;
        if (videos) summaries.push(`影片附件 × ${videos}`);
        const audios = node.querySelectorAll('audio').length;
        if (audios) summaries.push(`音訊附件 × ${audios}`);
        const canvases = node.querySelectorAll('canvas').length;
        if (canvases && !images.length) summaries.push(`畫布／圖片內容 × ${canvases}`);

        const fileNodes = Array.from(node.querySelectorAll(
            '[data-testid*="attachment"], [data-testid*="file"], a[download]'
        ));
        if (fileNodes.length) {
            const names = [...new Set(fileNodes
                .map(element => (
                    element.getAttribute('download') ||
                    element.getAttribute('aria-label') ||
                    element.getAttribute('title') ||
                    element.textContent ||
                    ''
                ).trim())
                .filter(Boolean))]
                .slice(0, 3);
            summaries.push(`檔案附件 × ${fileNodes.length}` +
                (names.length ? `（${names.join('、')}）` : ''));
        }
        return summaries.length
            ? `> [非文字內容：${summaries.join('；')}；附件本體未嵌入匯出檔]`
            : '';
    }

    function getViewportSignature(scroller) {
        const samples = Array.from(scroller.querySelectorAll(MESSAGE_SELECTOR))
            .map(node => {
                const role = getMessageRole(node);
                const text = (node.innerText || node.textContent || '').trim();
                return `${role}:${text.length}:${text.slice(0, 32)}`;
            });
        return hashCode(samples.join('|'));
    }

    function isExpandedActivity(node, scroller) {
        if (getDomSourceIds(node).length || node.hasAttribute('data-message-author-role') ||
            node.querySelector('[data-dil-source-message-id]')) return false;
        const envelope = getTurnEnvelope(node, scroller);
        for (let ancestor = node; ancestor && ancestor !== envelope; ancestor = ancestor.parentElement) {
            const header = ancestor.firstElementChild;
            if (!header) continue;
            const controls = [header, ...header.children];
            if (controls.some(control => control.matches('button[aria-expanded]') &&
                /^(?:處理時間為|Thought for)\s/.test(control.textContent.trim()))) return true;
        }
        return false;
    }

    function collectSnapshot(scroller, snapshotMap, state) {
        collectTimeMarkers(scroller, state);

        const all = Array.from(scroller.querySelectorAll(MESSAGE_SELECTOR));
        const candidates = all.filter(node => {
            const ancestor = node.parentElement?.closest(MESSAGE_SELECTOR);
            return (!ancestor || !scroller.contains(ancestor)) && !isExpandedActivity(node, scroller);
        }).flatMap(node => {
            const parts = Array.from(node.querySelectorAll('[data-dil-source-message-id]'))
                .filter(part => !part.parentElement?.closest('[data-dil-source-message-id]'));
            return getMessageRole(node) === 'assistant' && parts.length ? parts : [node];
        });
        if (getScrollBounds(scroller).oldest < 0) {
            candidates.sort((a, b) =>
                a.getBoundingClientRect().top - b.getBoundingClientRect().top
            );
        }
        candidates.sort((a, b) => {
            const left = getMessageOrder(a), right = getMessageOrder(b);
            return left && right ? left.turn - right.turn || left.index - right.index : 0;
        });

        let added = 0;
        let empty = 0;
        let emptyVisible = 0;
        const scrollerRect = scroller.getBoundingClientRect();

        for (const node of candidates) {
            const role = getMessageRole(node);
            if (role !== 'user' && role !== 'assistant') continue;

            const envelope = getTurnEnvelope(node, scroller);
            const attachmentSummary = extractAttachmentSummary(node);
            const content = extractDomContent(node, role);
            const text = content.text && attachmentSummary
                ? `${content.text}\n\n${attachmentSummary}`
                : content.text || attachmentSummary;
            const sourceIds = getDomSourceIds(node);
            const key = getStableId(node, envelope, role, text);
            const turnIndex = getTurnIndex(node, envelope);
            state.seenKeys.add(key);

            if (!text) {
                empty++;
                const rect = envelope.getBoundingClientRect();
                const nearViewport =
                    rect.bottom >= scrollerRect.top - scroller.clientHeight * 0.25 &&
                    rect.top <= scrollerRect.bottom + scroller.clientHeight * 0.25;
                if (nearViewport) {
                    emptyVisible++;
                    if (!snapshotMap.has(key)) {
                        state.pendingEmpty.set(key, { key, role, turnIndex });
                    }
                }
                continue;
            }

            state.pendingEmpty.delete(key);
            const existing = snapshotMap.get(key);
            if (!existing) {
                snapshotMap.set(key, {
                    key,
                    role,
                    text,
                    sourceIds,
                    citations: content.citations,
                    attachments: attachmentSummary ? [attachmentSummary] : [],
                    turnIndex,
                    messageOrder: getMessageOrder(node),
                    sequence: state.nextSequence++
                });
                added++;
            } else if (text.length > existing.text.length) {
                existing.text = text;
                existing.citations = content.citations;
                existing.attachments = attachmentSummary ? [attachmentSummary] : [];
            }
            if (existing && sourceIds.length) existing.sourceIds = sourceIds;
        }

        state.emptyObservations += emptyVisible;
        return { added, empty, emptyVisible, visible: candidates.length };
    }

    async function collectWithRetries(scroller, snapshotMap, state) {
        let result = collectSnapshot(scroller, snapshotMap, state);
        for (let retry = 0; retry < RETRY_EMPTY_MAX && result.emptyVisible > 0; retry++) {
            await delay(RETRY_EMPTY_WAIT);
            result = collectSnapshot(scroller, snapshotMap, state);
            if (result.emptyVisible === 0) break;
        }
        return result;
    }

    function findPendingNode(scroller, item) {
        if (item.key.startsWith('data-message-id:')) {
            const id = item.key.slice('data-message-id:'.length);
            const node = scroller.querySelector(`[data-message-id="${cssEscape(id)}"]`);
            if (node) return node;
        }
        if (Number.isInteger(item.turnIndex)) {
            const turn = scroller.querySelector(
                `[data-testid="conversation-turn-${item.turnIndex}"]`
            );
            if (turn) return turn.querySelector('[data-message-author-role]') || turn;
        }
        return null;
    }

    async function doubleCheckPending(scroller, snapshotMap, state, button, waitMs) {
        const queue = Array.from(state.pendingEmpty.values())
            .filter(item => !snapshotMap.has(item.key))
            .sort((a, b) => {
                if (Number.isInteger(a.turnIndex) && Number.isInteger(b.turnIndex)) {
                    return a.turnIndex - b.turnIndex;
                }
                return 0;
            });

        let recovered = 0;
        for (let index = 0; index < queue.length; index++) {
            const item = queue[index];
            if (snapshotMap.has(item.key)) continue;
            button.textContent = `二次回訪空殼 ${index + 1}/${queue.length}` +
                (Number.isInteger(item.turnIndex) ? `｜turn ${item.turnIndex}` : '');

            let node = findPendingNode(scroller, item);
            if (!node) continue;
            getTurnEnvelope(node, scroller).scrollIntoView({
                behavior: 'auto',
                block: 'center',
                inline: 'nearest'
            });
            scroller.dispatchEvent(new Event('scroll', { bubbles: true }));

            for (let retry = 0; retry < RETRY_EMPTY_MAX + 2; retry++) {
                await delay(Math.max(waitMs, 650));
                collectSnapshot(scroller, snapshotMap, state);
                if (snapshotMap.has(item.key)) {
                    recovered++;
                    break;
                }
                const nudge = retry % 2 === 0 ? 80 : -80;
                const bounds = getScrollBounds(scroller);
                scroller.scrollTop = Math.max(bounds.oldest, Math.min(
                    bounds.newest, scroller.scrollTop + nudge
                ));
                scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
                node = findPendingNode(scroller, item);
                if (node) {
                    getTurnEnvelope(node, scroller).scrollIntoView({
                        behavior: 'auto',
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }
        }
        state.doubleCheckAttempted = queue.length;
        state.doubleCheckRecovered = recovered;
    }

    async function moveToTop(scroller, waitMs, button) {
        let stable = 0;
        let previousSignature = '';
        for (let index = 0; index < MAX_UPWARD_LOOPS; index++) {
            scroller.scrollTop = getScrollBounds(scroller).oldest;
            scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
            await delay(waitMs);
            const signature = getViewportSignature(scroller);
            const loadingOlder = /loading older messages|載入較早的訊息|載入舊訊息/i.test(
                scroller.querySelector('.flex.justify-center.py-4')?.textContent || ''
            );
            const atOldest = Math.abs(scroller.scrollTop - getScrollBounds(scroller).oldest) <= 3;
            if (!loadingOlder && atOldest && signature === previousSignature) stable++;
            else stable = 0;
            previousSignature = signature;
            button.textContent = `${loadingOlder ? '載入較早訊息' : '定位起點'}… ${index + 1}/${MAX_UPWARD_LOOPS}`;
            if (stable >= 2) return true;
        }
        return false;
    }

    async function scrollToTop(button) {
        if (!button || button.disabled) return;
        const originalText = button.textContent;
        button.disabled = true;
        try {
            const scroller = findScrollContainer();
            const reached = await moveToTop(scroller, FAST_UPWARD_WAIT, button);
            showNotification(
                reached ? '✅ 已到達目前對話頂端' : '⚠️ 無法確認已到最頂端',
                !reached
            );
        } catch (error) {
            console.error('[ChatGPT Exporter] 直達頂端失敗', error);
            showNotification(`❌ 直達頂端失敗：${error.message}`, true);
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    async function processAndExport(config, button, collectOnly = false) {
        if (!button || (button.disabled && !collectOnly)) return;
        const originalText = button.textContent;
        button.disabled = true;

        try {
            const scroller = findScrollContainer();
            if (!scroller.querySelector(MESSAGE_SELECTOR)) {
                throw new Error('目前滾動容器內找不到對話訊息節點');
            }

            const reachedTop = await moveToTop(scroller, config.upWait, button);
            if (!reachedTop) throw new Error('較早訊息仍在載入，無法確認對話頂端');
            await delay(Math.max(config.upWait, 1000));
            config.checkScope?.();
            let chatTime = findChatTimestamp(scroller);

            const snapshotMap = new Map();
            const state = {
                nextSequence: 0,
                nextTimeSequence: 0,
                emptyObservations: 0,
                seenKeys: new Set(),
                pendingEmpty: new Map(),
                timeMarkers: new Map()
            };
            const scanWarnings = [];
            const sweepCount = Math.max(1, Number(config.sweeps) || 1);
            const viewport = Math.max(scroller.clientHeight, 400);
            const step = Math.max(200, Math.min(config.step, Math.floor(viewport * 0.6)));
            const estimatedPasses = Math.ceil(scroller.scrollHeight / step);
            const maxPasses = Math.min(5000, Math.max(100, estimatedPasses * 4 + 50));

            for (let sweep = 0; sweep < sweepCount; sweep++) {
                if (sweep > 0) {
                    const reachedTop = await moveToTop(
                        scroller,
                        config.upWait || FAST_UPWARD_WAIT,
                        button
                    );
                    if (!reachedTop) {
                        scanWarnings.push(`第 ${sweep + 1} 輪無法確認已回到頂端`);
                        continue;
                    }
                }

                const countAtStart = snapshotMap.size;
                let bottomStable = 0;
                let stallCount = 0;
                let previousSignature = '';
                await collectWithRetries(scroller, snapshotMap, state);

                for (let pass = 0; pass < maxPasses; pass++) {
                    config.checkScope?.();
                    const beforeTop = scroller.scrollTop;
                    const bounds = getScrollBounds(scroller);
                    scroller.scrollTop = Math.min(bounds.newest, beforeTop + step);
                    scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
                    await delay(config.baseWait);

                    if (!chatTime && sweep === 0 && pass < 12) {
                        chatTime = findChatTimestamp(scroller);
                    }

                    const result = await collectWithRetries(scroller, snapshotMap, state);
                    const signature = getViewportSignature(scroller);
                    const currentBounds = getScrollBounds(scroller);
                    const bottomGap = currentBounds.newest - scroller.scrollTop;
                    const atBottom = bottomGap <= 5;

                    if (atBottom && signature === previousSignature && result.added === 0) {
                        bottomStable++;
                    } else {
                        bottomStable = 0;
                    }

                    const moved = Math.abs(scroller.scrollTop - beforeTop) >= 5;
                    if (!moved && !atBottom && result.added === 0) stallCount++;
                    else stallCount = 0;

                    const totalDistance = currentBounds.newest - currentBounds.oldest;
                    const percent = totalDistance > 0
                        ? Math.min(100, Math.round(
                            (scroller.scrollTop - currentBounds.oldest) / totalDistance * 100
                        ))
                        : 100;
                    button.textContent = sweepCount > 1
                        ? `救援第 ${sweep + 1}/${sweepCount} 輪 ${percent}%｜聯集 ${snapshotMap.size} 則`
                        : `動態掃描 ${percent}%｜已存 ${snapshotMap.size} 則`;

                    if (bottomStable >= 2) break;
                    if (stallCount >= 8) {
                        scanWarnings.push(
                            `第 ${sweep + 1} 輪在非底部停滯（scrollTop=${Math.round(scroller.scrollTop)}）`
                        );
                        break;
                    }
                    previousSignature = signature;
                    if (pass === maxPasses - 1) {
                        scanWarnings.push(`第 ${sweep + 1} 輪達到安全迴圈上限 ${maxPasses}`);
                    }
                }

                for (let index = 0; index < 3; index++) {
                    await delay(config.baseWait);
                    collectSnapshot(scroller, snapshotMap, state);
                }
                console.info(`[ChatGPT Exporter] 第 ${sweep + 1}/${sweepCount} 輪完成`, {
                    total: snapshotMap.size,
                    newlyRecovered: snapshotMap.size - countAtStart
                });
            }

            await doubleCheckPending(scroller, snapshotMap, state, button, config.baseWait);
            config.checkScope?.();

            const messages = Array.from(snapshotMap.values()).sort((a, b) => {
                if (a.messageOrder && b.messageOrder) {
                    return a.messageOrder.turn - b.messageOrder.turn || a.messageOrder.index - b.messageOrder.index;
                }
                if (Number.isInteger(a.turnIndex) && Number.isInteger(b.turnIndex)) {
                    return a.turnIndex - b.turnIndex || a.sequence - b.sequence;
                }
                return a.sequence - b.sequence;
            });
            if (!messages.length) throw new Error('掃描完成，但沒有取得任何非空白對話');

            const unresolved = Array.from(state.pendingEmpty.values())
                .filter(item => !snapshotMap.has(item.key));
            const warnings = [...scanWarnings];
            if (!chatTime && state.timeMarkers.size === 0) {
                warnings.push('已完成全文掃描，但未取得對話頂端時間戳');
            }
            if (unresolved.length) {
                const indexes = unresolved
                    .map(item => item.turnIndex)
                    .filter(Number.isInteger);
                warnings.push(
                    `${unresolved.length} 個具有唯一 ID 的訊息空殼經逐一回訪後仍未載入正文` +
                    (indexes.length ? `（turn ${indexes.join('、')}）` : '')
                );
            }
            const warning = warnings.length ? `⚠️ ${warnings.join('\n')}` : '';

            const timeMarkers = Array.from(state.timeMarkers.values())
                .sort((a, b) =>
                    a.beforeTurnIndex - b.beforeTurnIndex ||
                    a.sequence - b.sequence
                );
            if (collectOnly) return {
                messages, warning, incomplete: Boolean(warning),
                historyComplete: scanWarnings.length === 0 && unresolved.length === 0, chatTime, timeMarkers
            };

            let title = determineTitle();
            if (warning) title += '_INCOMPLETE';
            const { content: finalOutput } = buildMarkdown({
                messages, incomplete: Boolean(warning), warning
            }, title, { source: 'DOM', chatTime, timeMarkers });
            showSaveModal(title, finalOutput, {
                messageCount: messages.length,
                warning
            }, finalTitle => {
                const blob = new Blob(['\uFEFF' + finalOutput], {
                    type: 'text/markdown;charset=utf-8'
                });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download =
                    `GPT_DOM_${sanitizeFileName(finalTitle)}_${getTimestamp()}.md`;
                document.body.appendChild(anchor);
                anchor.click();
                anchor.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });

            console.info('[ChatGPT Exporter] 掃描報告', {
                messages: messages.length,
                effectiveStep: step,
                uniqueIdsSeen: state.seenKeys.size,
                unresolvedEmpty: unresolved.length,
                doubleCheckAttempted: state.doubleCheckAttempted || 0,
                doubleCheckRecovered: state.doubleCheckRecovered || 0,
                sweeps: sweepCount,
                chatTime: chatTime || null,
                timeMarkers: timeMarkers.map(marker => ({
                    timestamp: marker.timestamp,
                    beforeTurnIndex: marker.beforeTurnIndex
                })),
                scanWarnings
            });
        } catch (error) {
            if (collectOnly) throw error;
            console.error('[ChatGPT Exporter] 匯出失敗', error);
            showNotification(`❌ 匯出失敗：${error.message}`, true, 6000);
        } finally {
            if (!collectOnly) {
                button.disabled = false;
                button.textContent = originalText;
            }
        }
    }

    async function processApiExport(button) {
        if (!button || button.disabled) return;
        const originalText = button.textContent;
        button.disabled = true;
        try {
            if (!isPersonalChatRoute()) {
                throw new Error('API匯出不支援目前網址或群聊，請用正常匯出');
            }
            const id = getConversationIdFromUrl();
            if (!id) throw new Error('URL 中找不到 conversation id');
            const token = await fetchAccessToken();
            const payload = await fetchConversationApi(id, token);
            const parsed = parseApiConversation(payload);
            if (!parsed.messages.length) throw new Error('API 沒有可匯出的可見訊息');
            const { filename, content } = buildMarkdown(parsed, payload && payload.title);
            const finalName = `GPT_API_${sanitizeFileName(filename)}_${getTimestamp()}${parsed.incomplete ? '_INCOMPLETE' : ''}`;
            showSaveModal(finalName, content, { messageCount: parsed.messages.length, warning: parsed.warning, status: parsed.notice || '未發現匯出警告' }, (name) => {
                const blob = new Blob(["\uFEFF" + content], { type: 'text/markdown;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${name}.md`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1500);
            });
        } catch (error) { showNotification('API匯出失敗，請用正常匯出', true);
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    function downloadCombinedFile(name, content) {
        const url = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: 'text/markdown;charset=utf-8' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${name}.md`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    function showCombinedResults(title, api, dom, errors) {
        const warnings = [
            api?.warning && `API：${api.warning}`,
            api?.notice && `API：${api.notice}`,
            dom?.warning && `DOM：${dom.warning}`,
            dom?.chatTime && `DOM 對話時間：${dom.chatTime}`,
            ...(dom?.timeMarkers || []).map(marker => `DOM 時間標記（原始訊息位置 ${marker.beforeTurnIndex}）：${marker.timestamp}`)
        ].filter(Boolean);
        const integration = buildIntegratedMarkdown(api?.messages || [], dom?.messages || [], {
            apiAvailable: Boolean(api), domAvailable: Boolean(dom),
            apiComplete: !api?.incomplete, domComplete: dom?.historyComplete ?? !dom?.incomplete, notes: warnings
        });
        const metadata = [
            ...(api?.messages || []).map((message, index) => ({ source: 'API', index: index + 1, ...message })),
            ...(dom?.messages || []).map((message, index) => ({ source: 'DOM', index: index + 1, ...message }))
        ];
        const report = [
            `API：${api ? api.messages.length + ' 則' : '失敗：' + errors.api}`,
            `DOM：${dom ? dom.messages.length + ' 則' : '失敗：' + errors.dom}`,
            `正式正文：${integration.entries.length} 則；API ID 配對：${integration.counts.matched} 則；待確認 API：${integration.pending.length} 則`,
            `訊息結構：${integration.verification.complete ? 'ID、角色、順序已核對' : '尚待確認'}；正文逐字一致性：未驗證（採 DOM 正文）`,
            ...integration.verification.issues.map(formatVerificationIssue),
            ...integration.pending.map(item => `待確認 API #${item.apiIndex} (${item.api.role})：\n${item.api.text}`),
            '引用與附件為各來源補充資料，分別保留；未驗證內容一致性。',
            ...metadata.filter(item => item.citations?.length || item.attachments?.length).map(item => {
                const fields = [];
                if (item.citations?.length) fields.push(`引用 ${JSON.stringify(item.citations)}`);
                if (item.attachments?.length) fields.push(`附件 ${JSON.stringify(item.attachments)}`);
                return `${item.source} #${item.index}：${fields.join('；')}`;
            }),
            ...warnings
        ].join('\n\n') + '\n';
        const base = `GPT_${sanitizeFileName(title) || 'ChatGPT-Chat'}_${getTimestamp()}`;
        showIntegratedDialog({
            id: 'chatgpt-export-save-overlay', site: 'ChatGPT', title,
            apiCount: api ? api.messages.length : null, domCount: dom ? dom.messages.length : null,
            integration, errors, notes: warnings, report,
            onDownload: () => downloadCombinedFile(`${base}_COMBINED`, integration.content),
            onApi: api ? () => downloadCombinedFile(`${base}_API`, buildMarkdown(api, title).content) : null,
            onDom: dom ? () => downloadCombinedFile(`${base}_DOM`, buildMarkdown(dom, title, {
                source: 'DOM', chatTime: dom.chatTime, timeMarkers: dom.timeMarkers
            }).content) : null,
            onReport: () => downloadCombinedFile(`${base}_VERIFICATION`, report)
        });
    }

    async function processCombinedExport(button) {
        if (!button || button.disabled) return;
        const originalText = button.textContent;
        const scope = location.href;
        const title = determineTitle();
        let changed = false;
        const monitor = setInterval(() => { if (location.href !== scope) changed = true; }, 100);
        const checkScope = () => {
            if (changed || location.href !== scope) {
                changed = true;
                throw new Error('收集期間對話網址已變更，無法比對不同對話');
            }
        };
        let api = null;
        let dom = null;
        const errors = {};
        button.disabled = true;
        try {
            try {
                const id = getConversationIdFromUrl(new URL(scope).pathname);
                if (!id) throw new Error('API 不支援目前網址或群聊');
                button.textContent = '取得 API 對話…';
                const token = await fetchAccessToken();
                const payload = await fetchConversationApi(id, token);
                api = parseApiConversation(payload);
                if (!api.messages.length) {
                    api = null;
                    throw new Error('API 沒有可匯出的可見訊息');
                }
            } catch (error) {
                errors.api = error.message || String(error);
            }
            try {
                checkScope();
                dom = await processAndExport({
                    upWait: FAST_UPWARD_WAIT, step: FAST_SCROLL_STEP, baseWait: FAST_BASE_WAIT, checkScope
                }, button, true);
                checkScope();
            } catch (error) {
                dom = null;
                errors.dom = error.message || String(error);
            }
            showCombinedResults(title, api, dom, errors);
        } catch (error) {
            showNotification(`綜合匯出失敗：${error.message || String(error)}`, true, 6000);
        } finally {
            clearInterval(monitor);
            button.disabled = false;
            button.textContent = originalText;
        }
    }


    function createButton() {
        if (document.getElementById('chatgpt-export-fab-container')) return;

        const container = document.createElement('div');
        container.id = 'chatgpt-export-fab-container';
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
            button.addEventListener('click', handler);
            return button;
        };

        const topButton = makeButton(
            '↑  到頂端',
            event => scrollToTop(event.currentTarget)
        );
        const apiButton = makeButton('API匯出', event => processApiExport(event.currentTarget));
        const combinedButton = makeButton('綜合匯出', event => processCombinedExport(event.currentTarget));
        const normalButton = makeButton('正常匯出', event => processAndExport({
            upWait: FAST_UPWARD_WAIT,
            step: FAST_SCROLL_STEP, baseWait: FAST_BASE_WAIT
        }, event.currentTarget));
        topButton.title = '只回到對話最頂端，不進行匯出';
        apiButton.title = '讀取個人對話 API；群聊請用正常匯出';
        combinedButton.title = '以頁面為正式正文，API 核對訊息 ID、角色與順序；未配對資料另列待確認';
        normalButton.title = '從頂端捲動掃描畫面，不使用 API';
        menu.append(topButton, combinedButton, apiButton, normalButton);

        const fab = document.createElement('button');
        fab.innerHTML = `
            <svg viewBox="0 0 24 24" width="31" height="31"
                aria-hidden="true" focusable="false"
                style="display:block;pointer-events:none">
                <path fill="currentColor"
                    d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654 2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
            </svg>`;
        fab.title = "GYC - ChatGPT 1.4.9";
        fab.setAttribute('aria-label', '開啟 Grab Your Chat - ChatGPT 工具');
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
        styleExportTools(container);
    }

    const observer = new MutationObserver(createButton);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    createButton();
})();
