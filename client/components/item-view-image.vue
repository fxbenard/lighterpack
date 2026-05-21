<style lang="scss">

#itemImageDialog {
    width: 640px;

    .imageUploadDescription {
        margin-bottom: 19px;
    }
}

</style>

<template>
    <modal id="lpImageDialog" :shown="shown" @hide="shown = false">
        <img :src="imageUrl">
    </modal>
</template>

<script>
import modal from './modal.vue';
import eventBus from '../services/event-bus';

export default {
    name: 'ItemViewImage',
    components: {
        modal,
    },
    data() {
        return {
            imageUrl: '',
            shown: false,
            openItemImageViewer: null,
        };
    },
    mounted() {
        this.openItemImageViewer = (imageUrl) => {
            this.shown = true;
            this.imageUrl = imageUrl;
        };
        eventBus.on('viewItemImage', this.openItemImageViewer);
    },
    beforeDestroy() {
        if (this.openItemImageViewer) {
            eventBus.off('viewItemImage', this.openItemImageViewer);
        }
    },
};
</script>
