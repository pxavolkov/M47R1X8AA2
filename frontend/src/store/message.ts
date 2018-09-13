import { Module, MutationTree, ActionTree } from 'vuex';
import { MessageState, RootState } from './types';
import socket from '@/socket';
import Vue from 'vue';
import { LoadDialog, SendMessage } from 'shared/requests';
import { Dialog, Message } from 'shared/responses';

export const messageState: MessageState = {
  messages: {},
  users: {},
};

const mutations: MutationTree<MessageState> = {
  SOCKET_CONNECT(state, status) {
    // tslint:disable-next-line:no-console
    console.log('socket connected');
  },
  SOCKET_MESSAGE(state, data) {
    if (!state.messages[data.fromUserId]) Vue.set(state.messages, data.fromUserId, []);
    state.messages[data.fromUserId].push(data);
  },
  loadDialog(state, data) {
    Vue.set(state.messages, data.userId, data.messages);
  },
  addMessage(state, data) {
    if (!state.messages[data.toUserId]) Vue.set(state.messages, data.toUserId, []);
    state.messages[data.toUserId].push(data);
  },
  addUsers(state, data) {
    for (const user of data) Vue.set(state.users, user.id, user);
  },
};

const actions: ActionTree<MessageState, RootState> = {
  async loadDialog({commit}, data: LoadDialog) {
    return new Promise((resolve) => {
      socket.emit('loadDialog', data, (ack: Dialog) => {
        commit('loadDialog', {userId: data.userId, messages: ack.messages});
        commit('addUsers', ack.users);
        resolve();
      });
    });
  },
  async sendMessage({commit}, data: SendMessage) {
    return new Promise((resolve) => {
      socket.emit('message', data, (ack: Message) => {
        commit('addMessage', ack);
        resolve();
      });
    });
  },
};

const namespaced: boolean = true;

export const message: Module<MessageState, RootState> = {
    namespaced,
    state: messageState,
    mutations,
    actions,
};
