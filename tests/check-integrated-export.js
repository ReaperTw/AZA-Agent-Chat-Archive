// node tests/check-integrated-export.js
const assert = require('node:assert/strict');
const user = text => ({ role: 'user', text });
const assistant = text => ({ role: 'assistant', text });

require('./check-chatgpt-integrated.js');
for (const provider of ['claude', 'gemini', 'grok']) {
    const { buildIntegratedMarkdown } = require(`../userscripts/gyc-${provider}.user.js`);
    const question = user('Question');
    const merged = buildIntegratedMarkdown([question, assistant('**Answer**')], [question, assistant('Answer')]);
    assert.equal(merged.comparison.match, true);
    assert.equal(merged.entries.length, 2);
    assert(merged.content.includes('**Answer**'));
    assert.equal(merged.content.split('Answer').length - 1, 1, 'render-equivalent answer is exported once');

    const conflict = buildIntegratedMarkdown([question, assistant('API answer')], [question, assistant('DOM answer')]);
    assert.equal(conflict.counts.conflicts, 1);
    assert(conflict.content.includes('API 版本（assistant）\n\nAPI answer'));
    assert(conflict.content.includes('DOM 版本（assistant）\n\nDOM answer'));
    assert(conflict.content.includes('來源衝突'));
    const roleConflict = buildIntegratedMarkdown([user('same')], [assistant('same')]);
    assert.equal(roleConflict.entries[0].kind, 'role');
    assert(roleConflict.content.includes('API 版本（user）'));
    assert(roleConflict.content.includes('DOM 版本（assistant）'));

    const code = buildIntegratedMarkdown([assistant('```js\nx  y\n```')], [assistant('```js\nx y\n```')]);
    assert.equal(code.comparison.match, false);
    assert(code.content.includes('x  y'));
    assert(code.content.includes('x y'));

    const oneSide = buildIntegratedMarkdown([assistant('retained')], [], { domAvailable: false });
    assert.equal(oneSide.compared, false);
    assert(oneSide.content.includes('retained'));
    assert(!oneSide.content.includes('來源取得失敗'));
    assert(!oneSide.content.includes('> **不完整**'));
    assert(!oneSide.content.includes('**正文差異**'));
    assert(!oneSide.content.includes('API + DOM'));
    const domOnly = buildIntegratedMarkdown([], [user('page only')], { apiAvailable: false });
    assert(!domOnly.content.includes('DOM #1'), 'single-source export has no per-message source labels');
    assert(domOnly.content.includes('page only'));

    const withMetadata = buildIntegratedMarkdown([
        { ...assistant('same'), citations: [{ url: 'https://api.example.test' }], attachments: [{ name: 'api.txt' }] }
    ], [
        { ...assistant('same'), citations: [{ url: 'https://dom.example.test' }], attachments: [{ name: 'dom.txt' }], process: ['Visible status'], date: '2026-10-29' }
    ]);
    assert.equal(withMetadata.comparison.match, true);
    for (const value of ['api.example.test', 'dom.example.test', 'api.txt', 'dom.txt', 'Visible status', '2026-10-29']) {
        assert(withMetadata.content.includes(value));
    }
    // One header, compact merged supplementary lines, no provenance or advisories.
    const compactCom = buildIntegratedMarkdown([
        { ...user('Q'), date: '2026/11/8 下午6:04:06' }, { ...assistant('A'), date: '2026/11/8 下午6:04:13' },
        { ...user('Q2'), date: '2026/11/8 下午6:15:27' }
    ], [
        user('Q'), { ...assistant('A'), citations: [{ label: 'NHS\n+1', links: [] }] }, user('Q2')
    ], { site: 'Test', url: 'https://example.test/c/1#frag' }).content;
    assert(compactCom.startsWith('> **對話時間**：2026/11/8 下午6:04:06 – 下午6:15:27\n>\n> **網址**：https://example.test/c/1\n\n'));
    for (const noise of ['下午6:04:13', '```json', '+1', '匯出來源', '核對結果', '注意']) assert(!compactCom.includes(noise), noise);
    assert(compactCom.includes('A\n\n引用：NHS\n'), 'link-less source chip kept as one line');
    const attachmentOnly = buildIntegratedMarkdown([user('> [非文字內容]'), assistant('A')], [user('> [非文字內容]'), assistant('A')],
        { notes: ['部分使用者訊息沒有文字，可能含未嵌入的附件', '部分非文字內容未嵌入'] }).content;
    assert(!attachmentOnly.includes('不完整'), 'an unembedded attachment is not missing content');
    const folded = buildIntegratedMarkdown([], [user('Q'), assistant('# Title\n```md\n# kept\n```\n## Sub')], { apiAvailable: false }).content;
    assert(folded.includes('# User 1\n\nQ') && folded.includes('# Model 1\n\n## Title\n```md\n# kept\n```\n## Sub'), 'turns are the only H1; code untouched');
    if (provider === 'gemini') {
        const cited = buildIntegratedMarkdown([assistant('Rule [cite: 4].\n`[cite: 9]`')], [assistant('Rule [cite: 4].\n`[cite: 9]`')]).content;
        assert(cited.includes('Rule.') && cited.includes('`[cite: 9]`'), 'cite markers stripped outside code only');
    }
    if (provider === 'gemini') {
        const whitespace = buildIntegratedMarkdown(
            [user('First line\nSecond line\n\nNext paragraph')],
            [user('First line \nSecond line \n\n\nNext paragraph ')]);
        assert.equal(whitespace.counts.conflicts, 0, 'user line tails and blank paragraph lines are presentation');
        assert.equal(whitespace.entries.length, 1);
        assert(whitespace.content.includes('First line\nSecond line\n\nNext paragraph'));
        assert.equal(buildIntegratedMarkdown([user('x  y')], [user('x y')]).counts.conflicts, 1, 'interior user spaces stay literal');
        assert.equal(buildIntegratedMarkdown([user('```txt\nx  y\n```')], [user('```txt\nx y\n```')]).counts.conflicts, 1);
        assert.equal(buildIntegratedMarkdown([user('First\nSecond')], [user('First \n Second ')]).counts.conflicts, 0, 'prose line-edge layout spaces are equivalent');
        assert.equal(buildIntegratedMarkdown([user('```txt\nx \n\n y\n```')], [user('```txt\nx\n y\n```')]).counts.conflicts, 1, 'code line tails and blank lines stay literal');
        const apiFormat = assistant('**Focus**\n\n* First\n* **Second**');
        const domFormat = { ...assistant('**Focus**\n\n- First\n- **Second**'), comparisonBody: 'Focus\n\nFirst\nSecond' };
        const formatted = buildIntegratedMarkdown([apiFormat], [domFormat]);
        assert.equal(formatted.counts.conflicts, 0, 'bold and list markers render as the same visible text');
        assert.equal(formatted.content.split('Focus').length - 1, 1);
        const formattedDomOnly = buildIntegratedMarkdown([], [domFormat], { apiAvailable: false }).content;
        assert(formattedDomOnly.includes('**Focus**') && formattedDomOnly.includes('- **Second**'), 'DOM-only export retains Markdown formatting');
        const shared = { citations: [{ label: 'Manual', url: 'https://example.test/manual' }], attachments: [{ name: 'input.txt', type: 'file' }], date: '2026-11-01 10:00' };
        const compact = buildIntegratedMarkdown([
            { ...user('Question'), ...shared }, { ...assistant('Answer'), date: shared.date }
        ], [
            { ...user('Question'), ...shared }, { ...assistant('Answer'), date: shared.date }
        ]);
        for (const value of ['https://example.test/manual', 'input.txt', shared.date]) {
            assert.equal(compact.content.split(value).length - 1, 1, 'same supplementary content is retained once');
        }
        const distinct = buildIntegratedMarkdown([
            { ...assistant('same'), attachments: [{ name: 'a', extra: 'unrecognized-detail' }] }
        ], [
            { ...assistant('same'), attachments: [{ name: 'b', extra: 'different-detail' }] }
        ]);
        assert(distinct.content.includes('附件：a；b'));
    }
    const progress = buildIntegratedMarkdown([
        { ...assistant('Checking sources'), channel: 'commentary' },
        { ...assistant('Final answer'), channel: 'final' }
    ], [assistant('Final answer')]);
    assert(progress.content.includes('Checking sources'));
    assert(progress.content.indexOf('Checking sources') < progress.content.indexOf('Final answer'));

    // Preserve each source's original order and every occurrence, including repeated turns,
    // unequal role runs, gaps larger than the comparator lookahead, and text conflicts.
    for (let scenario = 0; scenario < 32; scenario++) {
        const source = Array.from({ length: 64 }, (_, i) => (i % 2 ? assistant : user)(i % 7 ? `row-${i}` : 'repeated'));
        const api = source.filter((_, i) => (i + scenario) % 11 !== 0).map(row => ({ ...row }));
        const dom = source.filter((_, i) => (i + scenario) % 13 !== 0).map((row, i) => ({ ...row, text: i % 9 === 0 ? `${row.text} changed` : row.text }));
        if (scenario === 0) api.splice(1, 0, ...Array.from({ length: 55 }, (_, i) => assistant(`extra-${i}`)));
        if (scenario === 1) dom.splice(1, 0, ...Array.from({ length: 55 }, (_, i) => user(`page-extra-${i}`)));
        const integrated = buildIntegratedMarkdown(api, dom);
        for (const [name, messages] of [['api', api], ['dom', dom]]) {
            const retained = integrated.entries.filter(entry => entry[name]);
            assert.deepEqual(retained.map(entry => entry[`${name}Index`]), messages.map((_, i) => i + 1));
            retained.forEach((entry, i) => {
                assert.equal(entry[name], messages[i]);
                assert(integrated.content.includes(messages[i].text));
            });
        }
    }
    console.log(`ok ${provider}: integrated source conservation, conflicts, metadata, and partial acquisition`);
}
