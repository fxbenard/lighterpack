import weightUtils from '../utils/weight.js';
import currencyUtils from '../utils/currency.js';

const { formatDisplayPrice } = currencyUtils;

export function useUtils() {
    function displayWeight(mg, unit) {
        return weightUtils.MgToWeight(mg, unit) || 0;
    }

    function displayPrice(price, symbol) {
        return formatDisplayPrice(price, symbol);
    }

    return { displayWeight, displayPrice };
}
