<style lang="scss">
@import "../css/_globals";
.gearRoom {
    align-items: center;
    background: $color-bg;
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;
}
</style>
<template>
    <div class="gearRoom">
        <button class="lpButton lpSmall lpButtonSecondary" @click="$emit('close')">← Back to lists</button>
        <p style="margin-top:16px;color:var(--color-text-muted)">Gear Room (coming soon)</p>
    </div>
</template>
<script>
export default { name: 'GearRoom', emits: ['close'] };
</script>
