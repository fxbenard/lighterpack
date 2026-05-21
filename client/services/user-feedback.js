import { notifyGlobalAlert } from './app-events';

export function showGlobalAlert(message) {
    if (!message) {
        return;
    }

    notifyGlobalAlert({ message });
}

export default {
    showGlobalAlert,
};
