const assert = require('assert');
const { compareTranscripts, prepareComparisonMessage } = require('../userscripts/gyc-grok.user.js');

const user = { role: 'user', text: 'Copy text\nShare\nGrok 3.0 is my question' };
const api = [user, { role: 'assistant', text: 'Hello **world**\n\n- one\n- two' }];
const dom = [user, { role: 'assistant', text: 'Hello world\none\ntwo' }];
assert(compareTranscripts(api, dom).match, 'rendered Markdown should match DOM text');
assert.strictEqual(prepareComparisonMessage(user, 'api').body, user.text, 'literal user content is preserved');
assert.strictEqual(prepareComparisonMessage({ role: 'assistant', text: 'Grok 3.0 is useful' }, 'api').body, 'Grok 3.0 is useful');
assert(!compareTranscripts(api, [user, { role: 'assistant', text: 'Hello other' }]).match, 'actual text difference');
assert(!compareTranscripts(api, [user, { role: 'user', text: dom[1].text }]).match, 'role difference');
assert(!compareTranscripts([user, { role: 'assistant', text: 'working', channel: 'commentary' }, api[1]], dom).match, 'Grok progress is not inferred from labels');
assert.strictEqual(prepareComparisonMessage(api[1], 'api').citations, null, 'unknown citations are not claimed absent');
