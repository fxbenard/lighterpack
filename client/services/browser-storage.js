function getStorage() {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }

    return window.localStorage;
}

export function readCookie(name) {
    const nameEQ = `${name}=`;
    const cookieSource = typeof document === 'undefined' ? '' : document.cookie;
    const cookies = cookieSource.split(';');

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }

    return null;
}

export function writeCookie(name, value, days) {
    if (typeof document === 'undefined') {
        return;
    }

    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toGMTString()}`;
    }

    document.cookie = `${name}=${value}${expires}; path=/`;
}

export function clearCookie(name) {
    writeCookie(name, '', -1);
}

export function hasLocalLibrary() {
    const storage = getStorage();
    return Boolean(storage && storage.library);
}

export function getLocalLibrary() {
    const storage = getStorage();
    return storage ? storage.library : null;
}

export function setLocalLibrary(value) {
    const storage = getStorage();
    if (storage) {
        storage.library = value;
    }
}

export function clearLocalLibrary() {
    const storage = getStorage();
    if (storage) {
        delete storage.library;
    }
}

export function moveLocalLibraryToRegistered() {
    const storage = getStorage();
    if (!storage || !storage.library) {
        return false;
    }

    storage.registeredLibrary = storage.library;
    delete storage.library;
    return true;
}
