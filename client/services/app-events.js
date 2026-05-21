let onUnauthorizedHandler = null;
let onGlobalAlertHandler = null;

export function registerAppEventHandlers({ onUnauthorized, onGlobalAlert }) {
    onUnauthorizedHandler = onUnauthorized || null;
    onGlobalAlertHandler = onGlobalAlert || null;
}

export function clearAppEventHandlers() {
    onUnauthorizedHandler = null;
    onGlobalAlertHandler = null;
}

export function notifyUnauthorized(message) {
    if (onUnauthorizedHandler) {
        onUnauthorizedHandler(message);
    }
}

export function notifyGlobalAlert(alert) {
    if (onGlobalAlertHandler) {
        onGlobalAlertHandler(alert);
    }
}

export default {
    registerAppEventHandlers,
    clearAppEventHandlers,
    notifyUnauthorized,
    notifyGlobalAlert,
};
