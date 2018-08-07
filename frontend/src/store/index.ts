import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

import { auth } from './auth';
import { profile } from './profile';
import { news } from './news';
import { alert } from './alert';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    auth,
    profile: Object.assign({namespaced: true}, profile),
    news: Object.assign({namespaced: true}, news),
    alert,
  },
});

axios.interceptors.response.use((response) => response, (err) => {
  if (err.response.status === 401) store.dispatch('auth/logout');
  throw err;
});

export default store;
