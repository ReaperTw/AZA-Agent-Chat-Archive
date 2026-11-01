const assert = require('node:assert/strict');
const { buildIntegratedMarkdown } = require('../userscripts/gyc-chatgpt.user.js');
const message = (id, role, text) => ({ sourceIds: id ? [id] : [], role, text });
const hasIssue = (result, kind) => result.verification.issues.some(issue => issue.kind === kind);
const mainBody = result => result.content.split('## 待確認 API 內容')[0];

const api = [message('q', 'user', 'Question'), message('a', 'assistant', '<FutureWidget value="840"/>')];
const dom = [message('q', 'user', 'Question'), message('a', 'assistant', 'Visible answer: 840')];
const merged = buildIntegratedMarkdown(api, dom);
assert.equal(merged.verification.complete, true);
assert.equal(merged.verification.bodyVerified, false);
assert.deepEqual(merged.entries.map(entry => entry.dom.text), dom.map(row => row.text));
assert.equal(merged.pending.length, 0);
assert(merged.content.includes('Visible answer: 840'));
assert(!merged.content.includes('FutureWidget'));
// Matching identities never certifies matching text, including genuinely different numbers.
const changed = buildIntegratedMarkdown(api, [dom[0], { ...dom[1], text: 'Visible answer: 841' }]);
assert.equal(changed.verification.bodyVerified, false);
assert(changed.content.includes('841'));
assert(!changed.content.includes('FutureWidget'));

const missing = buildIntegratedMarkdown([
    ...api, message('missing', 'assistant', 'Answer absent from the page')
], dom);
assert.equal(missing.verification.complete, false);
assert.deepEqual(missing.pending.map(item => item.api.sourceIds), [['missing']]);
assert(!mainBody(missing).includes('Answer absent from the page'));
assert(missing.content.split('## 待確認 API 內容')[1].includes('Answer absent from the page'));

// Equal counts and equal text cannot hide a different branch or unidentified messages.
const branch = buildIntegratedMarkdown(api, [dom[0], message('other-branch', 'assistant', api[1].text)]);
assert(hasIssue(branch, 'dom-unmatched'));
assert.deepEqual(branch.pending.map(item => item.apiIndex), [2]);
const unidentified = buildIntegratedMarkdown([message(null, 'assistant', 'same')], [message(null, 'assistant', 'same')]);
assert(hasIssue(unidentified, 'api-id-missing'));
assert(hasIssue(unidentified, 'dom-id-missing'));
assert.equal(unidentified.pending.length, 1);

const repeated = [message('r1', 'user', 'repeat'), message('r2', 'user', 'repeat')];
const repeats = buildIntegratedMarkdown(repeated, repeated);
assert.equal(repeats.verification.complete, true);
assert.equal(repeats.entries.length, 2);
assert.equal(repeats.content.split('--- [User ').length - 1, 2);
const duplicateApi = buildIntegratedMarkdown([message('x', 'user', 'one'), message('x', 'user', 'two')], [message('x', 'user', 'page')]);
assert(hasIssue(duplicateApi, 'ambiguous-id'));
assert.equal(duplicateApi.pending.length, 2);
const duplicateDom = buildIntegratedMarkdown([message('x', 'user', 'API')], [message('x', 'user', 'page one'), message('x', 'user', 'page two')]);
assert(hasIssue(duplicateDom, 'ambiguous-id'));
assert.equal(duplicateDom.entries.length, 2);
assert.equal(duplicateDom.pending.length, 1);

const roleMismatch = buildIntegratedMarkdown([message('x', 'user', 'original user')], [message('x', 'assistant', 'page assistant')]);
assert(hasIssue(roleMismatch, 'role'));
assert.equal(roleMismatch.pending.length, 1);
assert(mainBody(roleMismatch).includes('page assistant'));
assert(!mainBody(roleMismatch).includes('original user'));
const reordered = buildIntegratedMarkdown(api, [dom[1], dom[0]]);
assert(hasIssue(reordered, 'order'));
assert.deepEqual(reordered.entries.map(entry => entry.dom.sourceIds[0]), ['a', 'q']);
assert.equal(reordered.pending.length, 0);

const aliases = { ...message('canonical', 'assistant', 'native'), sourceIds: ['canonical', 'native-id'] };
assert.equal(buildIntegratedMarkdown([aliases], [message('native-id', 'assistant', 'page')]).verification.complete, true);
const aggregate = buildIntegratedMarkdown(api, [{ ...dom[1], sourceIds: ['q', 'a'] }]);
assert(hasIssue(aggregate, 'ambiguous-id'));
assert.equal(aggregate.pending.length, 2);
const aliasCollision = buildIntegratedMarkdown([
    { ...message('one', 'user', 'one'), sourceIds: ['one', 'shared'] },
    { ...message('two', 'user', 'two'), sourceIds: ['two', 'shared'] }
], [message('one', 'user', 'one'), message('two', 'user', 'two')]);
assert(hasIssue(aliasCollision, 'ambiguous-id'));

for (const option of ['apiComplete', 'domComplete']) {
    const partial = buildIntegratedMarkdown(api, dom, { [option]: false });
    assert.equal(partial.verification.complete, false);
    assert(hasIssue(partial, option === 'apiComplete' ? 'api-incomplete' : 'dom-incomplete'));
}
const apiFailure = buildIntegratedMarkdown([], dom, { apiAvailable: false });
assert(hasIssue(apiFailure, 'api-unavailable'));
assert.equal(apiFailure.entries.length, 2);
assert.equal(apiFailure.pending.length, 0);
const pendingText = 'Unconfirmed answer\n```js\nx  y\n```';
const domFailure = buildIntegratedMarkdown([message('only-api', 'assistant', pendingText)], [], { domAvailable: false });
assert(hasIssue(domFailure, 'dom-unavailable'));
assert.equal(domFailure.entries.length, 0);
assert.equal(domFailure.pending.length, 1);
assert(domFailure.content.includes('````text\n' + pendingText + '\n````'));
assert(!domFailure.content.includes('--- [Model 1] ---'));
assert.deepEqual(apiFailure.verification.issues.map(issue => issue.kind), ['api-unavailable']);
assert.deepEqual(domFailure.verification.issues.map(issue => issue.kind), ['dom-unavailable']);

const metadata = buildIntegratedMarkdown([
    { ...api[1], date: '2026-11-01', attachments: [{ name: 'api.txt' }] }
], [
    { ...dom[1], citations: [{ label: 'Visible source', url: 'https://example.test/source' }], attachments: [{ name: 'page.txt' }] }
]);
for (const value of ['2026-11-01', 'api.txt', 'page.txt', 'https://example.test/source']) assert(metadata.content.includes(value));
const unknownProgress = buildIntegratedMarkdown([
    { ...message('p', 'assistant', 'Unconfirmed commentary'), channel: 'commentary' }, api[1]
], [dom[1]]);
assert.equal(unknownProgress.pending[0].api.text, 'Unconfirmed commentary');
assert(!mainBody(unknownProgress).includes('Unconfirmed commentary'));
console.log('ok ChatGPT: DOM body, ID/role/order checks, unconfirmed appendix, no body-equivalence claims');
