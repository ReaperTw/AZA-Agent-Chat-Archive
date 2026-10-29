// node tests/check-claude-combined.js
const assert = require('assert');
const api = require('../userscripts/gyc-claude.user.js');

const user = text => ({ role: 'user', text });
const assistant = text => ({ role: 'assistant', text });
const source = [user('Question'), assistant('**Hello**\n\n- one\n- two')];
const rendered = [user('Question'), assistant('Hello\none\ntwo')];
assert.strictEqual(api.compareTranscripts(source, rendered).match, true);
assert.strictEqual(api.compareTranscripts(source, [user('Question'), assistant('Changed')]).differences[0].kind, 'text');
assert.strictEqual(api.compareTranscripts(source, [assistant('Question'), assistant('Hello\none\ntwo')]).match, false);
assert.strictEqual(api.compareTranscripts([assistant('progress'), assistant('answer')], [assistant('answer')]).match, false);
assert.strictEqual(api.prepareComparisonMessage(assistant('`a  b`'), 'api').body, 'a  b');
assert.strictEqual(api.prepareComparisonMessage(assistant('text'), 'api').citations, null);
assert.match(api.buildMarkdown(source, 'DOM'), /^> \*\*匯出來源\*\*：DOM\n/);
assert.match(api.buildMarkdown(source), /^> \*\*匯出來源\*\*：API\n/);
const imageOnly = api.exportConversation({
    current_leaf_message_uuid: 'image-user',
    chat_messages: [{
        uuid: 'image-user', parent_message_uuid: null, sender: 'human', index: 0,
        files: [{ file_kind: 'image', file_name: 'example.png' }], content: []
    }]
});
assert.strictEqual(imageOnly.messages.length, 1);
assert(imageOnly.messages[0].text.includes('example.png'));
assert.strictEqual(imageOnly.messages[0].comparisonBody, '');
assert.strictEqual(api.compareTranscripts(imageOnly.messages, [{
    role: 'user', text: '> [附件]', comparisonBody: '', attachments: [{ type: 'image' }]
}]).match, true);
const withTools = api.exportConversation({
    current_leaf_message_uuid: 'tool-answer',
    chat_messages: [{
        uuid: 'tool-answer', parent_message_uuid: null, sender: 'assistant', index: 0,
        content: [
            { type: 'text', text: 'Checking sources.' },
            { type: 'tool_use', name: 'web_search', input: {} },
            { type: 'tool_result', name: 'web_search', content: [] },
            { type: 'text', text: '**Final answer**', citations: [{ url: 'https://example.test' }] }
        ]
    }]
});
assert(withTools.messages[0].text.includes('Checking sources.'));
assert.deepStrictEqual(withTools.messages[0].process, ['Checking sources.']);
assert.strictEqual(withTools.messages[0].citations.length, 1);
assert.strictEqual(api.compareTranscripts(withTools.messages, [assistant('Final answer')]).match, true);

const seen = [];
const item = (key, text) => ({ key, role: 'user', text });
api.mergeDomSnapshot(seen, [item('1', 'same'), item('2', 'same')]);
api.mergeDomSnapshot(seen, [item('2', 'same'), item('3', 'last')]);
assert.deepStrictEqual(seen.map(row => row.key), ['1', '2', '3']);
const noIds = [];
api.mergeDomSnapshot(noIds, [item('', 'first'), item('', 'same')]);
api.mergeDomSnapshot(noIds, [item('', 'same'), item('', 'last')]);
assert.deepStrictEqual(noIds.map(row => row.text), ['first', 'same', 'last']);
console.log('ok Claude combined behavior');
