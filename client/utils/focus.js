import { addWindowListener, removeWindowListener } from '../services/window-events';

function addElementListener(el, key, eventName, handler) {
    el[key] = handler;
    el.addEventListener(eventName, handler);
}

function removeElementListener(el, key, eventName) {
    if (el[key]) {
        el.removeEventListener(eventName, el[key]);
        delete el[key];
    }
}

const directives = {
    'select-on-focus': {
    mounted(el) {
        addElementListener(el, '__lpSelectOnFocus', 'focus', () => {
            el.select();
        });
    },
    beforeUnmount(el) {
        removeElementListener(el, '__lpSelectOnFocus', 'focus');
    },
    },
    'focus-on-create': {
    mounted(el, binding) {
        if (typeof binding.value === 'undefined' || binding.value) {
            el.focus();
        }
    },
    beforeUnmount() {
    },
    },
    'empty-if-zero': {
    mounted(el) {
        addElementListener(el, '__lpEmptyIfZeroFocus', 'focus', () => {
            if (el.value === '0' || el.value === '0.00') {
                el.dataset.originalValue = el.value;
                el.value = '';
            }
        });

        addElementListener(el, '__lpEmptyIfZeroBlur', 'blur', () => {
            if (el.value === '') {
                el.value = el.dataset.originalValue || '0';
            }
        });
    },
    beforeUnmount(el) {
        removeElementListener(el, '__lpEmptyIfZeroFocus', 'focus');
        removeElementListener(el, '__lpEmptyIfZeroBlur', 'blur');
    },
    },
    'click-outside': {
    mounted(el, binding) {
        const handler = (evt) => {
            if (el.contains(evt.target)) {
                return;
            }
            if (binding && typeof binding.value === 'function') {
                binding.value();
            }
        };

        addWindowListener('click', handler);
        el.__lpClickOutside = handler;
    },
    beforeUnmount(el) {
        if (el.__lpClickOutside) {
            removeWindowListener('click', el.__lpClickOutside);
            delete el.__lpClickOutside;
        }
    },
    },
};

export function registerFocusDirectives(app) {
    Object.entries(directives).forEach(([name, directive]) => {
        app.directive(name, directive);
    });
}

export default registerFocusDirectives;
