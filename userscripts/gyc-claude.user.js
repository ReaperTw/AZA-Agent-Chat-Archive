// ==UserScript==
// @name         GYC - Claude
// @namespace    https://github.com/ReaperTw/AZA-Agent-Chat-Archive
// @version      1.2.0
// @description  Grab Your Chat - Claude 端對話匯出器；最後更新於 20261018
// @updateURL    https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-claude.user.js
// @downloadURL  https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-claude.user.js
// @match        https://claude.ai/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function (root) {
    'use strict';

    // Claude recycles off-screen turns. Full export reads the same-origin conversation API.
    // ponytail: no slow scroll export until a stepped scrollTop sweep is measured against aria-setsize.

    function sanitizeFileName(str) {
        if (!str) return '';
        return String(str).replace(/[\r\n]+/g, ' ')
            .replace(/[\\/:"*?<>|]+/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 60);
    }

    function getTimestamp(date = new Date()) {
        const pad = n => String(n).padStart(2, '0');
        return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
            `_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    }

    function buildDownloadName(title, timestamp) {
        return `Claude_${sanitizeFileName(title) || 'Claude-Chat'}_${timestamp}.md`;
    }

    function readCookie(cookie, name) {
        const match = String(cookie || '').match(
            new RegExp('(?:^|;\\s*)' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)')
        );
        if (!match) return '';
        try {
            return decodeURIComponent(match[1]);
        } catch (error) {
            return match[1];
        }
    }

    function conversationIdFromPath(pathname) {
        const parts = String(pathname || '').split('/').filter(Boolean);
        for (let i = parts.length - 1; i >= 0; i--) {
            let part = parts[i];
            try {
                part = decodeURIComponent(part);
            } catch (error) {
                // keep the raw segment
            }
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(part)) {
                return part;
            }
        }
        return '';
    }

    function cleanContent(text) {
        if (!text) return '';
        return String(text).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    function formatChatTime(iso) {
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) return '';
        const parts = new Intl.DateTimeFormat('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).formatToParts(date);
        const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
        if (!values.year || !values.month || !values.day || !values.hour || !values.minute) return '';
        return `${values.year}年${String(values.month).replace('月', '')}月${values.day}日 於 ` +
            `${values.dayPeriod || ''}${values.hour}:${values.minute}`;
    }

    function dayKey(iso) {
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) return '';
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }

    function orderCurrentBranch(data, warnings) {
        const all = Array.isArray(data?.chat_messages) ? data.chat_messages : [];
        const byUuid = new Map();
        for (const message of all) {
            if (message?.uuid) byUuid.set(message.uuid, message);
        }

        const leafId = data?.current_leaf_message_uuid;
        if (leafId && byUuid.has(leafId)) {
            const path = [];
            const seen = new Set();
            let current = byUuid.get(leafId);
            let broken = false;
            while (current && !seen.has(current.uuid)) {
                seen.add(current.uuid);
                path.push(current);
                const parentId = current.parent_message_uuid;
                // Claude uses a synthetic root UUID; it is not a missing message.
                if (!parentId || parentId === '00000000-0000-4000-8000-000000000000') break;
                const parent = byUuid.get(parentId);
                if (!parent) {
                    broken = true;
                    break;
                }
                current = parent;
            }
            if (broken) warnings.push('分支上游有訊息不在回應裡，匯出可能不完整');
            if (path.length) return path.reverse();
        }

        if (all.length) {
            warnings.push('無法確認目前分支，已改依 index 排序；若曾重新生成，可能不是畫面上的那一條');
        }
        return [...all].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    }

    function contentBlocks(message) {
        if (Array.isArray(message?.content)) return message.content;
        if (typeof message?.content === 'string') return [{ type: 'text', text: message.content }];
        return [];
    }

    function fenceFor(source) {
        const runs = String(source).match(/`+/g) || [];
        const longest = runs.reduce((max, run) => Math.max(max, run.length), 0);
        return '`'.repeat(Math.max(3, longest + 1));
    }

    function fenced(label, source, lang) {
        const fence = fenceFor(source);
        return `**${label}**\n\n${fence}${lang || ''}\n${source}\n${fence}`;
    }

    function collectArtifacts(messages, warnings) {
        const artifacts = new Map();
        for (const message of messages) {
            for (const block of contentBlocks(message)) {
                if (block?.type !== 'tool_use' || block.name !== 'artifacts') continue;
                const input = block.input && typeof block.input === 'object' ? block.input : {};
                const id = input.id || '__artifact__';
                let artifact = artifacts.get(id);
                if (!artifact) {
                    artifact = { content: '' };
                    artifacts.set(id, artifact);
                }
                if (input.command === 'update') {
                    if (typeof input.old_str === 'string' && typeof input.new_str === 'string') {
                        const at = artifact.content.indexOf(input.old_str);
                        if (at === -1) {
                            warnings.push(`Artifact「${artifact.title || id}」有一段更新對不上原文`);
                        } else {
                            if (artifact.content.indexOf(input.old_str, at + input.old_str.length) !== -1) {
                                warnings.push(`Artifact「${artifact.title || id}」更新片段不唯一，只替換第一處`);
                            }
                            // function replacer: "$&" / "$$" in new_str must stay literal
                            artifact.content = artifact.content.replace(input.old_str, () => input.new_str);
                        }
                    }
                } else if (typeof input.content === 'string') {
                    artifact.content = input.content;
                }
                if (input.title) artifact.title = input.title;
                if (input.type) artifact.type = input.type;
                if (input.language) artifact.language = input.language;
                artifact.lastBlock = block;
                artifact.lastVersionUuid = input.version_uuid || null;
            }
        }
        return artifacts;
    }

    function renderToolUse(block, artifacts, info) {
        const input = block.input && typeof block.input === 'object' ? block.input : {};
        const name = block.name || '';
        if (name === 'artifacts') {
            const artifact = artifacts.get(input.id || '__artifact__');
            if (!artifact || !artifact.content) return '';
            const isLast = artifact.lastVersionUuid
                ? input.version_uuid === artifact.lastVersionUuid
                : block === artifact.lastBlock;
            if (!isLast) return '';
            const kinds = {
                'application/vnd.ant.react': ['jsx', 'React'],
                'text/html': ['html', 'HTML'],
                'image/svg+xml': ['svg', 'SVG'],
                'application/vnd.ant.mermaid': ['mermaid', 'Mermaid'],
                'text/markdown': ['markdown', 'Markdown'],
                'application/vnd.ant.code': [artifact.language || '', artifact.language || 'Code']
            };
            const kind = kinds[artifact.type] || [artifact.language || '', artifact.language || ''];
            const label = `Artifact：${artifact.title || 'untitled'}` +
                (kind[1] ? `（${kind[1]}）` : '');
            return fenced(label, artifact.content, kind[0]);
        }
        if (name === 'create_file' && typeof input.file_text === 'string' && input.file_text) {
            const file = String(input.path || 'file').split('/').pop();
            const ext = file.includes('.') ? file.split('.').pop().toLowerCase() : '';
            const langs = {
                py: 'python', js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
                md: 'markdown', html: 'html', css: 'css', json: 'json', sh: 'bash',
                yml: 'yaml', yaml: 'yaml', sql: 'sql'
            };
            return fenced(`檔案：${file}`, input.file_text, langs[ext] || '');
        }
        if (name === 'visualize:show_widget' && typeof input.widget_code === 'string' && input.widget_code) {
            return fenced(`Widget：${input.title || 'untitled'}`, input.widget_code, 'jsx');
        }
        if (name && !info.skippedTools.includes(name)) info.skippedTools.push(name);
        return '';
    }

    function describeAttachments(message) {
        const notes = [];
        const inlined = [];
        for (const file of message.files || []) {
            const name = file.file_name || '未命名檔案';
            if (file.file_kind === 'image') notes.push(`圖片 ${name}`);
            else if (file.file_kind === 'document') {
                const pages = file.document_asset?.page_count;
                notes.push(`文件 ${name}${pages ? ` ${pages} 頁` : ''}`);
            } else notes.push(`檔案 ${name}${file.file_kind ? ` ${file.file_kind}` : ''}`);
        }
        for (const attachment of message.attachments || []) {
            const name = attachment.file_name || attachment.name || '附件';
            const extracted = typeof attachment.extracted_content === 'string'
                ? attachment.extracted_content.trim()
                : '';
            if (!extracted) {
                notes.push(`附件 ${name}`);
                continue;
            }
            const quoted = extracted.split('\n').map(line => line ? `> ${line}` : '>').join('\n');
            inlined.push(`> **附件：${name}**\n>\n${quoted}`);
        }
        const summary = notes.length
            ? `> [非文字內容：${notes.join('；')}；附件本體未嵌入匯出檔]`
            : '';
        return [summary, ...inlined].filter(Boolean).join('\n\n');
    }

    function mapRole(sender, warnings, seen) {
        if (sender === 'human' || sender === 'user') return 'user';
        if (sender === 'assistant') return 'assistant';
        const key = sender == null ? '' : String(sender);
        if (!seen.has(key)) {
            seen.add(key);
            warnings.push(sender == null
                ? '有訊息缺少 sender，已當作 Model'
                : `未預期的 sender「${sender}」，已當作 Model`);
        }
        return 'assistant';
    }

    function renderBlock(block, artifacts, info) {
        if (!block || typeof block !== 'object') return '';
        if (block.type === 'text') return typeof block.text === 'string' ? block.text.trim() : '';
        if (block.type === 'image') return '> [非文字內容：訊息內圖片；本體未嵌入匯出檔]';
        if (block.type === 'document') return '> [非文字內容：訊息內文件；本體未嵌入匯出檔]';
        if (block.type !== 'tool_use') return '';
        return renderToolUse(block, artifacts, info);
    }

    function renderMessages(ordered, warnings, info) {
        const artifacts = collectArtifacts(ordered, warnings);
        const seenSenders = new Set();
        const messages = [];
        let truncated = 0;
        for (const message of ordered) {
            const parts = [];
            const attachment = describeAttachments(message);
            if (attachment) parts.push(attachment);
            for (const block of contentBlocks(message)) {
                const rendered = renderBlock(block, artifacts, info);
                if (rendered) parts.push(rendered);
            }
            if (!parts.length && typeof message.text === 'string' && message.text.trim()) {
                parts.push(message.text.trim());
            }
            const text = cleanContent(parts.join('\n\n'));
            if (!text) continue;
            const item = {
                role: mapRole(message.sender, warnings, seenSenders),
                text,
                createdAt: message.created_at || '',
                note: ''
            };
            if (message.truncated) {
                truncated++;
                item.note = '> **可能截斷**：來源資料標記為 truncated，正文可能不完整。';
            } else if (message.stop_reason === 'user_canceled') {
                item.note = '> **已中斷**：這則回應在完成前被停止。';
                info.interrupted++;
            }
            messages.push(item);
        }
        if (truncated) {
            warnings.push(`${truncated} 則訊息被標記為 truncated，正文可能不完整`);
        }
        return messages;
    }

    function buildMarkdown(messages) {
        if (!messages?.length) return '';
        let output = '';
        let userIndex = 1;
        let modelIndex = 1;
        let previousDay = '';
        for (const message of messages) {
            const day = dayKey(message.createdAt);
            if (day && day !== previousDay) {
                const label = formatChatTime(message.createdAt);
                if (label) output += `> **對話時間**：${label}\n\n`;
                previousDay = day;
            }
            const heading = message.role === 'assistant'
                ? `Model ${modelIndex++}`
                : `User ${userIndex++}`;
            output += `--- [${heading}] ---\n${message.text}`;
            if (message.note) output += `\n\n${message.note}`;
            output += '\n\n';
        }
        return output.trimEnd() + '\n';
    }

    function exportConversation(data) {
        if (!data || typeof data !== 'object' || !Array.isArray(data.chat_messages)) {
            throw new Error('API 回應沒有 chat_messages，端點格式可能已變');
        }
        const warnings = [];
        const info = { interrupted: 0, skippedTools: [] };
        if (data.has_more || data.next_cursor) {
            warnings.push('API 回應帶有後續分頁標記，這次匯出可能不是全部訊息');
        }
        const reported = data.message_count ?? data.chat_messages_count;
        if (Number.isInteger(reported) && reported > data.chat_messages.length) {
            warnings.push(`API 回報 ${reported} 則，這次回應只有 ${data.chat_messages.length} 則`);
        }
        const messages = renderMessages(orderCurrentBranch(data, warnings), warnings, info);
        const unique = [...new Set(warnings)];
        let markdown = buildMarkdown(messages);
        if (unique.length) {
            markdown += `\n\n> **匯出不完整**\n>\n${unique.map(text => `> ${text}`).join('\n')}\n`;
        }
        return { messages, warnings: unique, info, markdown };
    }

    const api = {
        readCookie,
        conversationIdFromPath,
        exportConversation,
        sanitizeFileName,
        buildDownloadName,
        buildMarkdown,
        nextPageUrl,
        mergeConversationPages
    };

    if (typeof module !== 'undefined' && module.exports && !root.document) {
        module.exports = api;
    }
    if (!root.document) return;


    function determineTitle(apiName) {
        const fromApi = sanitizeFileName(apiName);
        if (fromApi) return fromApi;
        try {
            const title = root.document.title.replace(/\s*[-–—|]?\s*Claude\s*$/i, '').trim();
            const cleaned = sanitizeFileName(title);
            if (cleaned && !/^claude$/i.test(cleaned)) return cleaned;
        } catch (error) {
            console.error('[Claude Exporter] 擷取標題失敗', error);
        }
        return 'Claude-Chat';
    }

    function showNotification(message, isError = false, duration = 3500) {
        root.document.getElementById('claude-export-toast')?.remove();
        const toast = root.document.createElement('div');
        toast.id = 'claude-export-toast';
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
        root.document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }

    function showSaveModal(defaultTitle, textContent, report, onSave) {
        root.document.getElementById('claude-export-save-overlay')?.remove();
        const overlay = root.document.createElement('div');
        overlay.id = 'claude-export-save-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,.6)',
            zIndex: '2147483646',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        const modal = root.document.createElement('div');
        Object.assign(modal.style, {
            background: 'linear-gradient(180deg, #151515 0%, #0d0d0d 100%)',
            padding: '24px',
            borderRadius: '12px',
            width: '430px',
            maxWidth: 'calc(100vw - 40px)',
            border: '1px solid rgba(255,255,255,.14)',
            boxShadow: '0 24px 70px rgba(0,0,0,.68), inset 0 1px 0 rgba(255,255,255,.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            color: '#f5f5f5',
            fontFamily: 'system-ui, sans-serif'
        });

        const heading = root.document.createElement('h3');
        heading.textContent = `掃描完成：${report.messageCount} 則訊息／${textContent.length} 字`;
        Object.assign(heading.style, { margin: '0', color: '#f5f5f5', fontSize: '18px' });

        const status = root.document.createElement('div');
        status.textContent = report.warning || report.status || '未發現未解析的訊息空殼';
        Object.assign(status.style, {
            padding: '9px 11px',
            borderRadius: '6px',
            fontSize: '13px',
            background: report.warning ? 'rgba(245,158,11,.13)' : 'rgba(255,255,255,.055)',
            color: report.warning ? '#fbbf24' : '#c8c8c8',
            border: report.warning
                ? '1px solid rgba(245,158,11,.3)'
                : '1px solid rgba(255,255,255,.09)',
            whiteSpace: 'pre-line'
        });

        const label = root.document.createElement('label');
        label.textContent = '請確認檔名（無需副檔名）：';
        Object.assign(label.style, { fontSize: '14px', color: '#c8c8c8' });

        const input = root.document.createElement('input');
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

        const buttons = root.document.createElement('div');
        Object.assign(buttons.style, {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
        });
        const cancel = root.document.createElement('button');
        cancel.textContent = '取消';
        const save = root.document.createElement('button');
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
        root.document.body.appendChild(overlay);
        input.focus();
        input.select();
    }

    function openSave(title, markdown, report) {
        const finalOutput = markdown.trimEnd() + '\n';
        showSaveModal(title, finalOutput, report, finalTitle => {
            const blob = new Blob(['\uFEFF' + finalOutput], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const anchor = root.document.createElement('a');
            anchor.href = url;
            anchor.download = buildDownloadName(finalTitle, getTimestamp());
            root.document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
    }

    function statusFromInfo(info) {
        const bits = ['未發現未解析的訊息空殼'];
        if (info.interrupted) bits.push(`${info.interrupted} 則回應在完成前被停止`);
        return bits.join('。');
    }

    async function resolveOrgId() {
        const fromCookie = readCookie(root.document.cookie, 'lastActiveOrg');
        if (fromCookie) return fromCookie;
        try {
            const response = await fetch('/api/organizations', { credentials: 'include' });
            if (!response.ok) return '';
            const data = await response.json();
            const list = Array.isArray(data) ? data : (data.organizations || []);
            for (const item of list) {
                const id = item && (item.uuid || item.id);
                if (id) return String(id);
            }
        } catch (error) {
            console.warn('[Claude Exporter] 無法列出 organizations', error);
        }
        return '';
    }

    function nextPageUrl(cursor) {
        if (typeof cursor !== 'string' || !cursor) return '';
        if (/^https?:\/\//i.test(cursor) || cursor.startsWith('/')) return cursor;
        return '';
    }

    function mergeConversationPages(pages) {
        const base = { ...(pages[0] || {}) };
        const seen = new Set();
        const messages = [];
        for (const page of pages) {
            for (const message of page.chat_messages || []) {
                const key = message && message.uuid;
                if (key && seen.has(key)) continue;
                if (key) seen.add(key);
                messages.push(message);
            }
        }
        const last = pages[pages.length - 1] || {};
        base.chat_messages = messages;
        base.has_more = Boolean(last.has_more || last.next_cursor);
        base.next_cursor = last.next_cursor || '';
        return base;
    }

    async function readConversationPage(url) {
        let response;
        try {
            response = await fetch(url, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            throw new Error(`連不到 Claude：${error.message}。請確認網路後重試`);
        }
        if (!response.ok) {
            const hint = response.status === 401 || response.status === 403
                ? '。請重新整理並確認已登入'
                : response.status === 404
                    ? '。若這是專案頁而不是對話頁，請先打開對話'
                    : '';
            throw new Error(`Claude API 失敗（HTTP ${response.status}）${hint}`);
        }
        try {
            return await response.json();
        } catch (error) {
            throw new Error(`Claude API 回應無法解析：${error.message}`);
        }
    }

    async function fetchConversation() {
        const conversationId = conversationIdFromPath(root.location.pathname);
        if (!conversationId) {
            throw new Error('請先開啟一篇 Claude 對話（目前網址沒有對話 ID）');
        }
        const orgId = await resolveOrgId();
        if (!orgId) {
            throw new Error('讀不到登入組織（lastActiveOrg）。請重新登入後再試');
        }
        // @grant none keeps this in the page context so the session cookie is sent.
        let url = `/api/organizations/${encodeURIComponent(orgId)}/chat_conversations/` +
            `${encodeURIComponent(conversationId)}?tree=true&rendering_mode=messages&render_all_tools=true`;
        const pages = [];
        const seen = new Set();
        for (let page = 0; page < 20 && url && !seen.has(url); page++) {
            seen.add(url);
            const data = await readConversationPage(url);
            pages.push(data);
            url = nextPageUrl(data.next_cursor);
        }
        return mergeConversationPages(pages);
    }


    async function runExclusive(button, fn) {
        if (!button || button.disabled) return;
        const originalText = button.textContent;
        button.disabled = true;
        try {
            await fn(button);
        } catch (error) {
            console.error('[Claude Exporter] 失敗', error);
            showNotification(`❌ ${error.message}`, true, 6000);
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    function processApiExport(button) {
        return runExclusive(button, async btn => {
            btn.textContent = '讀取對話…';
            const data = await fetchConversation();
            const result = exportConversation(data);
            if (!result.messages.length) throw new Error('這篇對話沒有可匯出的內容');
            if (result.info.skippedTools.length) {
                console.debug('[Claude Exporter] 已略過工具', result.info.skippedTools.join(', '));
            }
            console.info('[Claude Exporter] 讀取報告', {
                messages: result.messages.length,
                warnings: result.warnings,
                interrupted: result.info.interrupted
            });
            const warning = result.warnings.join('\n');
            let title = determineTitle(data.name);
            if (warning) title += '_INCOMPLETE';
            openSave(title, result.markdown, {
                heading: '讀取完成',
                messageCount: result.messages.length,
                warning: warning ? `⚠️ ${warning}` : '',
                status: statusFromInfo(result.info)
            });
        });
    }


    function createButton() {
        if (!root.document.body || root.document.getElementById('claude-export-fab-container')) return;

        const container = root.document.createElement('div');
        container.id = 'claude-export-fab-container';
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

        const menu = root.document.createElement('div');
        Object.assign(menu.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '7px',
            padding: '8px',
            background: 'rgba(8,8,8,.88)',
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: '18px',
            boxShadow: '0 16px 40px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04)',
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
            boxShadow: '0 4px 12px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.04)',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            transition:
                'background .16s ease, border-color .16s ease, ' +
                'transform .16s ease, box-shadow .16s ease'
        };
        const makeButton = (text, handler) => {
            const button = root.document.createElement('button');
            button.textContent = text;
            Object.assign(button.style, commonStyle);
            button.addEventListener('mouseenter', () => {
                button.style.background = 'linear-gradient(180deg, #292929 0%, #202020 100%)';
                button.style.borderColor = 'rgba(255,255,255,.24)';
                button.style.transform = 'translateY(-1px)';
                button.style.boxShadow =
                    '0 7px 18px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.07)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.background = 'linear-gradient(180deg, #1d1d1d 0%, #151515 100%)';
                button.style.borderColor = 'rgba(255,255,255,.12)';
                button.style.transform = 'translateY(0)';
                button.style.boxShadow =
                    '0 4px 12px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.04)';
            });
            button.addEventListener('mousedown', () => {
                button.style.background = '#0b0b0b';
                button.style.transform = 'translateY(0)';
            });
            button.addEventListener('mouseup', () => {
                button.style.background = 'linear-gradient(180deg, #292929 0%, #202020 100%)';
                button.style.transform = 'translateY(-1px)';
            });
            button.addEventListener('click', handler);
            return button;
        };

        const exportButton = makeButton('»  正常匯出', event => processApiExport(event.currentTarget));
        exportButton.title = '正常匯出：讀目前分支，不靠捲動';
        menu.append(exportButton);

        const fab = root.document.createElement('button');
        fab.textContent = '✳';
        fab.title = 'GYC - Claude - v1.2.0';
        fab.setAttribute('aria-label', '開啟 Grab Your Chat - Claude 工具');
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
            fontSize: '28px',
            lineHeight: '1',
            boxShadow: '0 8px 22px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.08)',
            transition: 'transform .25s ease, border-color .16s ease, box-shadow .16s ease'
        });
        fab.addEventListener('mouseenter', () => {
            fab.style.borderColor = 'rgba(255,255,255,.38)';
            fab.style.boxShadow =
                '0 10px 28px rgba(0,0,0,.58), inset 0 1px 0 rgba(255,255,255,.12)';
        });
        fab.addEventListener('mouseleave', () => {
            fab.style.borderColor = 'rgba(255,255,255,.18)';
            fab.style.boxShadow =
                '0 8px 22px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.08)';
        });

        let open = false;
        fab.addEventListener('click', () => {
            open = !open;
            fab.style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)';
            menu.style.opacity = open ? '1' : '0';
            menu.style.transform = open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(.9)';
            menu.style.pointerEvents = open ? 'auto' : 'none';
        });

        container.append(menu, fab);
        root.document.body.appendChild(container);
    }

    const observer = new MutationObserver(createButton);
    observer.observe(root.document.documentElement, { childList: true, subtree: true });
    createButton();
})(typeof globalThis !== 'undefined' ? globalThis : this);
