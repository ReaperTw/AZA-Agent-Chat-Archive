// node tests/check-export-delivery.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const shared = fs.readFileSync(path.join(root, 'userscripts/shared/export-renderer.js'), 'utf8');
const { buildExportReport } = vm.runInNewContext(shared + ';({buildExportReport})');
const longText = 'Synthetic long answer '.repeat(400) + 'END OF FULL DIFFERENCE';
const apiMessage = { role: 'assistant', text: longText, citations: [{ label: 'Manual' }], attachments: [{ name: 'input.txt' }], process: [] };
const domMessage = { role: 'assistant', text: 'Changed visible answer', citations: [], attachments: [], process: [] };
const integration = { entries: [{}], compared: true, comparison: { match: false, differences: [
    { kind: 'text', api: apiMessage, dom: domMessage, apiIndex: 1, domIndex: 1 }
] } };
const report = buildExportReport({ site: 'Synthetic', apiMessages: [apiMessage], domMessages: [domMessage], integration,
    notes: ['Relative time advisory', 'Excluded proven preamble advisory'] });
for (const text of [longText, domMessage.text, 'API：取得成功，1 則', 'DOM：取得成功，1 則',
    '引用：API 1 項／DOM 0 項', '附件：API 1 項／DOM 0 項', 'Relative time advisory', 'Excluded proven preamble advisory']) {
    assert(report.includes(text), text.slice(0, 100));
}
const failed = buildExportReport({ apiMessages: null, domMessages: [{ role: 'user', text: 'Visible' }],
    integration: { entries: [{}], compared: false }, errors: { api: 'Synthetic source failure' } });
assert(failed.includes('API：取得失敗：Synthetic source failure'));
assert(failed.includes('引用：API 未知 項／DOM 未知 項'));
console.log('ok debug delivery: full differences, source status, metadata counts and advisories; runtime tooltips covered by browser fixture');
