import Vapi from 'vuex-rest-api';
import { MasterState, GeneratedMasterState } from '@/store/types';
import { SetDonated, SetCitizen, News, SetBalance, UploadQuenta } from 'shared/master';

const master = new Vapi({
    baseURL: '/api/master',
    state: {
      users: [],
      news: [],
    },
  })
  .get({
    action: 'users',
    property: 'users',
    path: '/users',
  })
  .get({
    action: 'news',
    property: 'news',
    path: '/news',
    onSuccess: (state: MasterState, payload: any) => {
      state.news = payload.data.map(
        ({id, title, text, createDate}: any) => ({id, title, text, createDate: new Date(createDate)}),
      );
    },
  })
  .post({
    action: 'setCitizen',
    path: '/setCitizen',
    onSuccess: (state: MasterState, payload: {data: SetCitizen}) => {
      const user = state.users.find((v) => v.id === payload.data.userId);
      if (user) user.profile.isCitizen = payload.data.isCitizen;
    },
  })
  .post({
    action: 'setDonated',
    path: '/setDonated',
    onSuccess: (state: MasterState, payload: {data: SetDonated}) => {
      const user = state.users.find((v) => v.id === payload.data.userId);
      if (user) user.profile.donated = payload.data.donated;
    },
  })
  .post({
    action: 'updateNews',
    path: '/updateNews',
    onSuccess: (state: MasterState, payload: {data: {newsId: number, data: News}}) => {
      const news = state.news.find((v) => v.id === payload.data.newsId);
      if (!news) return;

      news.title = payload.data.data.title;
      news.text = payload.data.data.text;
      news.createDate = new Date(payload.data.data.createDate);
    },
  })
  .post({
    action: 'addNews',
    path: '/addNews',
    onSuccess: (state: MasterState, payload: {data: News}) => {
      const data = Object.assign({}, payload.data);
      data.createDate = new Date(data.createDate);
      state.news.push(data);
    },
  })
  .post({
    action: 'setBalance',
    path: '/setBalance',
    onSuccess: (state: MasterState, payload: {data: SetBalance}) => {
      const user = state.users.find((v) => v.id === payload.data.userId);
      if (user) user.profile.balance = payload.data.balance;
    },
  })
  .post({
    action: 'uploadQuenta',
    path: '/uploadQuenta',
    onSuccess: (state: MasterState, payload: {data: UploadQuenta}) => {
      const user = state.users.find((v) => v.id === payload.data.userId);
      if (user) user.profile.quentaPath = payload.data.quentaPath;
    },
  })
  .getStore();

const getters = {
  isUsersLoaded: (state: MasterState & GeneratedMasterState) => {
    return !state.pending.users && !state.error.users && state.users.length;
  },
  isNewsLoaded: (state: MasterState & GeneratedMasterState) => {
    return !state.pending.news && !state.error.news && state.news.length;
  },
};

Object.assign(master, {getters});

export {master};
