// one check for mergeTimelines — run: node check-merge-timelines.js
function sameTurn(a, b, allowGrow) {
    if (a.type !== b.type) return false;
    if (a.text === b.text) return true;
    return allowGrow && (a.text.includes(b.text) || b.text.includes(a.text));
}

function mergeTimelines(master, fragment) {
    if (master.length === 0) return { merged: fragment, hasGap: false };
    if (fragment.length === 0) return { merged: master, hasGap: false };
    for (let overlapLength = Math.min(master.length, fragment.length); overlapLength > 0; overlapLength--) {
        let isMatch = true;
        for (let i = 0; i < overlapLength; i++) {
            if (!sameTurn(master[master.length - overlapLength + i], fragment[i], i === overlapLength - 1)) {
                isMatch = false;
                break;
            }
        }
        if (isMatch) {
            for (let i = 0; i < overlapLength; i++) {
                if (fragment[i].text.length > master[master.length - overlapLength + i].text.length) {
                    master[master.length - overlapLength + i].text = fragment[i].text;
                }
            }
            return { merged: master.concat(fragment.slice(overlapLength)), hasGap: false };
        }
    }
    return { merged: master, hasGap: true };
}

function assert(cond, msg) {
    if (!cond) throw new Error(msg);
}

// exact overlap
let r = mergeTimelines(
    [{ type: 'user', text: '好' }, { type: 'ai', text: '嗯' }],
    [{ type: 'user', text: '好' }, { type: 'ai', text: '嗯' }, { type: 'user', text: '下一則' }]
);
assert(!r.hasGap && r.merged.length === 3 && r.merged[2].text === '下一則', 'exact overlap');

// last turn grows
r = mergeTimelines(
    [{ type: 'user', text: '問' }, { type: 'ai', text: 'Hello' }],
    [{ type: 'ai', text: 'Hello world' }]
);
assert(!r.hasGap && r.merged.length === 2 && r.merged[1].text === 'Hello world', 'grow last');

// short "好" must not eat a later longer user turn
r = mergeTimelines(
    [{ type: 'user', text: '好' }, { type: 'ai', text: '收到' }],
    [{ type: 'user', text: '好的請寫報告' }]
);
assert(r.hasGap && r.merged.length === 2, 'do not swallow later user');

console.log('ok');
