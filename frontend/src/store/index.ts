import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

import { auth } from './auth';
import { profile } from './profile';
import { news } from './news';
import { alert } from './alert';
import { master } from './master';
import { message } from './message';
import { inventory } from './inventory';
import { property } from './property';
import { gift } from './gift';
import { kb } from './kb';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    auth,
    profile: Object.assign({namespaced: true}, profile),
    news: Object.assign({namespaced: true}, news),
    alert,
    master: Object.assign({namespaced: true}, master),
    message: Object.assign({namespaced: true}, message),
    inventory: Object.assign({namespaced: true}, inventory),
    property: Object.assign({namespaced: true}, property),
    gift: Object.assign({namespaced: true}, gift),
    kb: Object.assign({namespaced: true}, kb),
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
