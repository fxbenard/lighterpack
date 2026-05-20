let activeRouter = null;

export function setRouter(routerInstance) {
    activeRouter = routerInstance;
}

export function push(location) {
    if (!activeRouter) {
        throw new Error('Router is not initialized.');
    }

    return activeRouter.push(location);
}

export function redirect(location) {
    window.location = location;
}

export const legacyNavigation = {
    push,
};
