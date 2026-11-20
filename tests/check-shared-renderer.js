// node tests/check-shared-renderer.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { renderUserscript, buildUserscripts } = require('../scripts/build-userscripts.js');
const root = path.resolve(__dirname, '..');
const sharedPath = 'userscripts/shared/export-renderer.js';
const shared = fs.readFileSync(path.join(root, sharedPath), 'utf8');
const providers = ['chatgpt', 'claude', 'gemini', 'grok'];
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'aza-renderer-'));
try {
    fs.mkdirSync(path.join(temporary, 'userscripts/shared'), { recursive: true });
    fs.writeFileSync(path.join(temporary, sharedPath), shared);
    for (const provider of providers) {
        const relative = `userscripts/gyc-${provider}.user.js`;
        const source = fs.readFileSync(path.join(root, relative), 'utf8');
        assert.equal(source, renderUserscript(source, shared, provider), `${provider}: rebuild required`);
        fs.writeFileSync(path.join(temporary, relative), source);
    }
    buildUserscripts({ check: true, rootDir: temporary });
    const target = path.join(temporary, 'userscripts/gyc-grok.user.js');
    fs.writeFileSync(target, fs.readFileSync(target, 'utf8').replace('function formatTimeRange(', 'function manuallyEditedTimeRange('));
    assert.throws(() => buildUserscripts({ check: true, rootDir: temporary }), /grok|drift|sync|stale|generated|build/i,
        'A manual edit to generated code must fail the check');
    fs.writeFileSync(target, renderUserscript(fs.readFileSync(target, 'utf8'), shared, 'grok'));
    buildUserscripts({ check: true, rootDir: temporary });
    fs.writeFileSync(path.join(temporary, sharedPath), shared + '\n// Synthetic source change\n');
    assert.throws(() => buildUserscripts({ check: true, rootDir: temporary }), /drift|sync|stale|generated|build/i,
        'Changing the shared source must invalidate every generated block');
} finally {
    fs.rmSync(temporary, { recursive: true, force: true });
}
console.log('ok shared renderer: synchronized artifacts, manual-edit and source-change drift detection');
