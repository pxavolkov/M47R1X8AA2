import { ProfileResponse, Message, PublicProfile } from 'shared/responses';
import { User, News } from 'shared/master';

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

export interface MasterState {
  users: User[];
  news: News[];
}

export interface GeneratedMasterState {
  pending: {
    users: boolean,
    news: boolean,
  };
  error: {
    users: boolean,
    news: boolean,
  };
}

export interface MessageState {
  messages: Messages;
  users: Users;
}

export interface Users {
  [key: number]: PublicProfile;
}

export interface Messages {
  [key: number]: Message[];
}
