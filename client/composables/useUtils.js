import weightUtils from '../utils/weight.js';

export function useUtils() {
    function displayWeight(mg, unit) {
        return weightUtils.MgToWeight(mg, unit) || 0;
    }

    function displayPrice(price, symbol) {
        let amount = '0.00';
        if (typeof price === 'number') {
            amount = price.toFixed(2);
        }
        return symbol + amount;
    }

    return { displayWeight, displayPrice };
}
