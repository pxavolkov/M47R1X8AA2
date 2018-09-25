import Vapi from 'vuex-rest-api';
import { MutationTree } from 'vuex';
import { KbState, KbGeneratedState } from './types';

const kb = new Vapi({
    baseURL: '/api/kb',
    state: {
      servers: [],
      entries: [],
      entry: {
        id: -1,
        key: '',
        text: '',
        link: '',
        needPassword: false,
      },
      server: {
        id: -1,
        name: '',
        description: '',
        password: null,
      },
    },
  })
  .get({
    action: 'loadServers',
    property: 'servers',
    path: '/loadServers',
  })
  .post({
    action: 'loadEntries',
    property: 'entries',
    path: '/loadEntries',
    onSuccess: (state: KbState, payload: any) => {
      state.entries = payload.data.entries;
      const {id, name, description, hasAccess, needPassword, correctPassword} = payload.data.server;
      state.server = {id, name, description, password: state.server.password, hasAccess, needPassword, correctPassword};
    },
  })
  .post({
    action: 'loadServer',
    property: 'server',
    path: '/loadServer',
    onSuccess: (state: KbState, payload: any) => {
      const {id, name, description, hasAccess, needPassword, correctPassword} = payload.data;
      state.server = {id, name, description, password: state.server.password, hasAccess, needPassword, correctPassword};
    },
  })
  .post({
    action: 'loadEntry',
    property: 'entry',
    path: '/loadEntry',
  })
  .getStore();

const getters = {
  isServersLoaded: (state: KbGeneratedState) => !state.pending.servers && !state.error.servers,
  isEntriesLoaded: (state: KbGeneratedState) => !state.pending.entries && !state.error.entries,
};

kb.mutations.clearServers = (state: KbState) => {
  state.servers = [];
};

kb.mutations.setServer = (state: KbState, data: any) => {
  state.server.id = data.id;
  state.server.name = data.name;
  state.server.description = data.description;
  state.server.password = data.password;
};

kb.mutations.setServerPassword = (state: KbState, password: string) => {
  state.server.password = password;
};

kb.mutations.clearEntries = (state: KbState) => {
  state.entries = [];
};

kb.mutations.setEntry = (state: KbState, data: any) => {
  state.entry.id = data.id;
  state.entry.key = data.key;
  state.entry.text = data.text;
  state.entry.link = data.link;
  state.entry.needPassword = !!data.needPassword;
  state.entry.encrypted = !!data.encrypted;
  state.entry.decrypted = !!data.decrypted;
};

Object.assign(kb, {getters});

export {kb};
