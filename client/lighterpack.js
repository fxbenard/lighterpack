import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { createApp, h } from 'vue';
import { createRouter, createWebHistory, RouterView } from 'vue-router';

import routes from './routes';
import { registerAppEventHandlers } from './services/app-events';
import { setRouter, redirect } from './services/navigation';
import { showGlobalAlert } from './services/user-feedback';
import { registerFocusDirectives } from './utils/focus';
import store from './store/store';

const router = createRouter({
    history: createWebHistory(),
    routes,
});

setRouter(router);

registerAppEventHandlers({
    onUnauthorized(message) {
        if (message) {
            store.commit('pushGlobalAlert', { message });
        }
        redirect('/signin');
    },
    onGlobalAlert(alert) {
        store.commit('pushGlobalAlert', alert);
    },
});

store.dispatch('init')
    .then(() => {
        initLighterPack();
    })
    .catch((error) => {
        if (!store.state.library) {
            router.push('/welcome');
        }
        showGlobalAlert(error);
        initLighterPack();
    });

var initLighterPack = function () {
    const app = createApp({
        render() {
            return h(RouterView);
        },
    });

    app.use(router);
    app.use(store);
    registerFocusDirectives(app);

    router.isReady().then(() => {
        window.LighterPack = app.mount('#lp');
    });
};
