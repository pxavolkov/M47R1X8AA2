import Vapi from 'vuex-rest-api';
import { MasterState, GeneratedMasterState } from '@/store/types';
import { SetCitizen, News, SetBalance, UploadQuenta, Item, RemovedItem } from 'shared/master';
import { InventoryItem } from 'shared/responses';
import Vue from 'vue';

const master = new Vapi({
    baseURL: '/api/master',
    state: {
      users: [],
      news: [],
      items: [],
      inventory: [],
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
  .get({
    action: 'items',
    property: 'items',
    path: '/items',
  })
  .get({
    action: 'loadInventory',
    property: 'inventory',
    path: '/loadInventory',
    queryParams: true,
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
    action: 'updateItem',
    path: '/updateItem',
    onSuccess: (state: MasterState, payload: {data: Item}) => {
      const item = state.items.find((v) => v.id === payload.data.id);
      if (!item) return;

      item.title = payload.data.title;
      item.shortDesc = payload.data.shortDesc;
      item.longDesc = payload.data.longDesc;
    },
  })
  .post({
    action: 'addItem',
    path: '/addItem',
    onSuccess: (state: MasterState, payload: {data: Item}) => {
      const data = Object.assign({}, payload.data);
      state.items.push(data);
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
  .post({
    action: 'giveItem',
    path: '/giveItem',
    onSuccess: (state: MasterState, payload: {data: InventoryItem}) => {
      const index = state.inventory.findIndex((v) => v.itemId === payload.data.itemId);
      console.log('giveItem: ', index);
      if (index !== -1) {
        const item = Object.assign({}, state.inventory[index], {amount: payload.data.amount});
        console.log(item);
        Vue.set(state.inventory, index, item);
        console.log(state.inventory[index]);
      } else state.inventory.push(payload.data);
    },
  })
  .post({
    action: 'takeItem',
    path: '/takeItem',
    onSuccess: (state: MasterState, payload: {data: RemovedItem}) => {
      const index = state.inventory.findIndex((v) => v.itemId === payload.data.itemId);
      if (index !== -1) {
        if (payload.data.amount <= 0) state.inventory.splice(index, 1);
        else Vue.set(state.inventory[index], 'amount', payload.data.amount);
      }
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
  isItemsLoaded: (state: MasterState & GeneratedMasterState) => {
    return !state.pending.items && !state.error.items;
  },
};

Object.assign(master, {getters});

export {master};
