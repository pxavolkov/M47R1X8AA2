import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import Croppa from 'vue-croppa';
import 'vue-croppa/dist/vue-croppa.css';
import VueSocketio from 'vue-socket.io-extended';
import socket from './socket';

Vue.use(BootstrapVue);
Vue.use(Croppa);
Vue.use(VueSocketio, socket, {store});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
