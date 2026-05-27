const { formatDisplayPrice } = require('../client/utils/currency.js');

let passed = 0;
let failed = 0;

function assert(description, condition) {
    if (condition) {
        console.log(`  PASS  ${description}`);
        passed++;
    } else {
        console.error(`  FAIL  ${description}`);
        failed++;
    }
}

console.log('\n--- Currency display format ---');

assert('dollar stays in front', formatDisplayPrice(183.29, '$') === '$183.29');
assert('euro moves behind amount', formatDisplayPrice(183.29, '€') === '183.29€');
assert('zero price still formats', formatDisplayPrice(0, '€') === '0.00€');

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
