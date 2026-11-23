const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SITES = ['chatgpt', 'claude', 'gemini', 'grok'];

function fakeDocument() {
    const body = {
        children: [],
        appendChild(node) {
            node.parentNode = this;
            this.children.push(node);
        }
    };
    return {
        body,
        createElement() {
            const listeners = {};
            return {
                style: {},
                disabled: false,
                textContent: '',
                addEventListener(type, fn) { listeners[type] = fn; },
                click() { listeners.click?.(); },
                remove() {
                    body.children = body.children.filter(child => child !== this);
                }
            };
        }
    };
}

async function checkHelpers(site) {
    const source = fs.readFileSync(path.join(__dirname, `../userscripts/gyc-${site}.user.js`), 'utf8');
    const start = source.indexOf('const delay = async ms');
    const end = source.indexOf('// --- end manual stop ---');
    assert(start >= 0 && end > start, `${site}: stoppable delay and manual stop block must be adjacent`);
    const document = fakeDocument();
    const context = vm.createContext({ document, root: { document }, setTimeout });
    vm.runInContext(`${source.slice(start, end)}
        globalThis.api = { delay, isManualStop, beginManualStop, endManualStop, manualStop };`, context);
    const { delay, isManualStop, beginManualStop, endManualStop, manualStop } = context.api;

    beginManualStop();
    beginManualStop(); // nested collection inside a combined export
    assert.equal(document.body.children.length, 1, `${site}: nested runs share one stop button`);
    await delay(0);

    document.body.children[0].click();
    const error = await delay(0).then(() => null, caught => caught);
    assert(error && isManualStop(error), `${site}: the next wait after a stop click must throw a manual stop`);
    assert.match(error.message, /已手動停止/);
    assert.equal(isManualStop(new Error('other')), false);

    endManualStop();
    assert.equal(document.body.children.length, 1, `${site}: inner run must not remove the outer stop button`);
    endManualStop();
    assert.equal(document.body.children.length, 0, `${site}: stop button is removed when the run ends`);
    assert.equal(manualStop.requested, false, `${site}: stop state resets for the next run`);
    await delay(0);

    // Every run that shows the button must also remove it, and combined exports must not
    // turn a stop into an API-only result.
    const begins = source.match(/beginManualStop\(\);/g).length;
    const ends = source.match(/endManualStop\(\);/g).length;
    assert.equal(begins, ends, `${site}: beginManualStop/endManualStop calls must pair up`);
    assert(/if \(isManualStop\(error\)\) throw error;/.test(source),
        `${site}: combined export must rethrow a manual stop from the DOM phase`);
    const loops = source.slice(source.indexOf('// --- end manual stop ---'));
    assert(!/await new Promise\(\s*\w+\s*=>\s*setTimeout/.test(loops),
        `${site}: scroll waits must use the stoppable delay`);
}

(async () => {
    for (const site of SITES) await checkHelpers(site);
    console.log('ok manual stop: shared button, nested runs, stoppable waits, combined rethrow (4 sites)');
})().catch(error => { console.error(error); process.exitCode = 1; });
