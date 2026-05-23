<style lang="scss">
@import "../css/_globals";

.lpTemplatePicker {
    background: rgba(0, 0, 0, 0.5);
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: $dialog;
}

.lpTemplatePickerModal {
    background: $background1;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.25);
    left: 50%;
    max-height: calc(90vh - #{$spacingLarge} * 2);
    overflow-y: auto;
    padding: $spacingLarge;
    position: fixed;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 520px;
    max-width: calc(100vw - #{$spacingLarge} * 2);
    z-index: $dialog + 1;
}

.lpTemplatePickerTitle {
    font-size: 1.25em;
    font-weight: bold;
    margin: 0 0 $spacingSmall;
}

.lpTemplatePickerSubtitle {
    color: $content2;
    margin: 0 0 $spacingLarge;
}

.lpTemplatePickerCards {
    display: flex;
    flex-direction: column;
    gap: $spacingMedium;
    margin-bottom: $spacingLarge;
}

.lpTemplatePickerCard {
    background: #fff;
    border: 1px solid $border1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacingMedium;
    gap: $spacingMedium;
}

.lpTemplatePickerCardBody {
    flex: 1;
}

.lpTemplatePickerCardName {
    font-weight: bold;
    margin: 0 0 4px;
}

.lpTemplatePickerCardDesc {
    color: $content2;
    font-size: 0.875em;
    margin: 0;
}

.lpTemplatePickerBlank {
    display: block;
    text-align: center;
    color: $content2;
    cursor: pointer;
    text-decoration: underline;

    &:hover {
        color: $content;
    }
}
</style>

<template>
    <teleport to="body">
        <div class="lpTemplatePicker" @click.self="onDismiss">
            <div class="lpTemplatePickerModal">
                <p class="lpTemplatePickerTitle">Start with a template</p>
                <p class="lpTemplatePickerSubtitle">Pick a starter list or begin from scratch.</p>
                <div class="lpTemplatePickerCards">
                    <div v-for="template in templates" :key="template.id" class="lpTemplatePickerCard">
                        <div class="lpTemplatePickerCardBody">
                            <p class="lpTemplatePickerCardName">{{ template.name }}</p>
                            <p class="lpTemplatePickerCardDesc">{{ template.description }}</p>
                        </div>
                        <button class="lpButton" @click="onSelect(template)">Select</button>
                    </div>
                </div>
                <a class="lpHref lpTemplatePickerBlank" @click="onDismiss">Start blank</a>
            </div>
        </div>
    </teleport>
</template>

<script>
import { templates } from '../composables/useTemplatePicker.js';

export default {
    name: 'TemplatePicker',
    emits: ['select', 'dismiss'],
    data() {
        return {
            templates,
        };
    },
    methods: {
        onSelect(template) {
            this.$emit('select', template.data);
        },
        onDismiss() {
            this.$emit('dismiss');
        },
    },
};
</script>
