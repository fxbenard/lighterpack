export function addWindowListener(eventName, handler, options) {
    window.addEventListener(eventName, handler, options);
}

export function removeWindowListener(eventName, handler, options) {
    window.removeEventListener(eventName, handler, options);
}

export function bindWindowListeners(bindings) {
    bindings.forEach(({ eventName, handler, options }) => {
        addWindowListener(eventName, handler, options);
    });
}

export function unbindWindowListeners(bindings) {
    bindings.forEach(({ eventName, handler, options }) => {
        removeWindowListener(eventName, handler, options);
    });
}
