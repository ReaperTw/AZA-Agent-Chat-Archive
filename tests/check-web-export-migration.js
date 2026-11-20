// node tests/check-web-export-migration.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { convertMarkdown, convertFilename } = require('../scripts/convert-web-export.js');
const { runMigration } = require('../scripts/migrate-web-exports.js');
const stamp = '20261108_181527';
const literal = ['Visible prose with  two spaces  ', '', '> Ordinary quoted body', '',
    '> **API 時間**：2026/11/8 下午6:07:00', '> **時間**：this is ordinary quoted prose', '',
    '> ~~~text', '> [cite: 93]', '> ~~~', '',
    '````markdown', '> **API 時間**：2026/11/8 下午6:05:00', '```json', '{"literal":true}', '```',
    '[cite: 91]', '> [圖片本體未嵌入匯出檔]', '````', '', 'Inline `[cite: 92]` remains literal.'].join('\n');
const legacy = site => [
    '> **匯出來源**：API + DOM', '> **核對結果**：核對完成', '> **擷取方式**：API',
    `> **來源網站**：${site}`, '> **網址**：https://example.test/chat#fragment', '',
    '> **注意**', '> - 相對時間僅供提示', '> - 歷史不完整：未捲到第一則', '',
    '> **對話時間**：2026/11/8 下午6:04:06', '', '--- [User 1] ---', '', 'Synthetic question', '',
    '--- [Model 1] ---', '', '> **API 時間**：2026/11/8 下午6:15:27', '', literal, '',
    '引用：', '```json', '[{"label":"Manual +2","url":"https://example.test/manual"},{"label":"PubMed +1"}]', '```', '',
    '附件：', '```json', '[{"name":"report.pdf"},{"type":"image_asset_pointer"},{"unknown":7}]', '```', ''
].join('\n');
(async () => {
    for (const [code, site] of Object.entries({ GPT: 'ChatGPT', CLD: 'Claude', GEM: 'Gemini', Grok: 'Grok' })) {
        const converted = convertMarkdown(legacy(site), code);
        assert(converted.content.includes(literal), `${code}: prose and nested code must be byte-identical`);
        const userBody = converted.content.split('--- [User 1] ---')[1]?.split('--- [Model 1] ---')[0];
        assert.equal(userBody?.trim(), 'Synthetic question', `${code}: removing metadata leaves the same user body`);
        assert(converted.content.includes('> **對話時間**：2026/11/8 下午6:04:06 – 下午6:15:27'), `${code}: range`);
        assert(converted.content.includes(`> **來源網站**：${site}`));
        assert(converted.content.includes('> **網址**：https://example.test/chat\n'));
        assert(converted.content.includes('> **不完整**：'));
        assert(!converted.content.includes('相對時間僅供提示'));
        assert(!converted.content.includes('> **匯出來源**'));
        assert(converted.content.includes('引用：[Manual](https://example.test/manual)；PubMed'));
        assert(converted.content.includes('附件：report.pdf；{"unknown":7}'));
        assert.equal(convertMarkdown(converted.content, code).content, converted.content, `${code}: idempotent`);
        const crlf = '\uFEFF' + legacy(site).replace(/\n/g, '\r\n');
        const crlfResult = convertMarkdown(crlf, code).content;
        assert(crlfResult.startsWith('\uFEFF'), 'preserve BOM');
        assert(crlfResult.includes(literal.replace(/\n/g, '\r\n')), 'preserve body CRLF bytes');
        for (const name of [`${code}_API_Title_${stamp}.md`, `${code}_DOM_Title_${stamp}_INCOMPLETE.md`,
            `${code}_Title_${stamp}_COM.md`, `${code}_Title_${stamp}_COMBINED.md`]) {
            assert.equal(convertFilename(name).target, `${code}_Title_${stamp}.md`, name);
        }
        assert(convertFilename(`${code}_Title_${stamp}_COM (1).md`).duplicate);
    }
    const gem = convertMarkdown('--- [Model 1] ---\n\nAnswer [cite: 1].\n\n`[cite: 2]`\n\n~~~text\n[cite: 3]\n~~~\n', 'GEM').content;
    assert(gem.includes('Answer.') && gem.includes('`[cite: 2]`') && gem.includes('\n[cite: 3]\n'));
    assert.equal(convertFilename('ordinary-note.md'), null);
    const marks = convertMarkdown(['--- [Model 1] ---', '', '> **來源衝突**', '',
        '> 僅有 API 訊息', '', '> [圖片本體未嵌入匯出檔]', ''].join('\n'), 'CLD').content;
    for (const marker of ['> **來源衝突，兩版並列**', '> 僅 API 有此訊息', '> [圖片]']) assert(marks.includes(marker));
    const appendix = convertMarkdown('## 待確認 API 內容（不屬於正式正文）\n\n### 待確認 API #1（assistant）\n\n```text\nSynthetic pending text\n```\n', 'GPT').content;
    assert(appendix.includes('> **不完整**：沒有頁面正文'));
    assert(appendix.includes('```text\nSynthetic pending text\n```'));
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'aza-migration-'));
    try {
        const input = path.join(temp, 'input'), backup = path.join(temp, 'backup');
        fs.mkdirSync(input);
        const name = `GPT_API_Synthetic_${stamp}.md`, source = path.join(input, name);
        const original = Buffer.from('\uFEFF' + legacy('ChatGPT'));
        fs.writeFileSync(source, original);
        const duplicate = path.join(input, `GPT_API_Synthetic_${stamp} (1).md`);
        fs.writeFileSync(duplicate, 'Duplicate must stay untouched');
        const cli = path.resolve(__dirname, '../scripts/migrate-web-exports.js');
        const dry = spawnSync(process.execPath, [cli, input, '--rename'], { encoding: 'utf8' });
        assert.equal(dry.status, 0, dry.stderr);
        assert(/catalog/i.test(dry.stdout) && /連結/.test(dry.stdout), 'dry-run must warn about stale links');
        assert.deepEqual(fs.readFileSync(source), original, 'dry-run cannot alter source bytes');
        assert(!fs.existsSync(backup), 'dry-run cannot create backups');
        await runMigration({ input, apply: true, backupDir: backup });
        assert(fs.existsSync(source), 'apply without rename keeps original name');
        assert.deepEqual(fs.readFileSync(path.join(backup, name)), original, 'backup original bytes before content edits');
        assert.equal(fs.readFileSync(duplicate, 'utf8'), 'Duplicate must stay untouched');
        const renameBackup = path.join(temp, 'rename-backup');
        await runMigration({ input, apply: true, rename: true, backupDir: renameBackup });
        const target = path.join(input, `GPT_Synthetic_${stamp}.md`);
        assert(fs.existsSync(target) && !fs.existsSync(source), 'explicit apply+rename moves source to daily name');
        assert(fs.existsSync(duplicate), 'duplicates are never deleted');
        const collide = path.join(input, `GPT_DOM_Synthetic_${stamp}.md`);
        fs.writeFileSync(collide, original);
        const targetBefore = fs.readFileSync(target);
        await runMigration({ input, apply: true, rename: true, backupDir: path.join(temp, 'collision-backup') });
        assert.deepEqual(fs.readFileSync(collide), original, 'existing target collision skips entire source');
        assert.deepEqual(fs.readFileSync(target), targetBefore, 'existing target never overwritten');
        const planned = path.join(temp, 'planned');
        fs.mkdirSync(planned);
        const names = [`CLD_API_same_${stamp}.md`, `CLD_DOM_same_${stamp}.md`];
        for (const name of names) fs.writeFileSync(path.join(planned, name), legacy('Claude'));
        await runMigration({ input: planned, apply: true, rename: true, backupDir: path.join(temp, 'planned-backup') });
        for (const name of names) assert.equal(fs.readFileSync(path.join(planned, name), 'utf8'), legacy('Claude'), 'planned collisions skip all contenders');
        const refused = spawnSync(process.execPath, [cli, input, '--apply'], { encoding: 'utf8' });
        assert.notEqual(refused.status, 0, 'apply requires explicit backup directory');
        const lockedInput = path.join(temp, 'backup-collision'), lockedBackup = path.join(temp, 'existing-backup');
        fs.mkdirSync(lockedInput); fs.mkdirSync(lockedBackup);
        fs.writeFileSync(path.join(lockedInput, name), original);
        fs.writeFileSync(path.join(lockedBackup, name), 'Existing backup sentinel');
        const locked = spawnSync(process.execPath, [cli, lockedInput, '--apply', '--backup-dir', lockedBackup], { encoding: 'utf8' });
        assert.notEqual(locked.status, 0, 'existing backup must fail safely');
        assert.deepEqual(fs.readFileSync(path.join(lockedInput, name)), original, 'backup failure cannot mutate source');
        assert.equal(fs.readFileSync(path.join(lockedBackup, name), 'utf8'), 'Existing backup sentinel');
        const invalidInput = path.join(temp, 'invalid-utf8');
        fs.mkdirSync(invalidInput);
        const invalidBytes = Buffer.from([0xff, 0xfe, 0x80]);
        fs.writeFileSync(path.join(invalidInput, name), invalidBytes);
        const invalid = spawnSync(process.execPath, [cli, invalidInput, '--apply', '--backup-dir', path.join(temp, 'invalid-backup')], { encoding: 'utf8' });
        assert.notEqual(invalid.status, 0, 'invalid UTF-8 cannot be silently replaced');
        assert.deepEqual(fs.readFileSync(path.join(invalidInput, name)), invalidBytes);
    } finally { fs.rmSync(temp, { recursive: true, force: true }); }
    {
        const guarded = fs.mkdtempSync(path.join(os.tmpdir(), 'aza-protect-'));
        try {
            const names = ['GEM_角色甲_20250101_000000_COM.md', 'AUTO_BACKUP_GPT_x_20250101_000000_COM.md', 'GPT_normal_20250101_000000_COM.md'];
            for (const name of names) fs.writeFileSync(path.join(guarded, name), legacy('Gemini'));
            const report = runMigration({ input: guarded, rename: true, exclude: ['角色甲'] });
            const status = Object.fromEntries(report.entries.map(entry => [path.basename(entry.source), entry]));
            for (const name of names.slice(0, 2)) {
                assert.equal(status[name].status, 'skipped-protected', name);
                assert.equal(status[name].target, status[name].source, `${name}: never renamed`);
            }
            assert.notEqual(status[names[2]].status, 'skipped-protected');
            const cli = spawnSync(process.execPath, [path.resolve(__dirname, '../scripts/migrate-web-exports.js'), guarded, '--rename', '--exclude', '角色甲'], { encoding: 'utf8' });
            assert(cli.stdout.includes('[skipped-protected]'), 'CLI --exclude reaches the migration');
        } finally { fs.rmSync(guarded, { recursive: true, force: true }); }
    }
    console.log('ok migration: four legacy formats, literal bodies/code, idempotence, dry-run, backups, explicit rename and collisions');
})().catch(error => { console.error(error); process.exitCode = 1; });
