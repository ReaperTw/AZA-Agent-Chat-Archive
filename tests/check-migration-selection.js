'use strict';

// node tests/check-migration-selection.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { runMigration } = require('../scripts/migrate-web-exports.js');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'aza-selection-'));
const input = path.join(temp, 'input');
const backup = path.join(temp, 'backup');
const cli = path.resolve(__dirname, '../scripts/migrate-web-exports.js');
const legacy = '--- [User 1] ---\n\nQuestion\n\n--- [Model 1] ---\n\nAnswer\n';
try {
    fs.mkdirSync(input);
    fs.writeFileSync(path.join(input, 'OMP_skill.md'), legacy);
    fs.writeFileSync(path.join(input, 'AGY_skill.md'), legacy);
    fs.writeFileSync(path.join(input, 'Claude_skill.md'), legacy);
    const nested = path.join(input, 'task', 'conversation.md');
    fs.mkdirSync(path.dirname(nested), { recursive: true });
    fs.writeFileSync(nested, legacy);
    fs.writeFileSync(path.join(input, 'notes.md'), '# Ordinary note\nNo dividers here.\n');
    fs.writeFileSync(path.join(input, 'broken.md'), '--- [User 1] ---\n--- [Model 3] ---\n');
    fs.writeFileSync(path.join(input, 'GEM_API_cites_20261108_181527.md'), '--- [Model 1] ---\n\nAnswer [cite: 1].\n');

    const excluded = path.join(input, 'private', 'conversation.md');
    fs.mkdirSync(path.dirname(excluded));
    fs.writeFileSync(excluded, Buffer.from([0xff, 0xfe]));
    const protectedDir = path.join(input, 'AUTO_BACKUP_old');
    fs.mkdirSync(protectedDir);
    fs.writeFileSync(path.join(protectedDir, 'conversation.md'), Buffer.from([0xff, 0xfe]));

    const original = fs.readFileSync(path.join(input, 'OMP_skill.md'));
    const dry = spawnSync(process.execPath, [cli, input, '--rename', '--exclude', 'private'], { encoding: 'utf8' });
    assert.equal(dry.status, 0, dry.stderr + dry.stdout);
    assert.match(dry.stdout, /bodyByteIdentical=/);
    assert.match(dry.stdout, /Counts:/);
    assert.match(dry.stdout, /Gates:/);
    assert.deepEqual(fs.readFileSync(path.join(input, 'OMP_skill.md')), original);
    assert.equal(fs.existsSync(backup), false);

    const report = runMigration({ input, rename: true, exclude: ['private'] });
    const byRelative = new Map(report.entries.map(entry => [path.relative(input, entry.source), entry]));
    for (const name of ['OMP_skill.md', 'AGY_skill.md', 'Claude_skill.md', path.join('task', 'conversation.md')]) {
        assert.equal(byRelative.get(name).status, 'planned', name);
        assert.equal(byRelative.get(name).target, byRelative.get(name).source, 'unknown filename is retained');
    }
    assert.equal(byRelative.get('notes.md').status, 'skipped-non-conversation');
    assert.equal(byRelative.get('broken.md').status, 'skipped-nonsequential');
    assert(byRelative.get('broken.md').warnings.length > 0, 'sequence refusal has a reason');
    assert.equal(byRelative.get('broken.md').verification.beforeSeparators, 2);
    assert.equal(byRelative.get('private').status, 'skipped-protected');
    assert.equal(byRelative.get('AUTO_BACKUP_old').status, 'skipped-protected');
    assert.equal(byRelative.has(path.join('private', 'conversation.md')), false);
    assert.equal(byRelative.has(path.join('AUTO_BACKUP_old', 'conversation.md')), false);
    assert.equal(report.gates.files, 5);
    assert.equal(report.gates.bodyByteIdentical, false, 'citation rewriting must not be called lossless');
    assert.equal(report.gates.bodyFailures, 1);
    assert.equal(report.gates.separatorCountsEqual, true);
    assert.equal(report.gates.idempotent, true);
    assert.equal(report.counts['skipped-nonsequential'], 1);

    const apply = runMigration({ input: path.join(input, 'OMP_skill.md'), apply: true, backupDir: backup });
    assert.equal(apply.entries[0].status, 'applied');
    assert(fs.existsSync(path.join(backup, 'OMP_skill.md')));
    assert.equal(fs.readFileSync(path.join(backup, 'OMP_skill.md'), 'utf8'), legacy);
} finally {
    fs.rmSync(temp, { recursive: true, force: true });
}
