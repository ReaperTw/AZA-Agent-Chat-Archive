const assert = require('node:assert/strict');
const { parseApiConversation, buildApiMarkdown, getConversationIdFromUrl } = require('../userscripts/gyc-chatgpt.user.js');
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
const markdown = buildApiMarkdown(parsed).content;
assert(!/secret|abandoned/.test(markdown));
assert(markdown.includes('visible-answer'));
assert.equal(parsed.messages[0].create_time, 1780000000);

const broken = parseApiConversation({ current_node: 'a', mapping: { a: { parent: 'missing', message: message('assistant', 'tail') } } });
assert(broken.incomplete);
assert(buildApiMarkdown(broken).content.includes(broken.warning));
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
