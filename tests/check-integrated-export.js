// node tests/check-integrated-export.js
const assert = require('node:assert/strict');
const user = text => ({ role: 'user', text });
const assistant = text => ({ role: 'assistant', text });

for (const provider of ['chatgpt', 'claude', 'gemini', 'grok']) {
    const { buildIntegratedMarkdown } = require(`../userscripts/gyc-${provider}.user.js`);
    const question = user('Question');
    const merged = buildIntegratedMarkdown([question, assistant('**Answer**')], [question, assistant('Answer')]);
    assert.equal(merged.comparison.match, true);
    assert.equal(merged.entries.length, 2);
    assert(merged.content.includes('**Answer**'));
    assert(merged.content.includes('\n\nAnswer\n\n</details>'));
    assert(merged.content.includes('API #2 · DOM #2'));

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
    assert(oneSide.content.includes('來源取得失敗'));
    assert(!oneSide.content.includes('**正文差異**'));
    assert(!oneSide.content.includes('API + DOM'));
    const domOnly = buildIntegratedMarkdown([], [user('page only')], { apiAvailable: false });
    assert(domOnly.content.includes('DOM #1'));
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
    const progress = buildIntegratedMarkdown([
        { ...assistant('Checking sources'), channel: 'commentary' },
        { ...assistant('Final answer'), channel: 'final' }
    ], [assistant('Final answer')]);
    if (provider === 'chatgpt') {
        // Only ChatGPT's native channel metadata proves this is pre-answer progress.
        assert.equal(progress.comparison.match, true);
        assert.equal(progress.counts.progress, 1);
    }
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
