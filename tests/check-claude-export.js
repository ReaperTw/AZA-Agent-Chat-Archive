// node tests/check-claude-export.js
const assert = require('assert');
const path = require('path');
const api = require(path.join(__dirname, '../userscripts/gyc-claude.user.js'));

function check(name, fn) {
    fn();
    console.log('ok', name);
}

check('cookie and path', () => {
    assert.strictEqual(
        api.readCookie('foo=1; lastActiveOrg=abc%2Fdef; bar=2', 'lastActiveOrg'),
        'abc/def'
    );
    assert.strictEqual(api.readCookie('a=b', 'lastActiveOrg'), '');
    assert.strictEqual(
        api.conversationIdFromPath(
            '/project/11111111-1111-1111-1111-111111111111/chat/22222222-2222-2222-2222-222222222222'
        ),
        '22222222-2222-2222-2222-222222222222'
    );
    assert.strictEqual(api.conversationIdFromPath('/new'), '');
    assert.strictEqual(
        api.buildDownloadName('你好/世界', '20261011_120000'),
        'Claude_你好世界_20261011_120000.md'
    );
});

check('current branch ignores regenerated sibling', () => {
    const result = api.exportConversation({
        name: '分支',
        current_leaf_message_uuid: 'a2',
        chat_messages: [
            {
                uuid: 'u1', parent_message_uuid: null, index: 0, sender: 'human',
                content: [{ type: 'text', text: '問題' }]
            },
            {
                uuid: 'a1', parent_message_uuid: 'u1', index: 1, sender: 'assistant',
                content: [{ type: 'text', text: '舊回答' }]
            },
            {
                uuid: 'a2', parent_message_uuid: 'u1', index: 2, sender: 'assistant',
                content: [{ type: 'text', text: '新回答' }]
            }
        ]
    });
    assert.deepStrictEqual(result.messages.map(message => message.text), ['問題', '新回答']);
    assert.strictEqual(result.warnings.length, 0);
    assert.match(result.markdown, /--- \[User 1\] ---\n問題/);
    assert.match(result.markdown, /--- \[Model 1\] ---\n新回答/);
    assert.doesNotMatch(result.markdown, /舊回答/);
});

check('two-turn conversation ends at the Claude root sentinel', () => {
    const result = api.exportConversation({
        current_leaf_message_uuid: 'answer',
        chat_messages: [
            {
                uuid: 'question',
                parent_message_uuid: '00000000-0000-4000-8000-000000000000',
                sender: 'human', content: [{ type: 'text', text: '問題' }]
            },
            {
                uuid: 'answer', parent_message_uuid: 'question',
                sender: 'assistant', content: [{ type: 'text', text: '回答' }]
            }
        ]
    });
    assert.deepStrictEqual(result.messages.map(message => message.text), ['問題', '回答']);
    assert.deepStrictEqual(result.warnings, []);
    assert.doesNotMatch(result.markdown, /匯出不完整/);
});

check('missing leaf falls back to index', () => {
    const result = api.exportConversation({
        chat_messages: [
            { uuid: 'b', index: 2, sender: 'assistant', content: [{ type: 'text', text: '後' }] },
            { uuid: 'a', index: 1, sender: 'human', content: [{ type: 'text', text: '前' }] }
        ]
    });
    assert.deepStrictEqual(result.messages.map(message => message.text), ['前', '後']);
    assert.match(result.warnings.join('\n'), /無法確認目前分支/);
});

check('broken parent warns and keeps the tail', () => {
    const result = api.exportConversation({
        current_leaf_message_uuid: 'child',
        chat_messages: [{
            uuid: 'child',
            parent_message_uuid: 'missing',
            sender: 'human',
            content: [{ type: 'text', text: '只有尾巴' }]
        }]
    });
    assert.strictEqual(result.messages.length, 1);
    assert.match(result.warnings.join('\n'), /分支上游/);
});

check('artifact fold, thinking skip, attachment quote', () => {
    const result = api.exportConversation({
        current_leaf_message_uuid: 'm2',
        chat_messages: [
            {
                uuid: 'm1',
                parent_message_uuid: null,
                sender: 'assistant',
                created_at: '2026-01-01T12:00:00Z',
                content: [
                    { type: 'thinking', thinking: 'secret hypothesis' },
                    { type: 'text', text: '先看這個' },
                    {
                        type: 'tool_use',
                        name: 'artifacts',
                        input: {
                            command: 'create',
                            id: 'art1',
                            title: 'Demo',
                            type: 'application/vnd.ant.code',
                            language: 'js',
                            content: 'const x = "$&";\n```\ninner\n```',
                            version_uuid: 'v1'
                        }
                    },
                    { type: 'tool_use', name: 'web_search', input: { query: 'hidden query' } },
                    { type: 'tool_result', content: 'tool result secret' }
                ]
            },
            {
                uuid: 'm2',
                parent_message_uuid: 'm1',
                sender: 'human',
                created_at: '2026-01-05T12:00:00Z',
                stop_reason: 'user_canceled',
                files: [{
                    file_kind: 'image',
                    file_name: 'a.png',
                    preview_url: 'https://claude.ai/secret-preview'
                }],
                attachments: [{
                    file_name: 'notes.md',
                    extracted_content: '# Secret heading\nbody'
                }],
                content: [
                    { type: 'text', text: '看附件' },
                    {
                        type: 'tool_use',
                        name: 'artifacts',
                        input: {
                            command: 'update',
                            id: 'art1',
                            old_str: 'const x = "$&";',
                            new_str: 'const x = "$$";',
                            version_uuid: 'v2'
                        }
                    },
                    {
                        type: 'tool_use',
                        name: 'create_file',
                        input: { path: 'notes/a.py', file_text: 'print(1)\n' }
                    }
                ]
            }
        ]
    });

    assert.strictEqual(result.warnings.length, 0);
    assert.strictEqual(result.info.interrupted, 1);
    assert.deepStrictEqual(result.info.skippedTools, ['web_search']);
    assert.doesNotMatch(result.markdown, /secret hypothesis|tool result secret|hidden query|secret-preview/);
    assert.doesNotMatch(result.markdown, /const x = "\$&"/);
    assert.match(result.markdown, /const x = "\$\$"/);
    assert.match(result.markdown, /````/);
    assert.match(result.markdown, /print\(1\)/);
    assert.match(result.markdown, /圖片 a\.png/);
    assert.match(result.markdown, /> # Secret heading/);
    assert.strictEqual(result.markdown.split('對話時間').length - 1, 2);
    assert.match(result.markdown, /已中斷/);
    assert.strictEqual(result.messages[1].role, 'user');
});

check('non-unique artifact update warns', () => {
    const result = api.exportConversation({
        current_leaf_message_uuid: 'm1',
        chat_messages: [{
            uuid: 'm1',
            sender: 'assistant',
            content: [
                {
                    type: 'tool_use',
                    name: 'artifacts',
                    input: {
                        command: 'create',
                        id: 'art',
                        title: 'Dup',
                        content: 'same\nsame',
                        version_uuid: 'v1'
                    }
                },
                {
                    type: 'tool_use',
                    name: 'artifacts',
                    input: {
                        command: 'update',
                        id: 'art',
                        old_str: 'same',
                        new_str: 'changed',
                        version_uuid: 'v2'
                    }
                }
            ]
        }]
    });
    assert.match(result.warnings.join('\n'), /不唯一/);
    assert.match(result.markdown, /changed\nsame/);
});

check('pagination warning stays in the file', () => {
    const result = api.exportConversation({
        name: '長對話',
        has_more: true,
        chat_messages: [{
            uuid: 'u1', sender: 'human', index: 0,
            content: [{ type: 'text', text: '還有下一頁' }]
        }]
    });
    assert.match(result.markdown, /匯出不完整/);
    assert.match(result.markdown, /還有下一頁/);
    assert.strictEqual(api.nextPageUrl('opaque-token'), '');
    assert.strictEqual(api.nextPageUrl('/api/next'), '/api/next');
    const merged = api.mergeConversationPages([
        { chat_messages: [{ uuid: 'a' }], next_cursor: '/api/p2' },
        { chat_messages: [{ uuid: 'a' }, { uuid: 'b' }] }
    ]);
    assert.strictEqual(merged.chat_messages.length, 2);
    assert.strictEqual(merged.has_more, false);
});


check('rejects a response without chat_messages', () => {
    assert.throws(() => api.exportConversation({ name: 'x' }), /chat_messages/);
});

console.log('ok');
