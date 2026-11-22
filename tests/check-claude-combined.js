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

// Reference labels are metadata, not answer text; keep the original export intact.
const referenced = assistant("Answer\n\nSources:\n- [Publisher's title](https://example.test/source)");
const preparedReferences = api.prepareComparisonMessage(referenced, 'api');
assert.strictEqual(preparedReferences.body, 'Answer');
assert.deepStrictEqual(preparedReferences.citations, [{ label: "Publisher's title", url: 'https://example.test/source' }]);
assert.strictEqual(api.compareTranscripts([referenced], [assistant('Answer')]).match, true);
assert(api.buildIntegratedMarkdown([referenced], [assistant('Answer')]).content.includes(referenced.text));
assert.strictEqual(api.compareTranscripts([assistant("Publisher's answer")], [assistant('Publisher’s answer')]).match, true);
assert.strictEqual(api.compareTranscripts([assistant("It's **the publisher's** [answer](https://example.test)")],
    [assistant('It’s the publisher’s answer')]).match, true);
assert.strictEqual(api.compareTranscripts([assistant("Publisher's original")], [assistant('Publisher’s revision')]).match, false);
assert.strictEqual(api.compareTranscripts([user("It's literal")], [user('It’s literal')]).match, false);
for (const text of ["`don't`", "```\ndon't\n```"]) {
    assert.strictEqual(api.prepareComparisonMessage(assistant(text), 'api').body, "don't");
    assert.strictEqual(api.compareTranscripts([assistant(text)], [assistant('don’t')]).match, false);
}
assert.strictEqual(api.prepareComparisonMessage(assistant("'quoted' and 6'2"), 'api').body, "'quoted' and 6'2");
assert.strictEqual(api.prepareComparisonMessage(assistant("don\\'t"), 'api').body, "don't");
for (const text of [
    'Answer\n\nSources:\n- Important unlinked text',
    'Answer\n\nSources:\n- [Source](https://example.test) with extra explanation',
    'Answer\n\nSources:\n- [Source](https://example.test)\n\nMore answer',
    '```text\nSources:\n- [Source](https://example.test)\n```'
]) assert(api.prepareComparisonMessage(assistant(text), 'api').body.includes('Sources:'));
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

// A virtualized snapshot can expose the tail before the middle finishes loading.
const chronological = Array.from({ length: 16 }, (_, i) => ({
    key: `id:${i + 1}`, role: i % 2 ? 'assistant' : 'user', text: `message-${i + 1}`
}));
const delayed = [];
api.mergeDomSnapshot(delayed, [...chronological.slice(0, 4), ...chronological.slice(13)]);
api.mergeDomSnapshot(delayed, chronological);
assert.deepStrictEqual(delayed.map(row => row.key), chronological.map(row => row.key));
const integrated = api.integrateTranscripts(chronological, delayed);
assert.strictEqual(integrated.comparison.match, true);
assert.strictEqual(integrated.entries.length, 16);

// Partial snapshots must also insert before/after an anchor, not at the end.
const partial = [item('2', 'same'), item('4', 'same')];
api.mergeDomSnapshot(partial, [item('1', 'same'), item('2', 'same')]);
api.mergeDomSnapshot(partial, [item('2', 'same'), item('3', 'same')]);
api.mergeDomSnapshot(partial, [item('3', 'same'), item('4', 'longer')]);
assert.deepStrictEqual(partial.map(row => row.key), ['1', '2', '3', '4']);
assert.strictEqual(partial[3].text, 'longer');
console.log('ok Claude combined behavior');
