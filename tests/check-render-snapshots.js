// node tests/check-render-snapshots.js
const assert = require('node:assert/strict');
const fixture = require('./fixtures/com-render-snapshots.json');
const providers = { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini', grok: 'Grok' };
for (const [provider, site] of Object.entries(providers)) {
    const api = require(`../userscripts/gyc-${provider}.user.js`);
    const messages = structuredClone(fixture.messages);
    const expected = fixture.expected.replace('{site}', site);
    for (const mode of ['API', 'DOM', 'COM']) {
        const content = mode === 'COM' ? api.buildIntegratedMarkdown(messages, messages, { site }).content
            : provider === 'chatgpt' ? api.buildMarkdown({ messages }, 'Synthetic title', { source: mode }).content
            : provider === 'claude' ? api.buildMarkdown(messages, mode)
            : provider === 'gemini' ? api.renderGeminiApiMarkdown(messages)
            : api.buildTimelineMarkdown(messages, [], mode).content;
        assert.equal(content, expected, `${provider}/${mode}: output specification snapshot`);
    }
    const fallback = api.buildIntegratedMarkdown([], messages, { site, apiAvailable: false, domComplete: true,
        notes: ['來源取得失敗：API', '相對時間', '已排除 3 則思考前置進度'] }).content;
    assert.equal(fallback, expected, `${provider}: complete fallback has no advisory in reading output`);
    for (const options of [{ branchConfirmed: false }, { domComplete: false },
        { incompleteReasons: ['未輸出未知內容', '未輸出未知內容'] }]) {
        const content = api.buildIntegratedMarkdown(messages, messages, { site, ...options }).content;
        assert.equal(content.split('> **不完整**：').length - 1, 1);
        assert(!content.includes('**注意**'));
        if (options.incompleteReasons) assert.equal(content.split('未輸出未知內容').length - 1, 1);
    }
    const merged = api.buildIntegratedMarkdown([{ ...messages[1], attachments: [{ name: 'a.txt' }] }],
        [{ ...messages[1], attachments: [{ name: 'b.txt' }, { name: 'a.txt' }] }], { site }).content;
    assert(merged.includes('附件：a.txt；b.txt'));
    assert.equal(merged.split('附件：').length - 1, 1, 'one merged line per metadata class');
    if (provider === 'chatgpt') {
        const pending = api.buildIntegratedMarkdown(messages, [], { domAvailable: false }).content;
        assert(pending.includes('> **不完整**：沒有頁面正文'));
        assert(pending.includes('## 待確認 API 內容（不屬於正式正文）'));
        assert(!pending.includes('# User'));
    }
    if (provider === 'gemini') {
        const code = ['Outside [cite: 1]', '~~~~text', '[cite: 2]', '~~~~', '````text',
            '```', '[cite: 3]', '````', '`[cite: 4]`', '    [cite: 5]'].join('\n');
        const content = api.renderGeminiApiMarkdown([{ role: 'assistant', text: code }]);
        assert(!content.includes('Outside [cite: 1]'));
        for (const n of [2, 3, 4, 5]) assert(content.includes(`[cite: ${n}]`), 'code contents must remain literal');
    }
    console.log(`ok ${provider}: API/DOM/COM exact contract, fallback, incomplete markers and merged metadata`);
}
