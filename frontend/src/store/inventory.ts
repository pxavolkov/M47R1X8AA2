import Vapi from 'vuex-rest-api';

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
  .getStore();

const getters = {
  isLoaded: (state: any) => !state.pending.items && !state.error.items,
};

Object.assign(inventory, {getters});

export {inventory};
