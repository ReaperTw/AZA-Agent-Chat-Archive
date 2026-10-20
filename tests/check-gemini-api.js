const assert = require('node:assert/strict');
const { parseGeminiRpc, parseGeminiApiData, collectGeminiHistory } = require('../userscripts/gyc-gemini.user.js');
const turn = i => [['c_chat', 'r_' + i], [], [['question-' + i]], [[['rc_' + i, ['answer-' + i]]]], [1780000000 + i, 0]];
const frame = data => ")]}'\n\n123\n" + JSON.stringify([['wrb.fr', 'hNvQHb', JSON.stringify(data)]]) + '\n';
const tokens = { SNlM0e: 'token', cfb2h: 'build', FdrFJe: 'session' };

(async () => {
    const requested = [];
    const fetchHistory = async (url, options) => {
        const body = new URLSearchParams(options.body);
        const payload = JSON.parse(JSON.parse(body.get('f.req'))[0][0][1]);
        const limit = payload[1];
        requested.push(limit);
        const rows = Array.from({ length: Math.min(limit, 150) }, (_, i) => turn(150 - i));
        return { ok: true, text: async () => frame([rows, limit < 150 ? 'more' : null]) };
    };
    const history = await collectGeminiHistory('c_chat', tokens, 1, fetchHistory);
    assert.deepEqual(requested, [100, 200]);
    assert.equal(history.rawTurns.length, 150);
    assert.equal(history.exhausted, true);
    const parsed = parseGeminiApiData(history.rawTurns);
    assert.equal(parsed.turns.length, 300);
    assert.equal(parsed.turns[0].text, 'question-1');
    assert.equal(parsed.turns.at(-1).text, 'answer-150');
    assert.equal(parsed.turns[0].timestamp.getTime(), 1780000001000);

    let calls = 0;
    const stuck = await collectGeminiHistory('c_chat', tokens, 0, async () => {
        calls++;
        return { ok: true, text: async () => frame([[turn(2), turn(1)], 'still-more']) };
    });
    assert.equal(calls, 2);
    assert.equal(stuck.exhausted, false);
    assert(stuck.warnings.length > 0);
    assert.equal(stuck.rawTurns.length, 2);

    const variants = turn(1);
    variants[3][0].push(['rc_other', ['alternative']]);
    const uncertain = parseGeminiApiData([variants]);
    assert(uncertain.parseWarnings.length > 0);
    assert(uncertain.turns[1].text.includes('answer-1'));
    assert(uncertain.turns[1].text.includes('alternative'));
    variants[1] = ['c_chat', 'r_1', 'rc_other'];
    assert.equal(parseGeminiApiData([variants]).turns[1].text, 'alternative');
    assert.throws(() => parseGeminiRpc(")]}'\n" + JSON.stringify([['wrb.fr', 'hNvQHb', null]])));
    console.log('ok Gemini API: framed RPC, >100 history, no-progress warning, dates, answer alternatives');
})().catch(error => { console.error(error); process.exitCode = 1; });
