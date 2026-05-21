import eventBus from './event-bus';

export function showGlobalAlert(message) {
    if (!message) {
        return;
    }

    eventBus.emit('globalAlert', { message });
}

export default {
    showGlobalAlert,
};
