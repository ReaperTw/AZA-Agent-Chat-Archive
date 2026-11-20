'use strict';

const fs = require('node:fs');
const path = require('node:path');

const providers = Object.freeze(['chatgpt', 'claude', 'gemini', 'grok']);
const BEGIN = '// BEGIN GENERATED EXPORT RENDERER';
const END = '// END GENERATED EXPORT RENDERER';

function renderUserscript(source, sharedSource, provider) {
    if (!providers.includes(provider)) throw new Error(`Unknown userscript provider: ${provider}`);
    for (const marker of [BEGIN, END]) {
        const count = source.split(marker).length - 1;
        if (count !== 1) throw new Error(`${provider}: expected exactly one ${marker}; found ${count}`);
    }
    const begin = /^[\t ]*\/\/ BEGIN GENERATED EXPORT RENDERER(?=\r?$)/m.exec(source);
    const end = /^[\t ]*\/\/ END GENERATED EXPORT RENDERER(?=\r?$)/m.exec(source);
    if (!begin || !end) throw new Error(`${provider}: generated renderer markers must be on their own lines`);
    if (begin.index >= end.index) throw new Error(`${provider}: generated renderer markers are reversed`);
    const newline = source.includes('\r\n') ? '\r\n' : '\n';
    const body = sharedSource.replace(/\r\n?/g, '\n').trimEnd().replace(/\n/g, newline);
    const generated = `    const EXPORT_RENDERER_PROVIDER = '${provider}';${newline}${body}${newline}`;
    return source.slice(0, begin.index + begin[0].length) + newline + generated + source.slice(end.index);
}

function buildUserscripts({ check = false, rootDir = path.resolve(__dirname, '..') } = {}) {
    const sharedSource = fs.readFileSync(path.join(rootDir, 'userscripts/shared/export-renderer.js'), 'utf8');
    const changed = [];
    const updates = [];
    // Validate every marker before writing any output.
    for (const provider of providers) {
        const relativePath = `userscripts/gyc-${provider}.user.js`;
        const filename = path.join(rootDir, relativePath);
        const source = fs.readFileSync(filename, 'utf8');
        const rendered = renderUserscript(source, sharedSource, provider);
        if (rendered !== source) {
            changed.push(relativePath);
            updates.push({ filename, rendered });
        }
    }
    if (check && changed.length) {
        throw new Error(`Generated export renderer drift: ${changed.join(', ')}. Run node scripts/build-userscripts.js`);
    }
    if (!check) for (const { filename, rendered } of updates) fs.writeFileSync(filename, rendered);
    return changed;
}

module.exports = { providers, renderUserscript, buildUserscripts };

if (require.main === module) {
    try {
        const args = process.argv.slice(2);
        if (args.some(arg => arg !== '--check')) throw new Error('Usage: node scripts/build-userscripts.js [--check]');
        const changed = buildUserscripts({ check: args.includes('--check') });
        console.log(args.includes('--check') ? 'Generated export renderers are up to date.' : `Updated ${changed.length} userscript(s).`);
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
