import '@babel/polyfill';

import Vue from 'vue';
import VueRouter from 'vue-router';

import routes from './routes';
import eventBus from './services/event-bus';
import { setRouter, redirect } from './services/navigation';
import store from './store/store';

const focusDirectives = require('./utils/focus.js');
const dataTypes = require('./dataTypes.js');

const Item = dataTypes.Item;
const Category = dataTypes.Category;
const List = dataTypes.List;
const Library = dataTypes.Library;

Vue.use(VueRouter);
const router = new VueRouter({
    mode: 'history',
    routes,
});

setRouter(router);

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
