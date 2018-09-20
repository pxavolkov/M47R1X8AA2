import Vapi from 'vuex-rest-api';

const profile = new Vapi({
    baseURL: '/api/profile',
    state: {
      profile: null,
      list: [],
    },
  })
  .get({
    action: 'load',
    property: 'profile',
    path: '/load',
    queryParams: true,
  })
  .get({
    action: 'list',
    property: 'list',
    path: '/list',
  })
  .post({
    action: 'transfer',
    path: '/transfer',
  })
  .post({
    action: 'startMining',
    path: '/startMining',
  })
  .post({
    action: 'uploadPhoto',
    path: '/uploadPhoto',
  })
  .getStore();

const getters = {
  isProfileLoaded: (state: any) => !state.pending.profile && !state.error.profile,
  isListLoaded: (state: any) => !state.pending.list && !state.error.list,
};

Object.assign(profile, {getters});

export {profile};
