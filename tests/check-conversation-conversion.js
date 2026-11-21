'use strict';

const assert = require('node:assert/strict');
const { convertMarkdown, compareConversationBodies } = require('../scripts/convert-web-export');

const divider = (role, number) => `--- [${role}${number === undefined ? '' : ` ${number}`}] ---`;
const convert = text => convertMarkdown(text).content;

for (const role of ['User', 'USER', 'Model', 'MODEL', 'ASSISTANT', 'Assistant', 'ChatGPT', 'Grok', 'Perplexity']) {
    const isUser = role === 'User' || role === 'USER';
    const result = convert(`${divider(role, 1)}\nbody\n`);
    assert.match(result, isUser ? /^# User 1/m : /^# Model 1/m, role);
}
assert.match(convert(`${divider('User')}\nbody\n`), /^# User 1/m);
assert.match(convert(`${divider('USER', 1)}\n${divider('ASSISTANT', 2)}\n${divider('USER', 3)}\n`), /# User 1[\s\S]*# Model 1[\s\S]*# User 2/);
assert.match(convert(`${divider('User', 1)}\n${divider('Model', 1)}\n${divider('User', 2)}\n`), /# User 1[\s\S]*# Model 1[\s\S]*# User 2/);
const malformed = `${divider('USER', 1)}\ntext\n${divider('ASSISTANT', 3)}\n`;
const skipped = convertMarkdown(malformed);
assert.equal(skipped.content, malformed);
assert.equal(skipped.skip, 'nonsequential');
assert.equal(skipped.verification.idempotent, true);

for (const source of [
    `> ${divider('User', 99)}\n`,
    `inline ${divider('User', 99)} text\n`,
    `\`\`\`md\n${divider('User', 99)}\n\`\`\`\n`,
    `\`\`\`\`md\n${divider('User', 99)}\n\`\`\`\`\n`,
    `~~~md\n${divider('User', 99)}\n~~~\n`,
    `    ${divider('User', 99)}\n`
]) {
    const out = convertMarkdown(source);
    assert.equal(out.conversation, false);
    assert.equal(out.content, source);
}
const unknown = convertMarkdown(`${divider('User', 1)}\n${divider('滾動第 4 次')}\n`);
assert.match(unknown.content, /--- \[滾動第 4 次\] ---/);
assert.ok(unknown.warnings.some(warning => warning.includes('滾動第 4 次')));

const crlf = '\uFEFF' + [divider('User', 1), '# Title', 'body', divider('Model', 1), 'answer'].join('\r\n') + '\r\n';
const crlfResult = convertMarkdown(crlf);
assert.ok(crlfResult.content.startsWith('\uFEFF'));
assert.ok(crlfResult.content.includes('\r\n'));
assert.match(crlfResult.content, /^\uFEFF# User 1\r?\n\r?\n## Title/m);
assert.equal(crlfResult.verification.idempotent, true);
assert.equal(convert(crlfResult.content), crlfResult.content);
assert.equal(crlfResult.verification.bodyByteIdentical, true);

const skillHeader = '\uFEFF<!-- Harness: Skill Archive -->\r\n<!-- exact bytes\r\n untouched -->\r\n' + divider('User', 1) + '\r\nbody\r\n';
const skillResult = convertMarkdown(skillHeader);
assert.ok(skillResult.content.startsWith('\uFEFF<!-- Harness: Skill Archive -->\r\n<!-- exact bytes\r\n untouched -->\r\n'));
assert.equal(skillResult.verification.bodyByteIdentical, true);
const webHeader = `> **來源網站**：Example\n\n${divider('User', 1)}\nbody\n`;
assert.doesNotMatch(convert(webHeader), /來源網站/);

const existing = '# User 1\n\n## Existing title\n\nbody\n';
assert.equal(convert(convert(existing)), convert(existing));
const bodyMismatch = convertMarkdown(`${divider('User', 1)}\n引用：\n\`\`\`json\n["https://example.test"]\n\`\`\`\n`);
assert.equal(bodyMismatch.verification.bodyByteIdentical, true);
assert.equal(bodyMismatch.verification.beforeSeparators, 1);
assert.equal(bodyMismatch.verification.afterSeparators, 1);
assert.equal(bodyMismatch.verification.idempotent, true);
const skillFields = '<!-- agent-chat-archive: Omp:synthetic -->\r\n> **對話時間**：2026年11月8日 下午 6:04\r\n>\r\n> **來源 Harness**：Omp\r\n>\r\n> **來源資料夾**：`C:/Synthetic`\r\n> **Session ID**：synthetic\r\n\r\n';
const fenced = ['# Body', '````md', '# literal', divider('User', 99), '```', '# still literal', '````', '~~~', '# tilde', '~~~', '    # indented', '# End'].join('\r\n');
const fullSkill = '\uFEFF' + skillFields + divider('User', 1) + '\r\n\r\n' + fenced + '\r\n';
const fullResult = convertMarkdown(fullSkill);
assert(fullResult.content.startsWith('\uFEFF' + skillFields), 'preserve real archive header bytes');
assert(fullResult.content.includes(fenced.replace('# Body', '## Body').replace('# End', '## End')));
assert.equal(fullResult.verification.bodyByteIdentical, true);
assert.equal(fullResult.verification.beforeSeparators, fullResult.verification.afterSeparators);
assert.equal(fullResult.verification.idempotent, true);
const quotedDivider = `${divider('User', 1)}\nQuestion\n\n${divider('Model', 1)}\nExample:\n${divider('User', 9)}\n`;
assert.equal(convertMarkdown(quotedDivider).content, quotedDivider, 'a nonsequential literal divider rejects the whole file');
const inferredGemini = convertMarkdown(`> **來源網站**：Gemini\n\n${divider('Model', 1)}\nAnswer [cite: 1].\n`);
assert(inferredGemini.content.includes('Answer.'));
assert.equal(inferredGemini.verification.bodyByteIdentical, true);
for (const newline of ['\n', '\r\n']) {
    for (const timestamp of ['> **API 時間**：', '> **時間**：', '> 時間：']) {
        const source = '\uFEFF' + [
            '> **匯出來源**：API + DOM', '> **核對結果**：核對完成',
            '> **對話時間**：2026/11/8 下午6:04:06', '',
            '> **內容提示**：部分圖片內容未嵌入匯出檔', '',
            '> **注意**', '> - 來源提醒：相對時間僅供參考', '',
            divider('User', 1), `${timestamp}2026/11/8 下午6:04:06`, '正文完整  保留空白', '',
            divider('Model', 1), `${timestamp}2026/11/8 下午6:15:27`, '答案完整 [cite: 1].', '',
            '```text', '[cite: 9]', '> **時間**：2026/11/8 下午6:20:00', '```', ''
        ].join(newline);
        const expected = '\uFEFF' + [
            '# User 1', '', '正文完整  保留空白', '',
            '# Model 1', '', '答案完整.', '',
            '```text', '[cite: 9]', '> **時間**：2026/11/8 下午6:20:00', '```', ''
        ].join(newline);
        const options = { code: 'GEM' };
        assert.equal(compareConversationBodies(source, expected, options), true, `${timestamp}: metadata-only changes`);
        assert.equal(convertMarkdown(source, 'GEM').verification.bodyByteIdentical, true);
        assert.equal(compareConversationBodies(source, expected.replace('正文完整', '正文整'), options), false, 'one missing body character must fail');
        assert.equal(compareConversationBodies(source, expected.replace('  保留', ' 保留'), options), false, 'body whitespace is byte-significant');
        assert.equal(compareConversationBodies(source, expected.replace('[cite: 9]', '[cite: 8]'), options), false, 'code citation tokens remain body');
        assert.equal(compareConversationBodies(source, expected.slice(1), options), false, 'preserve BOM');
        if (newline === '\r\n') assert.equal(compareConversationBodies(source, expected.replace(/\r\n/g, '\n'), options), false, 'preserve body CRLF bytes');
    }
}
console.log('ok conversation conversion: roles, continuous numbering, code, byte preservation and second-pass verification');
