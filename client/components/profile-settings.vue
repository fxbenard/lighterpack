<style lang="scss">
@import "../css/_globals";

.profileSettings {
    border-top: 1px solid $color-border;
    margin-top: 20px;
    padding-top: 20px;
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
</style>

<template>
    <section class="profileSettings">
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
    computed: {
        profile() {
            return this.$store.state.library.publicProfile;
        },
    },
    methods: {
        update(field, value) {
            this.$store.commit('updatePublicProfile', { [field]: value });
        },
    },
};
</script>
