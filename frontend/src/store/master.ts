import Vapi from 'vuex-rest-api';
import { MasterState, GeneratedMasterState } from '@/store/types';
import { SetDonated, SetCitizen, News, SetBalance, UploadQuenta, Item, Property } from 'shared/master';
import { InventoryItem, InventoryItemAmount } from 'shared/responses';
import Vue from 'vue';

const master = new Vapi({
    baseURL: '/api/master',
    state: {
      users: [],
      news: [],
      items: [],
      inventory: [],
      properties: [],
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
    action: 'properties',
    property: 'properties',
    path: '/properties',
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
      if (index !== -1) Vue.set(state.inventory[index], 'amount', payload.data.amount);
      else state.inventory.push(payload.data);
    },
  })
  .post({
    action: 'takeItem',
    path: '/takeItem',
    onSuccess: (state: MasterState, payload: {data: InventoryItemAmount}) => {
      const index = state.inventory.findIndex((v) => v.itemId === payload.data.itemId);
      if (index !== -1) {
        if (payload.data.amount <= 0) state.inventory.splice(index, 1);
        else Vue.set(state.inventory[index], 'amount', payload.data.amount);
      }
    },
  })
  .post({
    action: 'sendMultiMessage',
    path: '/sendMultiMessage',
  })
  .post({
    action: 'updateProperty',
    path: '/updateProperty',
    onSuccess: (state: MasterState, payload: {data: Property}) => {
      const item = state.properties.find((v) => v.id === payload.data.id);
      if (!item) return;

      item.name = payload.data.name;
      item.viewRoles = payload.data.viewRoles;
      item.editRoles = payload.data.editRoles;
    },
  })
  .post({
    action: 'addProperty',
    path: '/addProperty',
    onSuccess: (state: MasterState, payload: {data: Property}) => {
      const data = Object.assign({}, payload.data);
      state.properties.push(data);
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
  isPropertiesLoaded: (state: MasterState & GeneratedMasterState) => {
    return !state.pending.properties && !state.error.properties;
  },
};

Object.assign(master, {getters});

export {master};
