// node tests/check-merge-timelines.js
const path = require('path');
const { mergeTimelines } = require(path.join(__dirname, '../userscripts/gyc-grok.user.js'));

function assert(cond, msg) {
    if (!cond) throw new Error(msg);
}

let r = mergeTimelines(
    [{ type: 'user', text: '好' }, { type: 'ai', text: '嗯' }],
    [{ type: 'user', text: '好' }, { type: 'ai', text: '嗯' }, { type: 'user', text: '下一則' }]
);
assert(!r.hasGap && r.merged.length === 3 && r.merged[2].text === '下一則', 'exact overlap');

r = mergeTimelines(
    [{ type: 'user', text: '問' }, { type: 'ai', text: 'Hello' }],
    [{ type: 'ai', text: 'Hello world' }]
);
assert(!r.hasGap && r.merged.length === 2 && r.merged[1].text === 'Hello world', 'grow last');

r = mergeTimelines(
    [{ type: 'user', text: '好' }, { type: 'ai', text: '收到' }],
    [{ type: 'user', text: '好的請寫報告' }]
);
assert(r.hasGap && r.merged.length === 2, 'do not swallow later user');

console.log('ok');
