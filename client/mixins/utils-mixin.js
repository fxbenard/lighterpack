const weightUtils = require('../utils/weight.js');
const { formatDisplayPrice } = require('../utils/currency.js');

const utilsMixin = {
    methods: {
        displayWeight(mg, unit) {
            return weightUtils.MgToWeight(mg, unit) || 0;
        },
        displayPrice(price, symbol) {
            return formatDisplayPrice(price, symbol);
        },
    },
};

module.exports = utilsMixin;
