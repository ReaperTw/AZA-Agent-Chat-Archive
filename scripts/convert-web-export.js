'use strict';

const fs = require('node:fs');
const path = require('node:path');

// Reuse the exact rendering contract without evaluating provider/browser code.
const rendererSource = fs.readFileSync(path.join(__dirname, '../userscripts/shared/export-renderer.js'), 'utf8');
const helpers = new Function(`${rendererSource}\nreturn { formatTimeRange, incompleteFromWarnings, buildComHeader, formatComMetadata, stripGeminiCiteMarkers, buildExportFilename };`)();

function convertFilename(filename) {
    const name = path.basename(filename);
    const duplicate = /\s*\(\d+\)\.md$/i.test(name);
    const base = name.replace(/\s*\(\d+\)(?=\.md$)/i, '');
    const match = /^(GPT|CLD|GEM|Grok)_(.+)\.md$/.exec(base);
    if (!match) return null;
    const code = match[1];
    let stem = match[2];
    const debug = /_(REPORT|VERIFICATION|DIFFERENCES)(?:_\d{8}_\d{6})?$/i.test(stem);
    stem = stem.replace(/(?:_(?:COMBINED|COM|API|DOM|INCOMPLETE|REPORT|VERIFICATION|DIFFERENCES))+$/i, '');
    let timestamp = /_(\d{8}_\d{6})$/.exec(stem);
    if (!timestamp) return null;
    let title = stem.slice(0, timestamp.index);
    title = title.replace(/^(?:API|DOM)_/, '').replace(/(?:_(?:COMBINED|COM|API|DOM|INCOMPLETE|REPORT|VERIFICATION|DIFFERENCES))+$/i, '');
    if (!title) return null;
    return { code, target: helpers.buildExportFilename(code, title, timestamp[1]), duplicate,
        ...(debug ? { skip: 'debug-report' } : {}) };
}

// Each token retains its original line ending. Fence length matters: inner triple
// backticks inside a four-backtick fence are content, not a closing delimiter.
function tokenize(content) {
    let fence = null, inline = 0;
    return (content.match(/[^\n]*\n|[^\n]+$/g) || []).map(raw => {
        const text = raw.replace(/\r?\n$/, '');
        const fenceText = text.replace(/^(?: {0,3}>[ \t]?)+/, '').replace(/^ {0,3}(?:[-+*]|\d+[.)]) /, '');
        const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(fenceText);
        const protectedLine = Boolean(fence) || Boolean(inline) || /^(?: {4}|\t)/.test(text) || Boolean(marker);
        if (fence) {
            if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
        } else if (marker && !inline) fence = marker[1];
        else if (!/^(?: {4}|\t)/.test(text)) {
            for (const run of text.match(/`+/g) || []) {
                if (!inline) inline = run.length;
                else if (run.length === inline) inline = 0;
            }
        }
        return { raw, text, protected: protectedLine };
    });
}

const placeholders = new Map([
    ['> [圖片，未嵌入匯出檔]', '> [圖片]'],
    ['> [圖片本體未嵌入匯出檔]', '> [圖片]'],
    ['> [圖片：本體未嵌入匯出檔]', '> [圖片]'],
    ['> [文件，未嵌入匯出檔]', '> [文件]'],
    ['> [文件本體未嵌入匯出檔]', '> [文件]'],
    ['> [附件，未嵌入匯出檔]', '> [附件]'],
    ['> [附件本體未嵌入匯出檔]', '> [附件]'],
    ['> [非文字內容，本體未嵌入匯出檔]', '> [非文字內容]'],
    ['> [非文字回答，本體未嵌入匯出檔]', '> [非文字回答]']
]);

function dividerFor(text) {
    const legacy = /^--- \[(User|USER|Model|MODEL|ASSISTANT|Assistant|ChatGPT|Grok|Perplexity)(?: (\d+))?\] ---[ \t]*$/.exec(text);
    const current = /^# (User|Model) (\d+)[ \t]*$/.exec(text);
    const match = legacy || current;
    if (!match) return null;
    return { role: /^(?:User|USER)$/.test(match[1]) ? 'User' : 'Model',
        number: match[2] === undefined ? null : Number(match[2]), legacy: Boolean(legacy) };
}

function dividersIn(lines) {
    return lines.flatMap((line, index) => {
        const divider = line.protected ? null : dividerFor(line.text);
        return divider ? [{ index, ...divider }] : [];
    });
}

function sequenceIsValid(dividers) {
    const counts = { User: 0, Model: 0 };
    let global = true, byRole = true;
    dividers.forEach((divider, index) => {
        counts[divider.role]++;
        if (divider.number !== null) {
            global &&= divider.number === index + 1;
            byRole &&= divider.number === counts[divider.role];
        }
    });
    return global || byRole;
}

const headerField = /^>\s*\*\*(?:來源網站|網址|對話時間(?:（未定位）)?|API\s*時間|時間|匯出來源|核對結果|擷取方式|不完整)\*\*[：:]/;
const timestampField = /^>\s*(?:\*\*)?(?:對話時間(?:（未定位）)?|API\s*時間|時間)(?:\*\*)?[：:]\s*(?:\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2}|(?:上午|下午)?\d{1,2}:\d{2})/;

// Retain exact body bytes: no trimming, whitespace collapsing or newline conversion.
function bodyBytes(content, skill) {
    const bom = content.startsWith('\uFEFF') ? '\uFEFF' : '';
    const lines = tokenize(bom ? content.slice(1) : content);
    const dividers = dividersIn(lines), removed = new Set();
    const first = dividers[0]?.index ?? lines.length;
    if (!skill) {
        let warning = false, generated = false;
        for (let i = 0; i < first; i++) {
            if (lines[i].protected) continue;
            if (headerField.test(lines[i].text)) { removed.add(i); generated = true; warning = false; }
            else if (/^>\s*\*\*(?:注意|匯出不完整|匯出注意事項|內容提示|相對時間提醒|相對時間說明)\*\*/.test(lines[i].text)) {
                removed.add(i); generated = true; warning = true;
            } else if (warning && /^>/.test(lines[i].text)) removed.add(i);
        }
        if (generated) for (let i = 0; i < first; i++) {
            if (lines[i].text === '' || lines[i].text === '>') removed.add(i);
        }
    }
    for (const divider of dividers) {
        removed.add(divider.index);
        if (lines[divider.index + 1]?.text === '') removed.add(divider.index + 1);
    }
    if (!skill) for (let i = first; i < lines.length; i++) {
        if (lines[i].protected || !timestampField.test(lines[i].text)) continue;
        let previous = i - 1, next = i + 1;
        while (previous >= 0 && lines[previous].text === '') previous--;
        while (next < lines.length && lines[next].text === '') next++;
        if (!dividerFor(lines[previous]?.text || '') && !dividerFor(lines[next]?.text || '')) continue;
        removed.add(i);
        if (lines[i + 1]?.text === '') removed.add(i + 1);
    }
    return Buffer.from(bom + lines.map((line, index) => removed.has(index) ? '' :
        line.protected ? line.raw : line.raw.replace(/^( {0,3})#{1,6}(?= )/, '$1')).join(''), 'utf8');
}

function convertMarkdown(content, code, checkingIdempotence = false) {
    if (typeof content !== 'string') throw new TypeError('Markdown content must be a string');
    const original = content;
    const bom = content.startsWith('\uFEFF') ? '\uFEFF' : '';
    const lines = tokenize(bom ? content.slice(1) : content);
    const dividers = dividersIn(lines);
    const prefix = lines.slice(0, dividers[0]?.index ?? lines.length).map(line => line.raw).join('');
    const skill = /<!-- agent-chat-archive:|<!-- Harness:|^>\s*\*\*來源 Harness\*\*/m.test(prefix);
    if (!code && !skill) {
        if (/gemini\.google\.com|來源網站\*\*[：:]\s*Gemini/i.test(prefix)) code = 'GEM';
        else if (/chatgpt\.com|來源網站\*\*[：:]\s*ChatGPT/i.test(prefix)) code = 'GPT';
        else if (/claude\.ai|來源網站\*\*[：:]\s*Claude/i.test(prefix)) code = 'CLD';
        else if (/grok\.com|來源網站\*\*[：:]\s*Grok/i.test(prefix)) code = 'Grok';
    }
    const appendix = code === 'GPT' && lines.some(line => !line.protected && line.text === '## 待確認 API 內容（不屬於正式正文）');
    const conversation = dividers.length > 0 || appendix;
    const warnings = lines.filter(line => !line.protected && /^--- \[[^\]]+\] ---[ \t]*$/.test(line.text) && !dividerFor(line.text))
        .map(line => `Unrecognized conversation divider retained: ${line.text}`);
    if (!conversation || !sequenceIsValid(dividers)) {
        const skip = conversation ? 'nonsequential' : 'non-conversation';
        if (conversation) warnings.push('Conversation skipped: nonsequential dividers');
        return { content, changes: [], warnings: [...new Set(warnings)], conversation, skip,
            verification: { beforeSeparators: dividers.length, afterSeparators: dividers.length, bodyByteIdentical: true, idempotent: true } };
    }
    const counts = { User: 0, Model: 0 }, byIndex = new Map(dividers.map(divider => [divider.index, divider]));
    const newline = content.includes('\r\n') ? '\r\n' : '\n';
    const first = dividers[0]?.index ?? lines.length;
    const normalized = bom + lines.map((line, index) => {
        const divider = byIndex.get(index);
        if (divider) {
            const ending = /\r?\n$/.exec(line.raw)?.[0] || '';
            const blank = lines[index + 1] && lines[index + 1].text !== '' ? newline : '';
            return `# ${divider.role} ${++counts[divider.role]}` + (ending || (blank ? newline : '')) + blank;
        }
        return index > first && !line.protected ? line.raw.replace(/^( {0,3})# /, '$1## ') : line.raw;
    }).join('');
    const converted = skill ? { content: normalized, changes: [], warnings: [] } : convertWebMarkdown(normalized, code);
    const changes = [...converted.changes];
    if (normalized !== original) changes.unshift('Normalize conversation dividers and body headings');
    const result = converted.content;
    const afterSeparators = dividersIn(tokenize(result.startsWith('\uFEFF') ? result.slice(1) : result)).length;
    return { content: result, changes: result === original ? [] : [...new Set(changes)],
        warnings: [...new Set([...warnings, ...converted.warnings])], conversation,
        verification: { beforeSeparators: dividers.length, afterSeparators,
            bodyByteIdentical: bodyBytes(original, skill).equals(bodyBytes(result, skill)),
            idempotent: checkingIdempotence || convertMarkdown(result, code, true).content === result } };
}

function convertWebMarkdown(content, code) {
    const bom = content.startsWith('\uFEFF') ? '\uFEFF' : '';
    const lines = tokenize(bom ? content.slice(1) : content);
    const newline = content.includes('\r\n') ? '\r\n' : '\n';
    const changes = new Set(), warnings = [];
    const removed = new Set(), replacements = new Map();
    const times = [], notes = [], existingReasons = [];
    let site = '', url = '', fallback = '', sawMessage = false;
    const heading = /^# (User|Model) \d+[ \t]*$/;
    const headerIndices = [], metadata = [];
    const replace = (index, text, summary) => {
        const end = /\r?\n$/.exec(lines[index].raw)?.[0] || '';
        replacements.set(index, text + end);
        if (text !== lines[index].text) changes.add(summary);
    };
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.protected) continue;
        const text = line.text;
        if (heading.test(text)) { sawMessage = true; continue; }
        const field = /^>\s*\*\*(來源網站|網址|對話時間(?:（未定位）)?|API\s*時間|時間|匯出來源|核對結果|擷取方式|不完整)\*\*[：:]\s*(.*)$/.exec(text)
            || /^>\s*(API\s*時間|時間)[：:]\s*(.*)$/.exec(text);
        if (field) {
            const [, label, value] = field;
            if (label === '來源網站' || label === '網址') {
                if (sawMessage) continue;
                if (label === '來源網站') site = value; else url = value;
                headerIndices.push(i);
            } else if (/^(?:對話時間|API\s*時間|時間)/.test(label)) {
                // Exported timestamps sit in the header or beside a message divider.
                // A date-looking quote embedded in prose is still user-visible body.
                let previous = i - 1, next = i + 1;
                while (previous >= 0 && lines[previous].text === '') previous--;
                while (next < lines.length && lines[next].text === '') next++;
                if (sawMessage && !heading.test(lines[previous]?.text || '') && !heading.test(lines[next]?.text || '')) continue;
                if (sawMessage && !/^(?:\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2}|(?:上午|下午)?\d{1,2}:\d{2})/.test(value)) continue;
                if (/[–—]|\s-\s/.test(value)) fallback ||= value;
                else if (value) times.push({ time: value });
                headerIndices.push(i);
            } else if (label === '不完整') {
                if (sawMessage) continue;
                existingReasons.push(value); headerIndices.push(i);
            } else {
                if (sawMessage) continue;
                headerIndices.push(i);
            }
            continue;
        }
        const block = /^>\s*\*\*(注意|匯出不完整|匯出注意事項|內容提示|相對時間提醒|相對時間說明)\*\*(?:[：:]\s*(.*))?$/.exec(text);
        if (block && (block[1] !== '注意' || !sawMessage)) {
            removed.add(i);
            if (block[2]) notes.push(block[2]);
            while (i + 1 < lines.length && !lines[i + 1].protected && /^>($|\s)/.test(lines[i + 1].text)) {
                const next = lines[i + 1].text;
                if (/^>\s*\*\*/.test(next)) break;
                i++; removed.add(i);
                const value = next.replace(/^>\s*(?:-\s*)?/, '').trim();
                if (value) notes.push(value);
            }
            changes.add('Replace legacy warning metadata');
            continue;
        }
        const label = /^(引用|附件|處理狀態)[：:]\s*$/.exec(text);
        if (label && /^ {0,3}(`{3,}|~{3,})json\s*$/.test(lines[i + 1]?.text || '')) {
            const opener = /^ {0,3}(`{3,}|~{3,})/.exec(lines[i + 1].text)[1];
            let end = i + 2;
            while (end < lines.length && !(new RegExp(`^ {0,3}${opener[0]}{${opener.length},}\\s*$`)).test(lines[end].text)) end++;
            if (end === lines.length) { warnings.push('Unclosed generated metadata fence'); continue; }
            try {
                const value = JSON.parse(lines.slice(i + 2, end).map(item => item.raw).join(''));
                if (value === null || typeof value !== 'object') throw new Error('Not metadata');
                metadata.push({ start: i, end, field: { 引用: 'citations', 附件: 'attachments', 處理狀態: 'process' }[label[1]], values: Array.isArray(value) ? value : [value] });
                i = end;
            } catch { warnings.push('Unrecognized generated metadata JSON retained'); }
            continue;
        }
        if (placeholders.has(text)) replace(i, placeholders.get(text), 'Normalize generated placeholders');
        if (/^> \*\*來源衝突，兩版並列\*\*（角色也不同）$/.test(text)) replace(i, '> **來源衝突，兩版並列**', 'Normalize source conflict marker');
        if (/^> (?:\*\*)?來源衝突(?:\*\*)?[：:]?\s*$/.test(text)) replace(i, '> **來源衝突，兩版並列**', 'Normalize source conflict marker');
        const only = /^> (?:\*\*)?(?:僅有|僅|只有)\s*(API|DOM)(?:\s*來源)?(?:\s*有此訊息|\s*訊息|\s*有)(?:\*\*)?$/.exec(text);
        if (only) replace(i, `> 僅 ${only[1]} 有此訊息`, 'Normalize one-sided message marker');
    }

    // Metadata URL deduplication is local to its message, never across replies.
    const metadataGroups = new Map();
    for (const item of metadata) {
        let start = item.start, end = item.end + 1;
        while (start > 0 && !(!lines[start - 1].protected && heading.test(lines[start - 1].text))) start--;
        while (end < lines.length && (lines[end].protected || !heading.test(lines[end].text))) end++;
        if (!metadataGroups.has(start)) metadataGroups.set(start, { start, end, items: [] });
        metadataGroups.get(start).items.push(item);
    }
    for (const { start, end, items } of metadataGroups.values()) {
        const body = lines.slice(start, end).filter((_, offset) => !items.some(item => start + offset >= item.start && start + offset <= item.end)).map(line => line.raw).join('');
        const message = {};
        for (const item of items) {
            message[item.field] = (message[item.field] || []).concat(item.values);
            for (let j = item.start; j <= item.end; j++) removed.add(j);
        }
        const rendered = helpers.formatComMetadata(message, body);
        if (rendered.length) {
            removed.delete(items[0].start);
            replace(items[0].start, rendered.join(newline), 'Collapse generated JSON metadata');
        }
        changes.add('Collapse generated JSON metadata');
    }
    if (code === 'GPT' && !sawMessage && lines.some(line => !line.protected &&
        line.text === '## 待確認 API 內容（不屬於正式正文）')) {
        existingReasons.push('沒有頁面正文；API 內容列於文末待確認');
    }
    const reasons = [...new Set([...existingReasons, ...helpers.incompleteFromWarnings(notes)])];
    const unknown = notes.filter(note => !helpers.incompleteFromWarnings([note]).length && !/相對時間|時間戳|前置進度|思考前置|來源取得失敗|正文差異|核對|時間.*(?:缺少|沒有)|(?:缺少|沒有).*時間/.test(note));
    if (unknown.length) warnings.push(...unknown.map(note => `Unclassified legacy warning: ${note}`));
    for (const index of headerIndices) removed.add(index);
    // Consume only quote separators and blank padding in the generated prefix.
    let prefixEnd = 0;
    while ((headerIndices.length || removed.has(0)) && prefixEnd < lines.length && (removed.has(prefixEnd) || lines[prefixEnd].text === '>' || lines[prefixEnd].text === '')) {
        removed.add(prefixEnd++);
    }
    const header = helpers.buildComHeader({ site, url, time: helpers.formatTimeRange(times, fallback), incompleteReasons: reasons }).replace(/\n/g, newline);
    const body = lines.map((line, index) => removed.has(index) ? '' : replacements.get(index) ?? line.raw).join('');
    let result = bom + header + body;
    if (code === 'GEM') {
        const cleaned = tokenize(result).map(line => line.protected ? line.raw : helpers.stripGeminiCiteMarkers(line.raw)).join('');
        if (cleaned !== result) changes.add('Remove Gemini citation tokens outside code');
        result = cleaned;
    }
    if (result !== content && headerIndices.length) changes.add('Consolidate generated header and message timestamps');
    return { content: result, changes: result === content ? [] : [...changes], warnings: [...new Set(warnings)] };
}

module.exports = { convertMarkdown, convertFilename };
