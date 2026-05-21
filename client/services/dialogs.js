const dialogOpeners = {};

export function registerDialogOpener(name, opener) {
    dialogOpeners[name] = opener;
}

export function unregisterDialogOpener(name, opener) {
    if (!name) {
        return;
    }

    if (!opener || dialogOpeners[name] === opener) {
        delete dialogOpeners[name];
    }
}

export function openDialog(name, ...args) {
    if (!dialogOpeners[name]) {
        throw new Error(`Dialog "${name}" is not initialized.`);
    }

    dialogOpeners[name](...args);
}

export default {
    registerDialogOpener,
    unregisterDialogOpener,
    openDialog,
};
