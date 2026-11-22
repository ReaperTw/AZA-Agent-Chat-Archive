const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../userscripts/gyc-chatgpt.user.js'), 'utf8');
const constants = source.slice(source.indexOf('    const MAX_UPWARD_LOOPS'), source.indexOf('    const delay'));
const navigation = source.slice(source.indexOf('    async function moveToTop('), source.indexOf('    async function scrollToTop('));

async function check(reverse, neverSettles = false) {
    let now = 0;
    let generation = 0;
    let pendingAt = null;
    let top = reverse ? 0 : 1000;
    const oldest = () => reverse ? -(generation + 1) * 1000 : 0;
    const scroller = {
        clientHeight: 600,
        get scrollTop() { return top; },
        set scrollTop(value) {
            assert(top - value <= this.clientHeight / 2, 'upward movement must not skip more than half a viewport');
            top = value;
        },
        dispatchEvent() {
            if (top === oldest() && generation < 3 && pendingAt === null) pendingAt = now + 2200;
        },
        querySelector() { return neverSettles ? { textContent: 'Loading older messages' } : null; }
    };
    const context = vm.createContext({
        scroller, Event: class {},
        getScrollBounds: () => ({ oldest: oldest(), newest: reverse ? 0 : (generation + 1) * 1000 }),
        getViewportSignature: () => String(generation),
        delay: async ms => {
            now += ms;
            if (pendingAt !== null && now >= pendingAt) {
                generation++;
                pendingAt = null;
                // Prepending history preserves the currently visible message.
                top = reverse ? oldest() + 500 : 500;
            }
        }
    });
    const reached = await vm.runInContext(`${constants}\n${navigation}\nmoveToTop(scroller, FAST_UPWARD_WAIT, {})`, context);
    if (neverSettles) {
        assert.equal(reached, false, 'active history loading must not report success');
    } else {
        assert.equal(reached, true);
        assert.equal(generation, 3, 'must wait for all delayed history pages before reporting the top');
        assert.equal(top, oldest(), 'must return to the oldest edge after history prepends');
    }
}

(async () => {
    await check(false);
    await check(true);
    await check(false, true);
    console.log('PASS ChatGPT delayed history, normal/reversed scrolling, loading timeout');
})().catch(error => { console.error(error); process.exitCode = 1; });
