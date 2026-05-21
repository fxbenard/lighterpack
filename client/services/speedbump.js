let activeSpeedbumpOpener = null;

export function setSpeedbumpOpener(opener) {
    activeSpeedbumpOpener = opener;
}

export function clearSpeedbumpOpener(opener) {
    if (!opener || activeSpeedbumpOpener === opener) {
        activeSpeedbumpOpener = null;
    }
}

export function openSpeedbump(callback, options) {
    if (!activeSpeedbumpOpener) {
        throw new Error('Speedbump is not initialized.');
    }

    activeSpeedbumpOpener(callback, options);
}

export default {
    setSpeedbumpOpener,
    clearSpeedbumpOpener,
    openSpeedbump,
};
