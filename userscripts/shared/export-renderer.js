// Shared Markdown rendering; embedded at build time, never loaded at runtime.
// Provider parsing, visibility and integration remain in each userscript.
    function formatTimeRange(messages, fallback = '') {
        const times = messages.map(message => message?.time || message?.createdAt || message?.date)
            .filter(Boolean).map(value => value instanceof Date ? value.toLocaleString('zh-TW') : String(value));
        const first = times[0] || fallback, last = times.at(-1);
        if (!first || !last || first === last) return first || '';
        const [firstDay] = first.split(' '), [lastDay, ...lastRest] = last.split(' ');
        return `${first} – ${firstDay === lastDay && lastRest.length ? lastRest.join(' ') : last}`;
    }

    function incompleteFromWarnings(warnings = []) {
        const missing = [
            /不完整|沒有取得全文|未取得全部|未取得完整|未確認.*歷史|無法確認.*全文|仍無法確認|後續資料|後續分頁|分頁標記|回應只有/,
            /缺少目前分支|部分父訊息|訊息鏈.*循環|分支.*(未確認|無法|缺失)|無法.*確認.*(分支|目前回答|上游|順序|頂端)|分支完整性未.*確認/,
            /無法.*(解析|識別)|文字解析未完成|未支援.*內容|正文未回傳|缺少.*(正文|ID)|沒有文字|沒有正文|沒有回答正文|沒有可識別|部分回合格式|部分非文字內容未嵌入|未載入正文|內容未載入|已略過|truncated/,
            /安全.*上限|步數上限|掃描.*上限|非底部停滯|未到達|僅保留已取得|DOM 標示|空訊息殼|nontext missing body|無法安全銜接/,
            /Artifact.*(對不上原文|片段不唯一)/
        ];
        return [...new Set(warnings.filter(Boolean).flatMap(value => String(value).split(/[；\r\n]+/))
            .map(value => value.replace(/^⚠️?\s*/, '').trim()).filter(value =>
                !/相對時間|時間戳|前置進度|思考前置|來源取得失敗/.test(value) && missing.some(pattern => pattern.test(value))))];
    }

    function buildComHeader({ site = '', url = '', time = '', incompleteReasons = [] } = {}) {
        const lines = [time && `> **對話時間**：${time}`, site && `> **來源網站**：${site}`,
            url && `> **網址**：${String(url).replace(/#.*$/, '')}`].filter(Boolean);
        let header = lines.length ? lines.join('\n>\n') + '\n\n' : '';
        const reasons = [...new Set(incompleteReasons.filter(Boolean).map(reason => String(reason).replace(/\s*\r?\n\s*/g, '；').trim()))];
        if (reasons.length) header += `> **不完整**：${reasons.join('；')}\n\n`;
        return header;
    }

    function formatComMetadata(message, bodyText = '') {
        if (!message) return [];
        const urlOf = value => {
            if (typeof value === 'string') return /^https?:\/\//i.test(value) ? value : '';
            if (!value || typeof value !== 'object') return '';
            const direct = value.url || value.href || value.link || value.metadata?.url;
            if (typeof direct === 'string' && /^https?:/i.test(direct)) return direct;
            for (const link of Array.isArray(value.links) ? value.links : []) {
                const found = typeof link === 'string' ? link : link?.url || link?.href;
                if (typeof found === 'string' && /^https?:/i.test(found)) return found;
            }
            return '';
        };
        const render = (value, field) => {
            if (value == null) return '';
            const rawName = typeof value === 'string' ? value : value.title || value.metadata?.title ||
                value.label || value.name || value.file_name || value.filename || value.alt || '';
            const name = String(rawName).replace(/\s+/g, ' ').trim().replace(/\s*\+\d+$/, '');
            if (/^\[cite(?:_start|_end)?(?::[^\]]*)?\]$/.test(name)) return '';
            const url = urlOf(value);
            if (field === 'citations' && url) {
                if (bodyText.includes(url)) return '';
                return `[${(name || url).replace(/[[\]]/g, '')}](${url})`;
            }
            if (name) return name;
            if (typeof value === 'object' && /image/i.test(String(value.type || value.content_type || ''))) return '';
            return JSON.stringify(value);
        };
        const lines = [];
        if (message.note) lines.push(String(message.note));
        for (const [field, label] of [['citations', '引用'], ['attachments', '附件'], ['process', '處理狀態']]) {
            const seen = new Set();
            const values = (Array.isArray(message[field]) ? message[field] : []).flatMap(value => {
                const text = render(value, field);
                const key = field === 'citations' ? urlOf(value) || text : text;
                if (!text || seen.has(key)) return [];
                seen.add(key);
                return [text];
            });
            if (values.length) lines.push(`${label}：${values.join('；')}`);
        }
        return lines;
    }

    function stripGeminiCiteMarkers(text) {
        let fence = null;
        return text.split('\n').map(line => {
            const marker = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
            if (fence) {
                if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
                return line;
            }
            if (marker) { fence = marker[1]; return line; }
            if (/^(?: {4}|\t)/.test(line)) return line;
            return line.replace(/((?<!`)(`+)[\s\S]*?\2(?!`))| ?\[cite(?:_start|_end)?(?::\s*[\d,\s]+)?\]/g,
                (match, code) => code || '');
        }).join('\n');
    }

    function exportBody(message) {
        const text = String(message?.text ?? '');
        return EXPORT_RENDERER_PROVIDER === 'gemini' ? stripGeminiCiteMarkers(text) : text;
    }

    function renderEntries(entries, options = {}) {
        let content = buildComHeader(options);
        let users = 0, models = 0;
        for (const { message, sources = [message], marker = '', conflict = null } of entries) {
            if (!['user', 'assistant'].includes(message.role)) throw new Error(`Unknown export role: ${message.role}`);
            const role = message.role === 'user' ? `User ${++users}` : `Model ${++models}`;
            content += `--- [${role}] ---\n\n`;
            if (marker) content += `> ${marker}\n\n`;
            const text = conflict
                ? `### API 版本（${conflict.api.role}）\n\n${exportBody(conflict.api)}\n\n### DOM 版本（${conflict.dom.role}）\n\n${exportBody(conflict.dom)}`
                : exportBody(message);
            content += text;
            const merged = { note: [...new Set(sources.map(source => source?.note).filter(Boolean))].join('\n') };
            for (const field of ['citations', 'attachments', 'process']) merged[field] = sources.flatMap(source => source?.[field] || []);
            const supplement = formatComMetadata(merged, text);
            if (supplement.length) content += '\n\n' + supplement.join('\n');
            content += '\n\n';
        }
        return content.trimEnd() + '\n';
    }

    function renderConversation(messages, options = {}) {
        return renderEntries(messages.map(message => ({ message })), {
            ...options, time: formatTimeRange(messages, options.time)
        });
    }

    function buildIntegratedMarkdown(apiMessages, domMessages, options = {}) {
        const { apiAvailable = true, domAvailable = true } = options;
        const result = integrateTranscripts(apiMessages, domMessages, options);
        const incompleteReasons = [...(options.incompleteReasons || [])];
        if (options.branchConfirmed === false) incompleteReasons.push('目前分支未確認');
        if (apiAvailable && options.apiComplete === false) incompleteReasons.push('API 歷史未取完整');
        if (domAvailable && options.domComplete === false) incompleteReasons.push('DOM 歷史未取完整');
        const header = { ...options, incompleteReasons,
            time: formatTimeRange([apiMessages, domMessages].find(list => list.some(message => message?.time || message?.createdAt || message?.date)) || [], options.time) };
        if (EXPORT_RENDERER_PROVIDER === 'chatgpt') {
            if (!result.entries.length && result.pending.length) incompleteReasons.push('沒有頁面正文；API 內容列於文末待確認');
            let content = renderEntries(result.entries.map(entry => ({
                message: entry.dom, sources: [...(entry.apiMessages || []), entry.dom]
            })), header);
            if (result.pending.length) {
                content += '\n## 待確認 API 內容（不屬於正式正文）\n\n';
                for (const item of result.pending) {
                    const text = String(item.api.text ?? '');
                    let fenceLength = 3;
                    for (const match of text.matchAll(/`+/g)) fenceLength = Math.max(fenceLength, match[0].length + 1);
                    const fence = '`'.repeat(fenceLength);
                    content += `### 待確認 API #${item.apiIndex}（${item.api.role}）\n\n${fence}text\n${text}\n${fence}\n\n`;
                    const supplement = formatComMetadata(item.api, text);
                    if (supplement.length) content += supplement.join('\n') + '\n\n';
                }
            }
            return { ...result, content: content.trimEnd() + '\n' };
        }
        const compared = apiAvailable && domAvailable;
        const visible = message => EXPORT_RENDERER_PROVIDER === 'gemini' && message?.visibleText != null
            ? { ...message, text: message.visibleText } : message;
        const entries = result.entries.map(entry => {
            const conflict = ['text', 'role'].includes(entry.kind) ? { api: visible(entry.api), dom: visible(entry.dom) } : null;
            return { message: visible(entry.api || entry.dom), sources: [entry.api, entry.dom].filter(Boolean), conflict,
                marker: conflict ? '**來源衝突，兩版並列**' :
                    compared && ['api-only', 'dom-only', 'progress'].includes(entry.kind)
                        ? `${entry.kind === 'progress' ? '前進度；' : ''}僅 ${entry.api ? 'API' : 'DOM'} 有此訊息` : '' };
        });
        return { ...result, compared, content: renderEntries(entries, header) };
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
        heading.append(el('div', 'gyc-eyebrow', `AZA-Agent-Chat-Archive / ${site}`), el('h2', '', '對話已整合'));
        const closeButton = el('button', 'gyc-close', '×');
        closeButton.setAttribute('aria-label', '關閉整合匯出結果');
        closeButton.onclick = close;
        top.append(heading, closeButton);
        panel.append(top, el('p', 'gyc-title', title));
        const stats = el('div', 'gyc-stats');
        for (const [label, value] of [['API 訊息', apiCount ?? '—'], ['頁面訊息', domCount ?? '—'], [EXPORT_RENDERER_PROVIDER === 'chatgpt' ? '正式正文' : '整合訊息', integration.entries.length]]) {
            const stat = el('div', 'gyc-stat', label);
            stat.append(el('strong', '', String(value)));
            stats.append(stat);
        }
        panel.append(stats);
        const unavailable = apiCount === null || domCount === null;
        const differences = EXPORT_RENDERER_PROVIDER === 'chatgpt' ? [] : integration.compared ? integration.comparison.differences : [];
        if (EXPORT_RENDERER_PROVIDER === 'chatgpt') {
            const verified = integration.verification.complete;
            const status = el('div', `gyc-status${!verified || unavailable ? ' gyc-warning' : ''}`);
            if (!verified || unavailable) status.setAttribute('role', 'alert');
            const statusTitle = unavailable ? '有來源取得失敗' : verified ? '訊息 ID、角色與順序已核對' : '訊息結構尚待確認';
            status.append(el('strong', '', statusTitle));
            status.append(el('span', '', '正式正文採用頁面內容；未進行 API／DOM 正文逐字比對。'));
            panel.append(status);
            if (!integration.entries.length) heading.lastChild.textContent = integration.pending.length ? '僅取得待確認 API 資料' : '未取得可匯出訊息';
            if (integration.pending.length) panel.append(el('p', 'gyc-subtle', `${integration.pending.length} 則 API 訊息另存待確認附錄，不混入正式正文。`));
        } else {
            const status = el('div', `gyc-status${differences.length || unavailable ? ' gyc-warning' : ''}`);
            if (differences.length || unavailable) status.setAttribute('role', 'alert');
            const statusTitle = unavailable ? '有來源取得失敗' : differences.length ? `發現 ${differences.length} 筆正文差異` : '兩個來源的正文相符';
            status.append(el('strong', '', statusTitle));
            status.append(el('span', '', unavailable ? '請查看下方各來源的實際錯誤。' : differences.length ? '單邊訊息已補入；衝突保留 API 與頁面兩版，不自動覆蓋。' : '相同訊息只保留一份正文；各來源原文可另存。'));
            panel.append(status);
            if (!integration.entries.length) heading.lastChild.textContent = '未取得可匯出訊息';
            if (integration.counts.progress) panel.append(el('p', 'gyc-subtle', `另保留 ${integration.counts.progress} 則 API 前進度訊息。`));
        }
        if (Object.keys(errors).length) panel.append(el('pre', '', Object.entries(errors).map(([key, value]) => `${key.toUpperCase()}：${value}`).join('\n')));
        const disclosure = (label, text, open = false) => {
            const details = el('details');
            details.open = open;
            details.append(el('summary', '', label), el('pre', '', text));
            panel.append(details);
            return details;
        };
        const actions = el('div', 'gyc-actions');
        if (EXPORT_RENDERER_PROVIDER === 'gemini') panel.append(actions);
        if (EXPORT_RENDERER_PROVIDER === 'chatgpt') {
            if (integration.verification.issues.length) {
                disclosure('查看待確認事項', integration.verification.issues.map(formatVerificationIssue).join('\n'), true);
            }
            if (integration.pending.length) {
                disclosure('待確認 API 內容（非正式正文）', integration.pending.map(item =>
                    `API #${item.apiIndex} (${item.api.role})\n${item.api.text}`
                ).join('\n\n────────────────────\n\n'));
            }
        } else if (EXPORT_RENDERER_PROVIDER === 'gemini') {
            if (differences.length) {
                const details = disclosure('查看正文差異', '');
                const preview = details.lastChild;
                const navigation = el('div', 'gyc-actions');
                const previous = el('button', '', '上一頁');
                const next = el('button', '', '下一頁');
                const position = el('span', 'gyc-subtle');
                navigation.append(previous, position, next);
                details.append(navigation);
                let page = 0;
                const pageSize = 5;
                const render = () => {
                    const start = page * pageSize;
                    preview.textContent = differences.slice(start, start + pageSize).map((item, index) => {
                        const side = (name, message, pos) => {
                            if (!message) return `${name}：沒有此訊息`;
                            const body = prepareComparisonMessage(message, name === 'API' ? 'api' : 'dom').body;
                            return `${name} #${pos} (${message.role})\n${body.slice(0, 2000)}${body.length > 2000 ? '\n[預覽已截短；完整正文請下載比對報告]' : ''}`;
                        };
                        return `差異 ${start + index + 1}\n${side('API', item.api, item.apiIndex)}\n\n${side('DOM', item.dom, item.domIndex)}`;
                    }).join('\n\n────────────────────\n\n');
                    position.textContent = `${start + 1}–${Math.min(start + pageSize, differences.length)}／${differences.length}`;
                    previous.disabled = page === 0;
                    next.disabled = start + pageSize >= differences.length;
                    preview.scrollTop = 0;
                };
                details.addEventListener('toggle', () => { if (details.open) render(); });
                previous.onclick = () => { page--; render(); };
                next.onclick = () => { page++; render(); };
            }
        } else {
            if (differences.length) {
                const text = differences.map((item, index) => {
                    const side = (name, message, pos) => message ? `${name} #${pos} (${message.role})\n${prepareComparisonMessage(message, name === 'API' ? 'api' : 'dom').body}` : `${name}：沒有此訊息`;
                    return `差異 ${index + 1}\n${side('API', item.api, item.apiIndex)}\n\n${side('DOM', item.dom, item.domIndex)}`;
                }).join('\n\n────────────────────\n\n');
                disclosure('查看正文差異', text, true);
            }
        }
        if (notes.length || report) disclosure('來源紀錄與補充資料', [...notes,
            EXPORT_RENDERER_PROVIDER === 'gemini' ? (report ? '完整逐則內容請使用「下載比對報告」。' : '') : report].filter(Boolean).join('\n\n'));
        const add = (label, action, primary = false, target = actions) => {
            if (!action) return;
            const button = el('button', primary ? 'gyc-primary' : '', label);
            button.onclick = action;
            target.append(button);
        };
        if (integration.entries.length || (EXPORT_RENDERER_PROVIDER === 'chatgpt' && integration.pending.length)) add('下載整合 Markdown', onDownload, true);
        add(EXPORT_RENDERER_PROVIDER === 'chatgpt' ? '下載核對報告' : '下載比對報告', onReport);
        if (EXPORT_RENDERER_PROVIDER !== 'gemini') panel.append(actions);
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

    function buildExportReport({ site = '', apiMessages = null, domMessages = null,
        integration, errors = {}, notes = [], details = [] }) {
        const state = (name, messages) => `${name}：${messages === null
            ? `取得失敗：${errors[name.toLowerCase()] || '未取得來源'}`
            : `取得成功，${messages.length} 則`}`;
        const count = (messages, field) => {
            if (messages === null || messages.some(message => !Array.isArray(message[field]))) return '未知';
            return messages.reduce((sum, message) => sum + message[field].length, 0);
        };
        const lines = [site && `來源網站：${site}`, state('API', apiMessages), state('DOM', domMessages),
            `正式正文：${integration.entries.length} 則`].filter(Boolean);
        if (integration.verification) {
            lines.push(`訊息結構：${integration.verification.complete ? 'ID、角色、順序已核對' : '尚待確認'}`,
                'API／DOM 正文逐字一致性：未驗證（採 DOM 正文）',
                `待確認 API：${integration.pending.length} 則`);
        } else {
            lines.push(integration.compared
                ? `正文核對：${integration.comparison.match ? '相符' : `差異 ${integration.comparison.differences.length} 筆`}`
                : '正文核對：未完成（單一來源）');
        }
        for (const [field, label] of [['citations', '引用'], ['attachments', '附件'], ['process', '處理狀態']]) {
            lines.push(`${label}：API ${count(apiMessages, field)} 項／DOM ${count(domMessages, field)} 項`);
        }
        if (integration.compared) {
            const side = (name, message, index) => message
                ? `${name} #${index} (${message.role})\n${String(message.text ?? '')}` : `${name}：沒有此訊息`;
            for (const [index, difference] of integration.comparison.differences.entries()) {
                lines.push(`差異 ${index + 1}（${difference.kind}）\n${side('API', difference.api, difference.apiIndex)}\n\n${side('DOM', difference.dom, difference.domIndex)}`);
            }
        }
        lines.push(...details.filter(Boolean), ...new Set(notes.filter(Boolean).map(String)));
        return lines.join('\n\n') + '\n';
    }

    function buildExportFilename(code, title, timestamp, debugKind = '') {
        if (!['GPT', 'CLD', 'GEM', 'Grok'].includes(code)) throw new Error(`Unknown export site code: ${code}`);
        if (!['', 'API', 'DOM', 'REPORT'].includes(debugKind)) throw new Error(`Unknown debug export kind: ${debugKind}`);
        const name = String(title || '').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').trim() || 'Chat';
        return `${code}_${name}_${timestamp}${debugKind ? `_${debugKind}` : ''}.md`;
    }
