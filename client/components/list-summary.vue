<style lang="scss">
@import "../css/_globals";

.lpLegend {
    &:hover {
        border-color: $color-text-muted;
        cursor: pointer;
    }
}
</style>

<template>
    <div class="lpListSummary">
        <div class="lpChartContainer">
            <canvas ref="chartCanvas" class="lpChart" height="260" width="260" />
        </div>
        <div class="lpTotalsContainer">
            <ul class="lpTotals lpTable lpDataTable">
                <li class="lpRow lpHeader">
                    <span class="lpCell">&nbsp;</span>
                    <span class="lpCell">
                        Category
                    </span>
                    <span v-if="library.optionalFields['price']" class="lpCell">
                        Price
                    </span>
                    <span class="lpCell">
                        Weight
                    </span>
                </li>
                <li v-for="category in categories" :key="category.id" :class="{'hover': category.activeHover, 'lpTotalCategory lpRow': true}">
                    <span class="lpCell lpLegendCell">
                        <colorPicker v-if="category.displayColor" :color="colorToHex(category.displayColor)" @colorChange="updateColor(category, $event)" />
                    </span>
                    <span class="lpCell">
                        {{ category.name }}
                    </span>
                    <span v-if="library.optionalFields['price']" class="lpCell lpNumber">
                        {{ displayPrice(category.subtotalPrice, library.currencySymbol) }}
                    </span>
                    <span class="lpCell lpNumber">
                        <span class="lpDisplaySubtotal" :mg="category.subtotalWeight">{{ displayWeight(category.subtotalWeight, library.totalUnit) }}</span> <span class="lpSubtotalUnit">{{ library.totalUnit }}</span>
                    </span>
                </li>
                <li class="lpRow lpFooter lpTotal">
                    <span class="lpCell" />
                    <span class="lpCell lpSubtotal" :title="list.totalQty +' items'">
                        Total
                    </span>
                    <span v-if="library.optionalFields['price']" class="lpCell lpNumber lpSubtotal" :title="list.totalQty +' items'">
                        {{ displayPrice(list.totalPrice, library.currencySymbol) }}
                    </span>
                    <span class="lpCell lpNumber lpSubtotal">
                        <span class="lpTotalValue" :title="list.totalQty + ' items'">
                            {{ displayWeight(list.totalWeight, library.totalUnit) }}
                        </span>
                        <span class="lpTotalUnit"><unitSelect :unit="library.totalUnit" @change="setTotalUnit" /></span>
                    </span>
                </li>
                <li v-if="list.totalConsumableWeight" data-weight-type="consumable" class="lpRow lpFooter lpBreakdown lpConsumableWeight">
                    <span class="lpCell" />
                    <span class="lpCell lpSubtotal">
                        Consumable
                    </span>
                    <span v-if="library.optionalFields['price']" class="lpCell lpNumber lpSubtotal">
                        {{ displayPrice(list.totalConsumablePrice, library.currencySymbol) }}
                    </span>
                    <span class="lpCell lpNumber lpSubtotal">
                        <span class="lpDisplaySubtotal" :mg="list.totalConsumableWeight">{{ displayWeight(list.totalConsumableWeight, library.totalUnit) }}</span>
                        <span class="lpSubtotalUnit">{{ library.totalUnit }}</span>
                    </span>
                </li>
                <li v-if="list.totalWornWeight" data-weight-type="worn" class="lpRow lpFooter lpBreakdown lpWornWeight">
                    <span class="lpCell" />
                    <span class="lpCell lpSubtotal">
                        Worn
                    </span>
                    <span v-if="library.optionalFields['price']" class="lpCell lpNumber" />
                    <span class="lpCell lpNumber lpSubtotal">
                        <span class="lpDisplaySubtotal" :mg="list.totalWornWeight">{{ displayWeight(list.totalWornWeight, library.totalUnit) }}</span>
                        <span class="lpSubtotalUnit">{{ library.totalUnit }}</span>
                    </span>
                </li>
                <li v-if="list.totalWornWeight || list.totalConsumableWeight" data-weight-type="base" class="lpRow lpFooter lpBreakdown lpBaseWeight">
                    <span class="lpCell" />
                    <span class="lpCell lpSubtotal" :title="displayWeight(list.totalPackWeight, library.totalUnit) + ' ' + library.totalUnit + ' pack weight (consumable + base weight)'">
                        Base Weight
                    </span>
                    <span v-if="library.optionalFields['price']" class="lpCell lpNumber" />
                    <span class="lpCell lpNumber lpSubtotal">
                        <span class="lpDisplaySubtotal" :mg="list.totalBaseWeight" :title="displayWeight(list.totalPackWeight, library.totalUnit) + ' ' + library.totalUnit + ' pack weight (consumable + base weight)'">
                            {{ displayWeight(list.totalBaseWeight, library.totalUnit) }}
                        </span>
                        <span class="lpSubtotalUnit">{{ library.totalUnit }}</span>
                    </span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import colorPicker from './colorpicker.vue';
import unitSelect from './unit-select.vue';
import { renderListChart } from '../services/list-chart';
import { useUtils } from '../composables/useUtils.js';
const colorUtils = require('../utils/color.js');

const { displayWeight, displayPrice } = useUtils();

export default {
    name: 'ListSummary',
    components: {
        colorPicker,
        unitSelect,
    },
    props: ['list'],
    data() {
        return {
            chart: null,
            hoveredCategoryId: null,
        };
    },
    computed: {
        library() {
            return this.$store.state.library;
        },
        categories() {
            return this.list.categoryIds.map((id) => {
                const category = this.library.getCategoryById(id);
                category.activeHover = (this.hoveredCategoryId === category.id);
                return category;
            });
        },
    },
    watch: {
        '$store.state.library.defaultListId': 'updateChart',
        'list.totalWeight': 'updateChart',
        'list.categoryIds': 'updateChart',
    },
    mounted() {
        this.updateChart();
    },
    beforeUnmount() {
        if (this.chart && typeof this.chart.destroy === 'function') {
            this.chart.destroy();
            this.chart = null;
        }
    },
    methods: {
        displayWeight,
        displayPrice,
        updateChart(type) {
            const chartData = this.library.renderChart(type);

            if (chartData) {
                this.chart = renderListChart({
                    chart: this.chart,
                    canvas: this.$refs.chartCanvas,
                    processedData: chartData,
                    hoverCallback: this.chartHover,
                });
            }
            return chartData;
        },
        chartHover(chartItem) {
            if (chartItem && chartItem.id) {
                this.hoveredCategoryId = chartItem.id;
            } else {
                this.hoveredCategoryId = null;
            }
        },
        setTotalUnit(unit) {
            this.$store.commit('setTotalUnit', unit);
        },
        updateColor(category, color) {
            category.color = colorUtils.hexToRgb(color);
            category.displayColor = colorUtils.rgbToString(colorUtils.hexToRgb(color));
            this.$store.commit('updateCategoryColor', category);
            this.updateChart();
        },
        colorToHex(color) {
            return colorUtils.rgbToHex(colorUtils.stringToRgb(color));
        },
    },
};

</script>
