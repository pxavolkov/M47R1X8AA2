import { ActionTree } from 'vuex';
import axios from 'axios';
import { RootState, AuthState, AuthData } from '../types';
import { LoginRequest } from 'shared/requests';
import { LoginResponse } from 'shared/responses';

export const actions: ActionTree<AuthState, RootState> = {
  async login({ commit }, data: LoginRequest) {
    commit('loginRequest', {email: data.email});
    try {
      const response = await axios.post('/api/auth/login', data) as {data: LoginResponse};
      const expires = new Date();
      expires.setSeconds(expires.getSeconds() + response.data.expiresIn);
      const auth: AuthData = {
        email: data.email,
        token: response.data.accessToken,
        expires,
      };
      localStorage.setItem('auth', JSON.stringify(auth));
      commit('loginSuccess', auth);
    } catch (err) {
      if (err.response.status === 403) commit('loginFailure', 'Неверный email или пароль');
      else commit('loginFailure', `Неизвестная ошибка (${err.response.status})`);
    }
  },
  logout({ commit }) {
    localStorage.removeItem('auth');
    commit('logout');
  },
};
