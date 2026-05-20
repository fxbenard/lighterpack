import '@babel/polyfill';

import Vue from 'vue';
import VueRouter from 'vue-router';

import routes from './routes';
import eventBus, { legacyEventBus } from './services/event-bus';
import { setRouter, redirect, legacyNavigation } from './services/navigation';
import store from './store/store';

const focusDirectives = require('./utils/focus.js');
const dataTypes = require('./dataTypes.js');

const Item = dataTypes.Item;
const Category = dataTypes.Category;
const List = dataTypes.List;
const Library = dataTypes.Library;

Vue.use(VueRouter);

const utils = require('./utils/utils.js');

window.Vue = Vue; // surfacing Vue globally for utils methods
const router = new VueRouter({
    mode: 'history',
    routes,
});

setRouter(router);

window.bus = legacyEventBus; // temporary Vue 2 compatibility for existing components
window.router = legacyNavigation; // temporary Vue 2 compatibility for existing components

eventBus.on('unauthorized', () => {
    redirect('/signin');
});

store.dispatch('init')
    .then(() => {
        initLighterPack();
    })
    .catch((error) => {
        if (!store.state.library) {
            router.push('/welcome');
        }
        initLighterPack();
    });

var initLighterPack = function () {
    window.LighterPack = new Vue({
        router,
        store,
        data: {
            path: '',
            fatal: '',
        },
        watch: {
            $route(to, from) {
                this.path = to.path;
            },
        },
        mounted() {
            this.path = router.currentRoute.path;
        },
    }).$mount('#lp');
};
