import { ProfileResponse } from 'shared/responses';

export interface RootState {
  version: string;
}

export interface AuthData {
  email: string;
  token: string;
  expires: Date;
}

export enum AuthStatus {
  NOT_LOGGED_IN,
  LOGGING_IN,
  LOGGED_IN,
  ERROR,
}

export interface AuthState {
  status: AuthStatus;
  auth: AuthData | null;
  errorMessage: string | null;
}

export interface AlertState {
  show: boolean;
  type: string;
  text: string;
}
