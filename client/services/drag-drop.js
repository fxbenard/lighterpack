const dragula = require('dragula');

export function createDragDrop(containers, options) {
    return dragula(containers.filter(Boolean), options);
}

export function queryContainers(root, selector) {
    if (!root) {
        return [];
    }

    return Array.from(root.querySelectorAll(selector));
}

export function getDatasetInt(element, key) {
    if (!element || !element.dataset || typeof element.dataset[key] === 'undefined') {
        return null;
    }

    const value = parseInt(element.dataset[key], 10);
    return Number.isNaN(value) ? null : value;
}
