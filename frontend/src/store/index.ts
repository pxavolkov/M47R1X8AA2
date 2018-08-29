import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

import { auth } from './auth';
import { profile } from './profile';
import { news } from './news';
import { alert } from './alert';
import { master } from './master';
import { message } from './message';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    auth,
    profile: Object.assign({namespaced: true}, profile),
    news: Object.assign({namespaced: true}, news),
    alert,
    master: Object.assign({namespaced: true}, master),
    message: Object.assign({namespaced: true}, message),
  },
});

axios.interceptors.response.use((response) => response, (err) => {
  if (err.response.status === 401) store.dispatch('auth/logout');
  else if (err.request.responseURL.indexOf('/master/') > -1) {
    store.commit('alert/show', {type: 'danger', text: 'Ошибка (' + err.response.status + ')'});
  }
  throw err;
});

export default store;
