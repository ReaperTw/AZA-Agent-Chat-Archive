const assert = require('node:assert/strict');
const { parseGeminiRpc, parseGeminiApiData, collectGeminiHistory, renderGeminiApiMarkdown, compareTranscripts } = require('../userscripts/gyc-gemini.user.js');
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

    const sameMinute = [turn(1), turn(2)];
    sameMinute[1][4] = sameMinute[0][4].slice();
    const datedTurns = parseGeminiApiData(sameMinute).turns;
    const datedMarkdown = renderGeminiApiMarkdown(datedTurns);
    assert.equal((datedMarkdown.match(/\*\*對話時間\*\*/g) || []).length, 2);
    assert(!/對話時間[^\n]*\n\s*--- \[Model/.test(datedMarkdown));
    datedTurns.filter(item => item.type === 'user').forEach((message, index) => {
        assert(datedMarkdown.includes(`> **對話時間**：${message.dateStr}\n\n--- [User ${index + 1}] ---`));
    });

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
    assert(renderGeminiApiMarkdown(uncertain.turns, uncertain.parseWarnings).includes(uncertain.parseWarnings[0]));
    const emptyAnswer = turn(3);
    emptyAnswer[3][0][0][1][0] = '';
    const incomplete = parseGeminiApiData([emptyAnswer]);
    assert.equal(incomplete.parseWarnings.length, 1);
    assert(uncertain.turns[1].text.includes('alternative'));
    variants[1] = ['c_chat', 'r_1', 'rc_1']; // Request metadata is not the selected answer.
    variants[3][3] = 'rc_other';
    assert.equal(parseGeminiApiData([variants]).turns[1].text, 'alternative');

    const withEmptyAlternative = turn(4);
    withEmptyAlternative[3][0].push(['rc_empty', ['']]);
    withEmptyAlternative[3][3] = 'rc_4';
    const selectedText = parseGeminiApiData([withEmptyAlternative]);
    assert.equal(selectedText.turns[1].text, 'answer-4');
    assert.deepEqual(selectedText.parseWarnings, []);
    withEmptyAlternative[3][3] = 'rc_empty';
    const selectedEmpty = parseGeminiApiData([withEmptyAlternative]);
    assert(!selectedEmpty.turns[1].text.includes('answer-4'));
    assert.equal(selectedEmpty.parseWarnings.length, 1);

    const missingSelected = turn(5);
    missingSelected[3][3] = 'rc_missing';
    const unresolved = parseGeminiApiData([missingSelected]);
    assert.equal(unresolved.turns[1].text, 'answer-5');
    assert.equal(unresolved.parseWarnings.length, 1);
    const apiMessages = [{ role: 'user', text: 'Question' }, { role: 'assistant', text: '**Hello** [world](https://example.com)' }];
    const domMessages = [{ role: 'user', text: 'Question' }, { role: 'assistant', text: 'Hello world' }];
    assert.equal(compareTranscripts(apiMessages, domMessages).match, true);
    domMessages[1].text = 'Hello there';
    assert.equal(compareTranscripts(apiMessages, domMessages).differences[0].kind, 'text');
    assert.equal(compareTranscripts(apiMessages, domMessages.slice(0, 1)).match, false);
    assert.throws(() => parseGeminiRpc(")]}'\n" + JSON.stringify([['wrb.fr', 'hNvQHb', null]])));
    console.log('ok Gemini API: framed RPC, >100 history, no-progress warning, dates, answer alternatives');
})().catch(error => { console.error(error); process.exitCode = 1; });
