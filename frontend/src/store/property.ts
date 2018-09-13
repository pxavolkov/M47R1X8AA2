import Vapi from 'vuex-rest-api';
import { PropertyState } from './types';
import { SetProperty } from 'shared/requests';
import { PropertyValueEditable, PublicProfile } from 'shared/responses';

const property = new Vapi({
    baseURL: '/api/property',
    state: {
      list: [],
      profile: null,
    },
  })
  .get({
    action: 'load',
    property: 'list',
    path: '/load',
    queryParams: true,
    onSuccess: (state: PropertyState, payload: {data: {list: PropertyValueEditable[], profile: PublicProfile}}) => {
      state.list = payload.data.list;
      state.profile = payload.data.profile;
    },
  })
  .post({
    action: 'updateValue',
    path: '/updateValue',
    onSuccess: (state: PropertyState, payload: {data: SetProperty}) => {
      const item = state.list.find((v) => v.id === payload.data.propertyId);
      if (!item) return;

      item.value = payload.data.value;
    },
  })
  .getStore();

const getters = {
  isLoaded: (state: any) => !state.pending.list && !state.error.list,
};

Object.assign(property, {getters});

export {property};
