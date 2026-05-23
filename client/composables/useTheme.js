import { ref, watchEffect } from 'vue';

const STORAGE_KEY = 'lp-theme';
const MODES = ['auto', 'light', 'dark'];

const stored = localStorage.getItem(STORAGE_KEY);
const mode = ref(MODES.includes(stored) ? stored : 'auto');

function applyTheme(m) {
    const root = document.documentElement;
    if (m === 'auto') {
        root.removeAttribute('data-theme');
    } else {
        root.setAttribute('data-theme', m);
    }
}

watchEffect(() => {
    applyTheme(mode.value);
    localStorage.setItem(STORAGE_KEY, mode.value);
});

export function useTheme() {
    function cycleTheme() {
        const idx = MODES.indexOf(mode.value);
        mode.value = MODES[(idx + 1) % MODES.length];
    }

    return { mode, cycleTheme };
}
