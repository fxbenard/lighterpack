const pies = require('../pies.js');

export function renderListChart({ chart, canvas, processedData, hoverCallback }) {
    if (!canvas || !processedData) {
        return chart;
    }

    if (chart) {
        chart.update({ processedData });
        return chart;
    }

    return pies({
        processedData,
        container: canvas,
        hoverCallback,
    });
}
