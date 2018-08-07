import Vapi from 'vuex-rest-api';

const news = new Vapi({
    baseURL: '/api/news',
    state: {
      news: null,
    },
  })
  .get({
    action: 'load',
    property: 'news',
    path: '/load',
  })
  .getStore();

const getters = {
  isLoaded: (state: any) => !state.pending.news && !state.error.news,
};

Object.assign(news, {getters});

export {news};
