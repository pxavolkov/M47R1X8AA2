import Vapi from 'vuex-rest-api';

const gift = new Vapi({
    baseURL: '/api/gift',
    state: {
      gift: null,
      activated: null,
    },
  })
  .get({
    action: 'load',
    property: 'gift',
    path: '/load',
    queryParams: true,
  })
  .post({
    action: 'activate',
    property: 'activated',
    path: '/activate',
  })
  .getStore();

const getters = {
  isLoaded: (state: any) => !state.pending.gift && !state.error.gift,
  isCodeValid: (state: any) => !state.pending.gift && !state.error.gift && state.gift.isCodeValid,
  isActivated: (state: any) => !state.pending.activate && !state.error.actvate && !!state.activated,
  isWrongCode: (state: any) => !state.pending.gift && state.error.gift,
};

Object.assign(gift, {getters});

export {gift};
