// tests/check-grok-api.js
// Node tests for Grok API pure helpers (no DOM)

const assert = require('assert');
const { parseLoadResponses, chunkIds, buildActiveBranchTimeline, fetchConversationViaApi, compareTranscripts } = require('../userscripts/gyc-grok.user.js');

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

async function checkTreeAndNativeRoles() {
  const originalFetch = global.fetch;
  const nodes = [
    { responseId: 'answer', parentResponseId: 'question' },
    { responseId: 'question', parentResponseId: null }
  ];
  global.fetch = async url => ({
    ok: true,
    json: async () => String(url).includes('/response-node')
      ? { responseNodes: nodes }
      : { responses: [
          { responseId: 'answer', sender: 'ASSISTANT', message: 'Answer' },
          { responseId: 'question', sender: 'human', message: 'Question' }
        ] }
  });
  try {
    const loaded = await fetchConversationViaApi('conversation');
    const parsed = buildActiveBranchTimeline(loaded.responses, 'conversation');
    assert.deepStrictEqual(parsed.timeline.map(row => [row.type, row.text]), [
      ['user', 'Question'], ['ai', 'Answer']
    ]);
    assert.strictEqual(parsed.warning, null);
    const branched = buildActiveBranchTimeline([
      { responseId: 'q', sender: 'human', message: 'Question', parentResponseId: null },
      { responseId: 'a', sender: 'ASSISTANT', message: 'Answer', parentResponseId: 'q' },
      { responseId: 'b', sender: 'ASSISTANT', message: 'Alternative', parentResponseId: 'q' }
    ], 'q');
    assert(branched.warning);
    assert(branched.timeline.every(row => row.text.includes('分支未確認')));
    const comparable = branched.timeline.slice(0, 2).map(row => ({
      ...row, role: row.type === 'ai' ? 'assistant' : 'user'
    }));
    assert(compareTranscripts(comparable, [
      { role: 'user', text: 'Question' }, { role: 'assistant', text: 'Answer' }
    ]).match, 'generated branch notices must not change source body comparison');
  } finally {
    global.fetch = originalFetch;
  }
}

checkTreeAndNativeRoles().then(() => console.log('Grok native roles and tree linkage passed')).catch(error => {
  console.error(error);
  process.exitCode = 1;
});


console.log('Grok API check passed');