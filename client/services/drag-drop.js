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
