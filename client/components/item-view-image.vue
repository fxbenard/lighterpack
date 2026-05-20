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
        };
    },
    mounted() {
        eventBus.on('viewItemImage', (imageUrl) => {
            this.shown = true;
            this.imageUrl = imageUrl;
        });
    },
};
</script>
