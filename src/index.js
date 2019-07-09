import _ from 'lodash';
import Vue from 'vue';


import 'src/scss/main.scss';
import VModal from 'vue-js-modal';
import store from 'src/vuex/storage';
import app from 'src/vue/main';

Vue.use(VModal);


//config
window.env = (key) => {
    const data = {
        'SOCKET_MAIN_DATA': process.env.SOCKET_MAIN_DATA,
        'DEBUG': JSON.parse(process.env.DEBUG),
    };
    return key ? data[key] : data;
};

//error handler

//require component


const vueApp = new Vue({
    el: '#app',
    store,
    render: c => c('app'),
    components: {app},
    mounted() {
        console.log('index app', this);
        // this.$store.dispatch('SOCKET_INIT');
    },
});

window.app = vueApp;