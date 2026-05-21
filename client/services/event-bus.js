import Vue from 'vue';

const bus = new Vue();

export function on(eventName, handler) {
    bus.$on(eventName, handler);
}

export function off(eventName, handler) {
    bus.$off(eventName, handler);
}

export function emit(eventName, ...args) {
    bus.$emit(eventName, ...args);
}

export default {
    on,
    off,
    emit,
};
