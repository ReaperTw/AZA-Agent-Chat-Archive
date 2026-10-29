const assert = require('node:assert/strict');
const { parseApiConversation, buildMarkdown, getConversationIdFromUrl, compareTranscripts, prepareComparisonMessage } = require('../userscripts/gyc-chatgpt.user.js');
const transcript = (role, text) => ({ role, text });
const message = (role, text, extra = {}) => ({ author: { role }, content: { content_type: 'text', parts: [text] }, create_time: 1780000000, ...extra });
const payload = {
    title: 'Chat', current_node: 'answer', mapping: {
        root: { parent: null },
        user: { parent: 'root', message: message('user', 'question') },
        old: { parent: 'user', message: message('assistant', 'abandoned') },
        analysis: { parent: 'user', message: message('assistant', 'secret-reasoning', { channel: 'analysis' }) },
        hidden: { parent: 'analysis', message: message('user', 'secret-injected', { metadata: { is_visually_hidden_from_conversation: true } }) },
        call: { parent: 'hidden', message: message('assistant', 'secret-tool-call', { recipient: 'browser' }) },
        answer: { parent: 'call', message: message('assistant', 'visible-answer', { channel: 'final' }) }
    }
};
const parsed = parseApiConversation(payload);
assert.deepEqual(parsed.messages.map(m => m.text), ['question', 'visible-answer']);
assert.equal(parsed.incomplete, false);
const markdown = buildMarkdown(parsed).content;
assert(!/secret|abandoned/.test(markdown));
assert(markdown.includes('visible-answer'));
assert.equal(parsed.messages[0].create_time, 1780000000);
const apiChain = entries => {
    const mapping = { root: { parent: null } };
    let parent = 'root';
    entries.forEach(([id, msg]) => { mapping[id] = { parent, message: msg }; parent = id; });
    return { current_node: parent, mapping };
};
const internal = (content_type, value) => message('assistant', value, {
    channel: null, recipient: 'all',
    content: content_type === 'thoughts' ? { content_type, thoughts: [value] } : { content_type, content: value }
});
const reasoning = parseApiConversation(apiChain([
    ['u1', message('user', 'first question')],
    ['thoughts', internal('thoughts', 'private thought')],
    ['a1', message('assistant', 'first answer', { channel: 'final' })],
    ['recap', internal('reasoning_recap', 'private recap')],
    ['u2', message('user', 'second question')],
    ['a2', message('assistant', 'second answer', { channel: 'final' })]
]));
assert.deepEqual(reasoning.messages.map(m => m.text), ['first question', 'first answer', 'second question', 'second answer']);
assert.equal(reasoning.incomplete, false);
assert.equal(reasoning.warning, null);
assert(!/private thought|private recap|reasoning|[未不]完整|placeholder/i.test(buildMarkdown(reasoning).content));

const commentary = parseApiConversation(apiChain([
    ['question', message('user', 'question')],
    ['progress', message('assistant', 'unconfirmed progress', { channel: 'commentary', recipient: 'all' })],
    ['answer', message('assistant', 'answer', { channel: 'final' })]
]));
assert.deepEqual(commentary.messages.map(m => m.text), ['question', 'unconfirmed progress', 'answer']);
assert.equal(commentary.incomplete, false);
assert.equal(commentary.warning, null);
assert(buildMarkdown(commentary).content.includes('unconfirmed progress'));
const unknownRole = parseApiConversation(apiChain([
    ['unknown', message('future-role', 'not an assistant answer')],
    ['answer', message('assistant', 'answer', { channel: 'final' })]
]));
assert.deepEqual(unknownRole.messages.map(m => m.text), ['answer']);
assert(unknownRole.incomplete);
assert(unknownRole.warning);

const attachmentPart = { content_type: 'image_asset_pointer', asset_pointer: 'asset://omitted' };
const imageText = parseApiConversation(apiChain([
    ['user', { ...message('user', ''), content: { content_type: 'multimodal_text', parts: [attachmentPart, 'describe this'] } }],
    ['answer', message('assistant', 'I cannot see the image.', { channel: 'final' })]
]));
const imageMarkdown = buildMarkdown(imageText).content;
assert.equal(imageText.incomplete, false);
assert.equal(imageText.warning, null);
assert(imageText.messages[0].text.includes('describe this'));
assert(/image|attachment|圖片|附件/i.test(imageText.messages[0].text));
assert(imageText.notice);
assert(imageMarkdown.includes(imageText.notice));
assert(!/匯出不完整|export incomplete/i.test(imageMarkdown));

const imageOnly = parseApiConversation(apiChain([
    ['user', { ...message('user', ''), content: { content_type: 'multimodal_text', parts: [attachmentPart] } }]
]));
assert.equal(imageOnly.incomplete, false);
assert.equal(imageOnly.warning, null);
assert(imageOnly.messages[0].text);
assert(imageOnly.notice);

const unknownPart = parseApiConversation(apiChain([
    ['user', { ...message('user', ''), content: { content_type: 'multimodal_text', parts: [{ content_type: 'future_part', payload: 'unknown' }] } }]
]));
assert(unknownPart.incomplete);
assert(unknownPart.warning);
assert(unknownPart.messages[0].text);
const unknownContent = parseApiConversation(apiChain([
    ['user', { ...message('user', ''), content: { content_type: 'future_content', payload: 'unknown' } }]
]));
assert(unknownContent.incomplete);
assert(unknownContent.warning);
assert(unknownContent.messages[0].text);

const brokenWithNotice = parseApiConversation({
    current_node: 'user',
    mapping: {
        user: { parent: 'missing', message: { ...message('user', ''), content: { content_type: 'multimodal_text', parts: [attachmentPart] } } }
    }
});
assert(brokenWithNotice.incomplete);
assert(brokenWithNotice.warning);
assert(brokenWithNotice.notice);
assert(buildMarkdown(brokenWithNotice).content.includes(brokenWithNotice.notice));


const broken = parseApiConversation({ current_node: 'a', mapping: { a: { parent: 'missing', message: message('assistant', 'tail') } } });
assert(broken.incomplete);
assert(buildMarkdown(broken).content.includes(broken.warning));
const cycle = parseApiConversation({ current_node: 'a', mapping: { a: { parent: 'a', message: message('assistant', 'tail') } } });
assert(cycle.incomplete);
assert.equal(cycle.messages.length, 1);
assert(parseApiConversation({ ...payload, next_cursor: 'more' }).incomplete);
const long = { current_node: 'n600', mapping: { root: { parent: null } } };
for (let i = 1; i <= 600; i++) long.mapping['n' + i] = { parent: i === 1 ? 'root' : 'n' + (i - 1), message: message('user', 'line-' + i) };
assert.equal(parseApiConversation(long).messages.length, 600);
assert.equal(parseApiConversation(long).incomplete, false);
assert.equal(getConversationIdFromUrl('/gg/group'), null);
assert.equal(getConversationIdFromUrl('/g/custom/c/11111111-1111-4111-8111-111111111111'), '11111111-1111-4111-8111-111111111111');
assert.deepEqual(compareTranscripts([], []), { match: true, differences: [] });
assert.deepEqual(compareTranscripts([transcript('user', ' a\r\nb\u00a0 ')], [transcript('user', 'a\nb ')]), { match: true, differences: [] });
const apiFormatted = transcript('assistant', [
    '## Summary',
    '',
    '**Keep** the original value.',
    '',
    '1. First option',
    '2. [Official guide](https://example.test/guide)',
    '',
    '- Second option',
    '',
    'A cited claim<Cite refs={ref-1} />',
    '',
    '`<literal>` and `a  b` stay exact.'
].join('\n'));
const domFormatted = transcript('assistant', [
    'Summary',
    'Keep the original value.',
    'First option',
    'Official guide',
    'Second option',
    'A cited claim',
    '<literal> and a  b stay exact.'
].join('\n\n'));
assert.equal(prepareComparisonMessage(apiFormatted, 'api').body, prepareComparisonMessage(domFormatted, 'dom').body);
assert.equal(compareTranscripts([apiFormatted], [domFormatted]).match, true);
for (const changed of [
    domFormatted.text.replace('original', 'changed'),
    domFormatted.text.replace('Second option', 'First option'),
    domFormatted.text.replace('claim', 'claim.'),
    domFormatted.text.replace('<literal>', 'literal'),
    domFormatted.text.replace('a  b', 'a b')
]) {
    assert.equal(compareTranscripts([apiFormatted], [transcript('assistant', changed)]).match, false);
}
const apiCitation = prepareComparisonMessage(transcript('assistant', 'A claim <Cite refs={r1} />'), 'api');
const legacyCitation = prepareComparisonMessage(transcript('assistant', 'A claim Source domain +1'), 'dom');
assert.equal(apiCitation.body, 'A claim');
assert.equal(legacyCitation.body, 'A claim Source domain +1');
assert.notDeepEqual(apiCitation.citations, legacyCitation.citations);
const progress = transcript('assistant', 'Working through the steps.');
const formalA = transcript('assistant', '**Answer**\n\n1. One\n2. Two');
const formalD = transcript('assistant', 'Answer\n\nOne\n\nTwo');
const progressResult = compareTranscripts(
    [transcript('user', 'Question'), progress, formalA],
    [transcript('user', 'Question'), formalD]
);
assert.deepEqual(progressResult.differences.map(({ kind, apiIndex, domIndex }) => ({ kind, apiIndex, domIndex })), [
    { kind: 'api-only', apiIndex: 2, domIndex: null }
]);
const taggedProgress = { ...progress, channel: 'commentary' };
const taggedFinal = { ...formalA, channel: 'final' };
const separated = compareTranscripts([taggedProgress, taggedFinal], [formalD]);
assert.equal(separated.match, true);
assert.deepEqual(separated.progress.map(item => ({ index: item.apiIndex, text: item.api.text })), [{ index: 1, text: progress.text }]);
assert.equal(compareTranscripts([taggedProgress, taggedFinal], [transcript('assistant', 'Changed answer')]).match, false);
assert.equal(compareTranscripts([taggedProgress], []).match, false);
assert.equal(compareTranscripts([taggedProgress, taggedFinal], [taggedProgress, formalD]).progress, undefined);
const layout = '<row align="center">\n  <icon name="calendar"/>\n  <box>\n    **Application period**\n\n    2026/1/1～2026/2/1\n  </box>\n</row>';
assert.equal(prepareComparisonMessage(transcript('assistant', layout), 'api').body, 'Application period\n2026/1/1～2026/2/1');
assert.equal(prepareComparisonMessage(transcript('assistant', '<row>\n  <text><Link title="Entry" url="https://example.test"/></text>\n</row>'), 'api').body, 'Entry');
assert.equal(compareTranscripts([transcript('assistant', 'Claim <Cite ref="r"/>\n\nNext')], [transcript('assistant', 'Claim\nNext')]).match, true);
const duplicateText = compareTranscripts(
    [transcript('user', 'repeat'), transcript('assistant', 'repeat'), transcript('assistant', 'repeat')],
    [transcript('user', 'repeat'), transcript('assistant', 'repeat')]
);
assert.deepEqual(duplicateText.differences.map(({ kind, apiIndex, domIndex }) => ({ kind, apiIndex, domIndex })), [
    { kind: 'api-only', apiIndex: 3, domIndex: null }
]);
const widget = prepareComparisonMessage(transcript('assistant', '<row><icon name="file"/><box><text>Attached: plan.pdf</text></box></row>'), 'api');
assert.equal(widget.body, 'Attached: plan.pdf');
assert.equal(compareTranscripts([transcript('user', '**literal** <Link title="input"/>')], [transcript('user', '**literal** <Link title="input"/>')]).match, true);
assert.equal(compareTranscripts([transcript('user', '**literal**')], [transcript('user', 'literal')]).match, false);
assert.equal(compareTranscripts([transcript('assistant', '```\n  indented\n```')], [transcript('assistant', 'indented')]).match, false);
assert.equal(compareTranscripts([transcript('assistant', 'a  b')], [transcript('assistant', 'a b')]).match, false);
const roleMismatch = compareTranscripts([transcript('user', 'same')], [transcript('assistant', 'same')]);
assert.equal(roleMismatch.match, false);
assert.deepEqual(roleMismatch.differences.map(({ apiIndex, domIndex, kind, api, dom }) => ({ apiIndex, domIndex, kind, api, dom })), [
    { apiIndex: 1, domIndex: 1, kind: 'role', api: transcript('user', 'same'), dom: transcript('assistant', 'same') }
]);
const inserted = transcript('assistant', 'progress');
const middleExtra = compareTranscripts(
    [transcript('user', 'first'), transcript('assistant', 'last')],
    [transcript('user', 'first'), inserted, transcript('assistant', 'last')]
);
assert.deepEqual(middleExtra.differences.map(({ apiIndex, domIndex, kind, api, dom }) => ({ apiIndex, domIndex, kind, api, dom })), [
    { apiIndex: null, domIndex: 2, kind: 'dom-only', api: null, dom: inserted }
]);
assert.equal(compareTranscripts([transcript('user', 'first'), transcript('assistant', 'last')], [transcript('assistant', 'last'), transcript('user', 'first')]).match, false);
const removed = transcript('assistant', 'removed middle');
const missingMiddle = compareTranscripts(
    [transcript('user', 'first'), removed, transcript('assistant', 'last')],
    [transcript('user', 'first'), transcript('assistant', 'last')]
);
assert.deepEqual(missingMiddle.differences.map(({ apiIndex, domIndex, kind, api, dom }) => ({ apiIndex, domIndex, kind, api, dom })), [
    { apiIndex: 2, domIndex: null, kind: 'api-only', api: removed, dom: null }
]);
const duplicateRoleOrder = compareTranscripts(
    [transcript('user', 'duplicate'), transcript('assistant', 'duplicate')],
    [transcript('assistant', 'duplicate'), transcript('user', 'duplicate')]
);
assert.equal(duplicateRoleOrder.match, false);
assert.deepEqual(compareTranscripts([], [transcript('assistant', 'only')]).differences.map(({ apiIndex, domIndex, kind, api, dom }) => ({ apiIndex, domIndex, kind, api, dom })), [
    { apiIndex: null, domIndex: 1, kind: 'dom-only', api: null, dom: transcript('assistant', 'only') }
]);
const manyApi = Array.from({ length: 600 }, (_, i) => transcript(i % 2 ? 'assistant' : 'user', `row-${i + 1}`));
assert.equal(compareTranscripts(manyApi, manyApi.map(row => ({ ...row }))).match, true);
console.log('ok ChatGPT API: active branch, hidden messages, dates, broken/cyclic chains, >500 messages');
