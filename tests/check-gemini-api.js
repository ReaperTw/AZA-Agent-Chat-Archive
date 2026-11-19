const assert = require('node:assert/strict');
const { parseGeminiRpc, parseGeminiApiData, collectGeminiHistory, renderGeminiApiMarkdown, compareTranscripts, prepareComparisonMessage, buildIntegratedMarkdown } = require('../userscripts/gyc-gemini.user.js');
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

    const imageOnly = turn(6);
    imageOnly[2] = [];
    const imageTurns = parseGeminiApiData([imageOnly]).turns;
    assert.equal(imageTurns.length, 2, 'attachment-only users retain their place');
    assert.equal(compareTranscripts(imageTurns.map(t => ({ ...t, role: t.type === 'user' ? 'user' : 'assistant' })), [
        { role: 'user', text: 'Image not embedded', comparisonBody: '' },
        { role: 'assistant', text: 'answer-6' }
    ]).match, true, 'presentation hints do not become body conflicts');

    const cited = turn(7);
    cited[3][0][0][1][0] = 'Answer [cite: 2]; literal [cite: 9]';
    cited[3][0][0][12] = [{ 44: [[['[cite: 2]', 0]]] }];
    const citedAnswer = parseGeminiApiData([cited]).turns[1];
    assert.equal(citedAnswer.text, 'Answer [cite: 2]; literal [cite: 9]');
    assert.equal(prepareComparisonMessage({ ...citedAnswer, role: 'assistant' }, 'api').body, 'Answer ; literal [cite: 9]');
    assert.deepEqual(citedAnswer.citations, [{ label: '[cite: 2]' }]);

    const equivalent = (api, dom) => compareTranscripts([{ role: 'assistant', text: api }], [{ role: 'assistant', text: dom }]).match;
    assert(equivalent('判斷**真值**是否一致', '判斷真值是否一致'));
    assert(equivalent('保留**「重點」**（說明）', '保留「重點」（說明）'));
    assert(equivalent('> 保留**「字面符號」**原文', '保留**「字面符號」**原文'));
    assert(equivalent('cols 0~4, rows 0~4', 'cols 0~4, rows 0~4'));
    assert(equivalent('~~removed~~', 'removed'));
    assert(equivalent('A<br>B', 'A\nB'));
    assert(equivalent('$$p \\rightarrow q$$', '$p \\rightarrow q$'));
    assert(!equivalent('$p \\rightarrow q$', '$q \\rightarrow p$'));
    assert(!equivalent('`$x  y$`', '$x y$'), 'code whitespace remains literal');
    assert(!equivalent('```txt\nx  y\n```', 'x y'), 'fenced code remains literal');
    assert(equivalent('$$a\\\\[2pt]b$$', '$a\\\\b$'), 'TeX row spacing is presentation');
    assert(equivalent('$\\vert{}x\\vert{}$', '$|x|$'));
    assert(equivalent('> $$a\n> b$$', '$a > b$'), 'math sees quote characters before Markdown');
    assert(equivalent('```tex\n$$x$$\n```', '$$x$$'), 'math syntax in code stays literal');
    const followups = '<ElicitationsGroup message="Explore &amp; learn">\n  <Elicitation label="A *literal* label" query="Hidden click payload"/>\n</ElicitationsGroup>';
    const oldFollowup = turn(8), latestFollowup = turn(9);
    oldFollowup[3][0][0][1][0] = 'Earlier answer\n' + followups;
    latestFollowup[3][0][0][1][0] = 'Latest answer\n' + followups;
    const actions = parseGeminiApiData([latestFollowup, oldFollowup]).turns.map(t => ({ ...t, role: t.type === 'user' ? 'user' : 'assistant' }));
    const visibleActions = [
        { role: 'user', text: 'question-8' }, { role: 'assistant', text: 'Earlier answer' },
        { role: 'user', text: 'question-9' }, { role: 'assistant', text: 'Latest answer\nExplore & learn\nA *literal* label' }
    ];
    assert.equal(compareTranscripts(actions, visibleActions).match, true, 'only latest follow-up labels are visible');
    const combinedActions = buildIntegratedMarkdown(actions, visibleActions).content;
    assert(combinedActions.includes('A \\*literal\\* label'));
    assert(!combinedActions.includes('Hidden click payload'));
    assert(!combinedActions.includes('<ElicitationsGroup'));
    assert(renderGeminiApiMarkdown(actions).includes(followups), 'standalone API retains original source');
    const literalAction = turn(10);
    literalAction[3][0][0][1][0] = '```xml\n' + followups + '\n```';
    assert.equal(parseGeminiApiData([literalAction]).turns[1].comparisonBody, literalAction[3][0][0][1][0], 'code examples are not follow-up controls');
    literalAction[3][0][0][1][0] = 'Unknown\n<ElicitationsGroup message="Keep"><Other/></ElicitationsGroup>';
    assert.equal(parseGeminiApiData([literalAction]).turns[1].comparisonBody, literalAction[3][0][0][1][0], 'unknown widgets remain diagnosable');
    assert(equivalent('*common standard**s** of beauty*', 'common standards of beauty'), 'nested strong inside emphasis');
    assert(!equivalent('*common standard**s** of beauty*', 'common standard of beauty'), 'the emphasized suffix is not discarded');
    const singleFollowup = '<FollowUp label="A &amp; *literal* choice" query="Private click query"/>';
    const resource = 'http://googleusercontent.com/youtube_content/1';
    const videoTurn = turn(11);
    videoTurn[3][0][0][1][0] = 'Video answer\n\n' + singleFollowup + '\n' + resource;
    const videoRecord = [];
    videoRecord[0] = [resource, null, null, null, null, null, ['YouTube']];
    videoRecord[4] = [[['Video title', 'example', 'https://www.youtube.com/watch?v=example']]];
    videoTurn[3][0][0][12] = [];
    videoTurn[3][0][0][12][4] = [videoRecord];
    const videoAnswer = parseGeminiApiData([videoTurn]).turns[1];
    assert.equal(prepareComparisonMessage({ ...videoAnswer, role: 'assistant' }, 'api').body, 'Video answer\nA & *literal* choice');
    assert.deepEqual(videoAnswer.attachments, [{ type: 'video', name: 'Video title', url: 'https://www.youtube.com/watch?v=example' }]);
    assert(videoAnswer.text.includes(resource), 'standalone source retains the typed resource ID');
    videoTurn[3][0][0][12] = [];
    assert(parseGeminiApiData([videoTurn]).turns[1].comparisonBody.includes(resource), 'unmapped resource-looking text remains body');
    videoTurn[3][0][0][1][0] = '```xml\n' + singleFollowup + '\n```\n\n`' + singleFollowup + '`';
    assert.equal(parseGeminiApiData([videoTurn]).turns[1].comparisonBody, videoTurn[3][0][0][1][0], 'follow-up syntax in code stays literal');
    for (const literal of ['Example\n\n    ' + singleFollowup, '\\' + singleFollowup, 'Mention ' + singleFollowup]) {
        videoTurn[3][0][0][1][0] = literal;
        assert.equal(parseGeminiApiData([videoTurn]).turns[1].comparisonBody, literal, 'only standalone native controls are converted');
    }
    const earlierSingle = turn(12);
    earlierSingle[3][0][0][1][0] = 'Earlier\n\n' + singleFollowup;
    assert.equal(prepareComparisonMessage({ ...parseGeminiApiData([turn(13), earlierSingle]).turns[1], role: 'assistant' }, 'api').body, 'Earlier\nA & *literal* choice', 'single follow-up labels remain visible on older answers');
    const productTurn = turn(14);
    const grid = '<ProductGrid title="Choices">\n  <Product id="9007199254740993"/>\n  <Product id="2"/>\n</ProductGrid>';
    productTurn[3][0][0][1][0] = 'Before\n\n' + grid + '\n\nAfter';
    const product = (id, name, price, merchant) => {
        const row = [];
        row[19] = id; row[10] = name; row[13] = price; row[27] = merchant;
        row[12] = 'https://example.test/product/' + id;
        return row;
    };
    const products = [
        product('2', 'Second *literal* frame', 'NT$200.00', 'Shop B'),
        product('9007199254740993', 'First frame', 'NT$100.00', 'Shop A'),
        product('unused', 'Not selected', 'NT$999.00', 'Other')
    ];
    productTurn[3][0][0][12] = [{ 16: [[null, null, null, products]] }];
    const productAnswer = () => parseGeminiApiData([productTurn]).turns[1];
    assert.equal(prepareComparisonMessage({ ...productAnswer(), role: 'assistant' }, 'api').body,
        'Before\nFirst frame\nNT$100.00\nShop A\nSecond *literal* frame\nNT$200.00\nShop B\nAfter', 'product text follows grid IDs, not catalog order');
    const productOutput = buildIntegratedMarkdown([{ ...productAnswer(), role: 'assistant' }], []).content;
    assert(productOutput.includes('https://example.test/product/9007199254740993'));
    assert(!productOutput.includes('Not selected'));
    assert(productAnswer().text.includes(grid), 'standalone API preserves original product markup');
    products.push(product('2', 'Ambiguous', 'NT$201.00', 'Shop B'));
    assert(parseGeminiApiData([productTurn]).parseWarnings.length > 0);
    assert(productAnswer().comparisonBody.includes(grid), 'ambiguous product mappings are not silently discarded');
    products.pop();
    products[1][13] = null;
    assert(productAnswer().comparisonBody.includes(grid), 'missing product text retains the unknown grid');
    products[1][13] = 'NT$100.00';
    for (const literal of ['```xml\n' + grid + '\n```', 'Example\n\n    ' + grid.replace(/\n/g, '\n    ')]) {
        productTurn[3][0][0][1][0] = literal;
        assert.equal(productAnswer().comparisonBody, literal, 'product examples in code remain literal');
    }
    assert.throws(() => parseGeminiRpc(")]}'\n" + JSON.stringify([['wrb.fr', 'hNvQHb', null]])));
    console.log('ok Gemini API: framed RPC, >100 history, no-progress warning, dates, answer alternatives');
})().catch(error => { console.error(error); process.exitCode = 1; });
