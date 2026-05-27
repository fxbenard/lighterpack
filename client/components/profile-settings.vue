<style lang="scss">
@import "../css/_globals";

.profileSettings {
    border-top: 1px solid $color-border;
    margin-top: 0;
    padding-top: 24px;
}

.profileSettings h2 {
    font-size: 28px;
    letter-spacing: 0;
    line-height: 1.1;
    margin-bottom: 18px;
    max-width: none;
}

.profileSettings label {
    display: block;
    margin-bottom: 12px;
}

.profileSettings input[type="text"],
.profileSettings textarea,
.profileSettings select {
    margin-top: 4px;
    width: 100%;
}

.profileSettingsGrid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-bottom: 24px;
}

@media (max-width: 640px) {
    .profileSettingsGrid {
        grid-template-columns: 1fr;
    }
}
</style>

<template>
    <section class="profileSettings">
        <h2>Default units</h2>
        <div class="profileSettingsGrid">
            <label>
                Item weight
                <select :value="library.itemUnit" @change="updateDefaultUnit('itemUnit', $event.target.value)">
                    <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
                </select>
            </label>
            <label>
                List totals
                <select :value="library.totalUnit" @change="updateDefaultUnit('totalUnit', $event.target.value)">
                    <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
                </select>
            </label>
            <label>
                Default currency
                <input
                    type="text"
                    maxlength="4"
                    :value="library.currencySymbol"
                    @input="updateCurrencySymbol($event.target.value)"
                >
            </label>
        </div>

        <h2>Public profile</h2>
        <label>
            Display name
            <input type="text" :value="profile.displayName" @input="update('displayName', $event.target.value)">
        </label>
        <label>
            Trail name
            <input type="text" :value="profile.trailName" @input="update('trailName', $event.target.value)">
        </label>
        <label>
            Bio
            <textarea :value="profile.bio" @input="update('bio', $event.target.value)" />
        </label>
        <label>
            Visibility
            <select :value="profile.visibility" @change="update('visibility', $event.target.value)">
                <option value="private">Private</option>
                <option value="shareable">Shareable</option>
                <option value="discoverable">Discoverable</option>
                <option value="indexable">Indexable</option>
            </select>
        </label>
        <label>
            <input type="checkbox" :checked="profile.allowSearchIndexing" @change="update('allowSearchIndexing', $event.target.checked)">
            Allow search indexing
        </label>
    </section>
</template>

<script>
export default {
    name: 'ProfileSettings',
    data() {
        return {
            units: ['oz', 'lb', 'g', 'kg'],
        };
    },
    computed: {
        library() {
            return this.$store.state.library;
        },
        profile() {
            return this.$store.state.library.publicProfile;
        },
    },
    methods: {
        update(field, value) {
            this.$store.commit('updatePublicProfile', { [field]: value });
        },
        updateDefaultUnit(field, value) {
            this.$store.commit('setDefaultUnits', {
                itemUnit: field === 'itemUnit' ? value : this.library.itemUnit,
                totalUnit: field === 'totalUnit' ? value : this.library.totalUnit,
            });
        },
        updateCurrencySymbol(value) {
            this.$store.commit('updateCurrencySymbol', value);
        },
    },
};
</script>
