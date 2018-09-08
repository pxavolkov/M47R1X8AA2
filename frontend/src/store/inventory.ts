import Vapi from 'vuex-rest-api';
import { InventoryState } from '@/store/types';
import { InventoryItemAmount } from 'shared/responses';
import Vue from 'vue';

const inventory = new Vapi({
    baseURL: '/api/inventory',
    state: {
      items: [],
    },
  })
  .get({
    action: 'load',
    property: 'items',
    path: '/load',
  })
  .post({
    action: 'transfer',
    path: '/transfer',
    onSuccess: (state: InventoryState, payload: {data: InventoryItemAmount}) => {
      const index = state.items.findIndex((v) => v.itemId === payload.data.itemId);
      if (index !== -1) {
        if (payload.data.amount <= 0) state.items.splice(index, 1);
        else Vue.set(state.items[index], 'amount', payload.data.amount);
      }
    },
  })
  .getStore();

const getters = {
  isLoaded: (state: any) => !state.pending.items && !state.error.items,
};

Object.assign(inventory, {getters});

export {inventory};
