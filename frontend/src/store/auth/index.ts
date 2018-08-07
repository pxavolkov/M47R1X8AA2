import { Module } from 'vuex';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { AuthStatus, AuthData, AuthState, RootState } from '../types';
import axios from 'axios';

let authData: AuthData | null = null;
const str = localStorage.getItem('auth');
if (str) {
  authData = JSON.parse(str) as AuthData;
  if (authData.expires < new Date()) authData = null;
  else axios.defaults.headers.common.Authorization = 'Bearer ' + authData.token;
}

export const state: AuthState = {
  status: authData ? AuthStatus.LOGGED_IN : AuthStatus.NOT_LOGGED_IN,
  auth: authData,
  errorMessage: '',
};

const namespaced: boolean = true;

export const auth: Module<AuthState, RootState> = {
    namespaced,
    state,
    getters,
    actions,
    mutations,
};
