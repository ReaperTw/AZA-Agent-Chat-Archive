const assert = require('node:assert/strict');
const { parseApiConversation, buildMarkdown, getConversationIdFromUrl } = require('../userscripts/gyc-chatgpt.user.js');
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

const uncertainVisibility = parseApiConversation(apiChain([
    ['question', message('user', 'question')],
    ['progress', message('assistant', 'unconfirmed progress', { channel: 'commentary', recipient: 'all' })],
    ['answer', message('assistant', 'answer', { channel: 'final' })]
]));
assert.deepEqual(uncertainVisibility.messages.map(m => m.text), ['question', 'answer']);
assert(uncertainVisibility.incomplete);
assert(uncertainVisibility.warning);
assert(!buildMarkdown(uncertainVisibility).content.includes('unconfirmed progress'));
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
console.log('ok ChatGPT API: active branch, hidden messages, dates, broken/cyclic chains, >500 messages');
