// node tests/check-export-filenames.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../userscripts/shared/export-renderer.js'), 'utf8');
const { buildExportFilename } = vm.runInNewContext(source + ';({buildExportFilename})');
const timestamp = '20261108_181527';
for (const code of ['GPT', 'CLD', 'GEM', 'Grok']) {
    assert.equal(buildExportFilename(code, '合成對話', timestamp), `${code}_合成對話_${timestamp}.md`);
    for (const kind of ['API', 'DOM', 'REPORT']) {
        assert.equal(buildExportFilename(code, '合成對話', timestamp, kind), `${code}_合成對話_${timestamp}_${kind}.md`);
    }
    assert.equal(buildExportFilename(code, ' x<>:"/\\|?*\u0001 ', timestamp), `${code}_x_${timestamp}.md`);
    assert.equal(buildExportFilename(code, '', timestamp), `${code}_Chat_${timestamp}.md`);
}
assert.throws(() => buildExportFilename('unknown', 'title', timestamp), /site code/);
assert.throws(() => buildExportFilename('GPT', 'title', timestamp, 'COM'), /debug export kind/);
console.log('ok filenames: four sites × daily/API/DOM/REPORT, sanitized titles and no legacy mode kinds');
