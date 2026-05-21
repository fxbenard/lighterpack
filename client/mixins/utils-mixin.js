const weightUtils = require('../utils/weight.js');

const utilsMixin = {
    methods: {
        displayWeight(mg, unit) {
            return weightUtils.MgToWeight(mg, unit) || 0;
        },
        displayPrice(price, symbol) {
            let amount = '0.00';
            if (typeof price === 'number') {
                amount = price.toFixed(2);
            }
            return symbol + amount;
        },
    },
};

module.exports = utilsMixin;
