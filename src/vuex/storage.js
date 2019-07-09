import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'src/vuex/modules/axios';
import socket from 'src/vuex/modules/socket';
import user from 'src/vuex/modules/user';
import game from 'src/vuex/modules/game';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        axios,
        socket,
        user,
        game,
    },
});