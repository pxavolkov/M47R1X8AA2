import { MutationTree } from 'vuex';
import axios from 'axios';
import { AuthStatus, AuthState, AuthData } from '../types';

export const mutations: MutationTree<AuthState> = {
  loginRequest(state, auth: AuthData) {
    state.status = AuthStatus.LOGGING_IN;
    state.auth = auth;
  },
  loginSuccess(state, auth: AuthData) {
      state.status = AuthStatus.LOGGED_IN;
      state.auth = auth;
      axios.defaults.headers.common.Authorization = 'Bearer ' + auth.token;
  },
  loginFailure(state, message: string) {
      state.status = AuthStatus.ERROR;
      state.auth = null;
      axios.defaults.headers.common.Authorization = null;
      state.errorMessage = message;
  },
  logout(state) {
      state.status = AuthStatus.NOT_LOGGED_IN;
      state.auth = null;
      axios.defaults.headers.common.Authorization = null;
  },
};
