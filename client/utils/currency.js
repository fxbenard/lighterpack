function shouldSuffixCurrencySymbol(symbol) {
    return ['€'].includes(symbol);
}

function formatDisplayPrice(price, symbol = '$') {
    let amount = '0.00';
    if (typeof price === 'number') {
        amount = price.toFixed(2);
    }

    if (shouldSuffixCurrencySymbol(symbol)) {
        return `${amount}${symbol}`;
    }

    return `${symbol}${amount}`;
}

module.exports = {
    formatDisplayPrice,
    shouldSuffixCurrencySymbol,
};
