<style lang="scss">
@import "../css/_globals";

.creatorLinks {
    border-top: 1px solid $color-border;
    margin-top: 24px;
    padding-top: 24px;
}

.creatorLinks h2 {
    font-size: 28px;
    letter-spacing: 0;
    line-height: 1.1;
    margin-bottom: 18px;
    max-width: none;
}

.creatorLinks label {
    display: block;
    margin-bottom: 12px;
}

.creatorLinks textarea {
    margin-top: 4px;
    width: 100%;
}

.creatorLinksNote {
    color: $color-text-muted;
    font-size: $fontSize-sm;
}
</style>

<template>
    <section class="creatorLinks">
        <h2>Creator links</h2>
        <label>
            Disclosure
            <textarea :value="creator.disclosure" @input="updateDisclosure($event.target.value)" />
        </label>
        <p class="creatorLinksNote">Affiliate links are shown only on your public pages.</p>
    </section>
</template>

<script>
export default {
    name: 'CreatorLinks',
    computed: {
        creator() {
            return this.$store.state.library.creator;
        },
    },
    methods: {
        updateDisclosure(value) {
            this.$store.commit('updateCreatorSettings', { disclosure: value });
        },
    },
};
</script>
