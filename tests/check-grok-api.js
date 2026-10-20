// tests/check-grok-api.js
// Node tests for Grok API pure helpers (no DOM)

const assert = require('assert');
const { parseLoadResponses, chunkIds, buildActiveBranchTimeline } = require('../userscripts/gyc-grok.user.js');

const mock = [
  { responseId: 'r3', sender: 'assistant', message: 'hi3', createTime: '2026-10-20T03:00:00Z', parentResponseId: 'r2' },
  { responseId: 'r1', sender: 'human', message: 'hi1', createTime: '2026-10-20T01:00:00Z', parentResponseId: null },
  { responseId: 'r2', sender: 'assistant', message: 'hi2', createTime: '2026-10-20T02:00:00Z', parentResponseId: 'r1' }
];

// out-of-order + parent chain reconstructs linear
const res = buildActiveBranchTimeline(mock, 'r1');
assert.deepStrictEqual(res.timeline.map(t => t.text), ['hi1','hi2','hi3'], 'parent chain order');
assert(res.timeline[0].type === 'user' && res.timeline[1].type === 'ai', 'human->assistant');

// ISO date preserved
assert(res.timeline[0].timestamp.includes('2026'), 'ISO createTime');

// missing IDs warn path
const p = parseLoadResponses(mock, ['r1','rX']);
assert(p.missing.includes('rX'), 'missing ids reported');

// branch markers + warning
const br = [{responseId:'a1',sender:'human',message:'a',parentResponseId:null},{responseId:'b1',sender:'assistant',message:'b',parentResponseId:'a1'},{responseId:'b2',sender:'assistant',message:'c',parentResponseId:'a1'}];
const brRes = buildActiveBranchTimeline(br, 'a1');
assert(brRes.warning, 'ambiguous branch must be reported');
assert(brRes.timeline.every(item => item.text !== 'a' && item.text !== 'b' && item.text !== 'c'), 'ambiguous messages must carry an explicit label');

console.log('Grok API check passed');