import Vue from 'vue';
import { addWindowListener, removeWindowListener } from '../services/window-events';

function bindDirective(directive) {
    return {
        inserted: directive.mounted,
        unbind: directive.beforeUnmount,
        ...directive,
    };
}

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

Vue.directive('select-on-focus', bindDirective({
    mounted(el) {
        addElementListener(el, '__lpSelectOnFocus', 'focus', () => {
            el.select();
        });
    },
    beforeUnmount(el) {
        removeElementListener(el, '__lpSelectOnFocus', 'focus');
    },
}));

Vue.directive('focus-on-create', bindDirective({
    mounted(el, binding) {
        if (binding.expression && binding.value || !binding.expression) {
            el.focus();
        }
    },
    beforeUnmount() {
    },
}));

Vue.directive('empty-if-zero', bindDirective({
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
}));

Vue.directive('click-outside', bindDirective({
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
}));
