// node tests/check-render-snapshots.js
const assert = require('node:assert/strict');
const snapshots = require('./fixtures/com-render-snapshots.json');

// Expected strings were captured from the pre-refactor revision recorded in the
// fixture, using git-show sources in isolated VM contexts, not current modules.
const providers = ['chatgpt', 'claude', 'gemini', 'grok'];
assert.deepEqual(snapshots.provenance.providers, providers);
for (const provider of providers) {
    const { buildIntegratedMarkdown } = require(`../userscripts/gyc-${provider}.user.js`);
    for (const { name, apiMessages, domMessages, options, expected } of snapshots.cases) {
        assert.equal(typeof expected[provider], 'string', `${provider}: ${name}: missing baseline`);
        // Keep each invocation independent even if a builder mutates its inputs.
        const input = JSON.parse(JSON.stringify({ apiMessages, domMessages, options }));
        const { content } = buildIntegratedMarkdown(input.apiMessages, input.domMessages, input.options);
        assert.equal(content, expected[provider], `${provider}: ${name}: COM output changed`);
    }
    console.log(`ok ${provider}: ${snapshots.cases.length} exact COM snapshots`);
}
