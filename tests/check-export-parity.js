// node tests/check-export-parity.js <private-evidence.json|->; '-' reads stdin.
// Input contains independently captured, rendered plain-text messages, not raw Markdown.
const fs = require('node:fs');

function compareEvidence(evidence) {
    if (!['chatgpt', 'gemini', 'grok', 'claude'].includes(evidence?.provider)) {
        throw new Error('provider must be chatgpt, gemini, grok or claude');
    }
    const modes = ['api', 'normal', 'dom'];
    const normalize = text => text.replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ').trim();
    for (const mode of modes) {
        const capture = evidence[mode];
        if (!capture || capture.complete !== true || typeof capture.conversation !== 'string' || !capture.conversation ||
            typeof capture.branch !== 'string' || !capture.branch || !Array.isArray(capture.messages) || !capture.messages.length) {
            throw new Error(`${mode}: requires complete capture, conversation, branch and nonempty messages`);
        }
        if (capture.messages.some(m => !m || !['user', 'assistant'].includes(m.role) || typeof m.text !== 'string' || !normalize(m.text))) {
            throw new Error(`${mode}: messages require known role and nonempty rendered text`);
        }
        for (const [field, valid] of [
            ['references', item => item && Number.isInteger(item.messageIndex) && item.messageIndex >= 1 &&
                item.messageIndex <= capture.messages.length && typeof item.label === 'string' && typeof item.url === 'string'],
            ['process', item => item && Number.isInteger(item.messageIndex) && item.messageIndex >= 1 &&
                item.messageIndex <= capture.messages.length && typeof item.text === 'string' && item.text.trim() &&
                typeof item.evidence === 'string' && item.evidence.trim()]
        ]) {
            if (capture[field] != null && (!Array.isArray(capture[field]) || capture[field].some(item => !valid(item)))) {
                throw new Error(`${mode}: invalid ${field} annotation`);
            }
        }
    }
    for (const mode of modes) {
        const capture = evidence[mode];
        if (capture.conversation !== evidence.dom.conversation || capture.branch !== evidence.dom.branch) {
            throw new Error(`${mode}: conversation/branch does not match DOM capture`);
        }
    }
    const differences = [];
    for (const mode of modes.filter(mode => mode !== 'dom')) {
        const actual = evidence[mode].messages;
        const expected = evidence.dom.messages;
        const mismatches = [];
        for (let i = 0; i < Math.max(actual.length, expected.length); i++) {
            const a = actual[i], b = expected[i];
            if (!a || !b || a.role !== b.role || normalize(a.text) !== normalize(b.text)) mismatches.push(i + 1);
        }
        if (mismatches.length) differences.push({ mode, actualCount: actual.length, domCount: expected.length, mismatches });
    }
    const annotationGrade = field => {
        const changes = [];
        let unverified = false;
        const key = field === 'references' ? item => `${item.label}\0${item.url}` : item => item.text;
        for (const mode of modes.filter(mode => mode !== 'dom')) {
            const actual = evidence[mode][field], expected = evidence.dom[field];
            if (actual == null || expected == null) { unverified = true; continue; }
            const indexes = new Set([...actual, ...expected].map(item => item.messageIndex));
            for (const messageIndex of indexes) {
                const a = actual.filter(item => item.messageIndex === messageIndex).map(key);
                const b = expected.filter(item => item.messageIndex === messageIndex).map(key);
                if (JSON.stringify(a) !== JSON.stringify(b)) changes.push({ mode, messageIndex });
            }
        }
        return { status: unverified ? 'unverified' : changes.length ? 'different' : 'match', differences: changes };
    };
    const references = annotationGrade('references');
    const process = annotationGrade('process');
    return {
        provider: evidence.provider, modes, bodyPassed: differences.length === 0,
        body: { status: differences.length ? 'different' : 'match', differences },
        references, process
    };
}

if (require.main === module) {
    try {
        if (process.argv.length !== 3) throw new Error('Usage: node tests/check-export-parity.js <private-evidence.json|->');
        const input = process.argv[2] === '-' ? 0 : process.argv[2];
        const result = compareEvidence(JSON.parse(fs.readFileSync(input, 'utf8')));
        console.log(JSON.stringify(result, null, 2));
        process.exitCode = result.bodyPassed ? 0 : 1;
    } catch (error) {
        // Do not print parse errors: their snippets can contain private transcript text.
        console.error(error instanceof SyntaxError ? 'Invalid evidence JSON' : error.message);
        process.exitCode = 2;
    }
}
module.exports = { compareEvidence };

