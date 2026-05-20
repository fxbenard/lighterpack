import Vue from 'vue';
import eventBus from '../services/event-bus';

Vue.directive('select-on-focus', {
    inserted(el) {
        el.addEventListener('focus', (evt) => {
            el.select();
        });
    },
});

Vue.directive('focus-on-create', {
    inserted(el, binding) {
        if (binding.expression && binding.value || !binding.expression) {
            el.focus();
        }
    },
});

Vue.directive('focus-on-bus', {
    inserted(el, binding) {
        const handler = () => {
            el.focus();
        };

        el.__lpFocusOnBus = handler;
        eventBus.on(binding.value, handler);
    },
    unbind(el, binding) {
        if (el.__lpFocusOnBus) {
            eventBus.off(binding.value, el.__lpFocusOnBus);
            delete el.__lpFocusOnBus;
        }
    },
});

Vue.directive('select-on-bus', {
    inserted(el, binding) {
        const handler = () => {
            el.select();
        };

        el.__lpSelectOnBus = handler;
        eventBus.on(binding.value, handler);
    },
    unbind(el, binding) {
        if (el.__lpSelectOnBus) {
            eventBus.off(binding.value, el.__lpSelectOnBus);
            delete el.__lpSelectOnBus;
        }
    },
});

Vue.directive('empty-if-zero', {
    inserted(el) {
        el.addEventListener('focus', (evt) => {
            if (el.value === '0' || el.value === '0.00') {
                el.dataset.originalValue = el.value;
                el.value = '';
            }
        });

        el.addEventListener('blur', (evt) => {
            if (el.value === '') {
                el.value = el.dataset.originalValue || '0';
            }
        });
    },
});

Vue.directive('click-outside', {
    inserted(el, binding) {
        const handler = (evt) => {
            if (el.contains(evt.target)) {
                return;
            }
            if (binding && typeof binding.value === 'function') {
                binding.value();
            }
        };

        window.addEventListener('click', handler);
        el.__lpClickOutside = handler;
    },
    unbind(el) {
        if (el.__lpClickOutside) {
            window.removeEventListener('click', el.__lpClickOutside);
            delete el.__lpClickOutside;
        }
    },
});
