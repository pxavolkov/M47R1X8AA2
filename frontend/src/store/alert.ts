import { Module, MutationTree, ActionTree } from 'vuex';
import { RootState, AlertState } from './types';

const state: AlertState = {
  show: false,
  type: '',
  text: '',
};

const mutations: MutationTree<AlertState> = {
  show(s, options) {
    s.type = options.type;
    s.text = options.text;
    s.show = true;
  },
  hide(s) {
    s.show = false;
  },
};

const actions: ActionTree<AlertState, RootState> = {
  payRequired({ commit }) {
    commit('show', {type: 'blue', text: 'Для использования функций Матрицы оплатите регистрационный взнос'});
  },
};

const namespaced: boolean = true;

export const alert: Module<AlertState, RootState> = {
    namespaced,
    state,
    mutations,
    actions,
};
