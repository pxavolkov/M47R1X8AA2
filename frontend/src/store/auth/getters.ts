import { GetterTree } from 'vuex';
import { AuthStatus, AuthState, RootState } from '../types';

export const getters: GetterTree<AuthState, RootState> = {
  errorMessage(state): string {
    return state.errorMessage || '';
  },
  email(state): string {
    return state.auth ? state.auth.email : '';
  },
  isLoggedIn(state): boolean {
    return state.status === AuthStatus.LOGGED_IN;
  },
};
