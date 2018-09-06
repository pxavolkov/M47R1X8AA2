import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';
import Home from './views/Home.vue';
import About from './views/About.vue';
import MainLayout from './layouts/Main.vue';
import Login from './views/Login.vue';
import Register from './views/Register.vue';
import Approval from './views/Approval.vue';
import Profile from './views/Profile.vue';
import UploadPhoto from './views/UploadPhoto.vue';
import Shop from './views/Shop.vue';
import News from './views/News.vue';
import User from './views/User.vue';
import NotFound from './views/NotFound.vue';
import MasterUsers from './views/MasterUsers.vue';
import MasterNews from './views/MasterNews.vue';
import Messages from './views/Messages.vue';
import MasterItems from './views/MasterItems.vue';
import Inventory from './views/Inventory.vue';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
    {
      path: '/',
      name: 'Main',
      component: MainLayout,
      children: [
        {
          path: '/Account/Login',
          name: 'Login',
          component: Login,
          meta: {requiresNoAuth: true},
        },
        {
          path: '/Account/Register',
          name: 'Register',
          component: Register,
          meta: {requiresNoAuth: true},
        },
        {
          path: '/Account/Approval',
          name: 'Approval',
          component: Approval,
          meta: {requiresNoAuth: true},
        },
        {
          path: '/Profile',
          name: 'Profile',
          component: Profile,
          meta: {requiresAuth: true},
        },
        {
          path: '/Profile/UploadPhoto',
          name: 'UploadPhoto',
          component: UploadPhoto,
          meta: {requiresAuth: true},
        },
        {
          path: '/Shop',
          name: 'Shop',
          component: Shop,
          meta: {requiresAuth: true},
        },
        {
          path: '/News',
          name: 'News',
          component: News,
          meta: {requiresAuth: true},
        },
        {
          path: '/User',
          name: 'User',
          component: User,
          meta: {requiresAuth: true},
        },
        {
          path: '/Messages/:userId',
          name: 'Messages',
          component: Messages,
          props: true,
          meta: {requiresAuth: true},
        },
        {
          path: '/Inventory',
          name: 'Inventory',
          component: Inventory,
          meta: {requiresAuth: true},
        },
      ],
    },
    {
      path: '/Master',
      name: 'Master',
      component: MainLayout,
      props: {fluid: true},
      children: [
        {
          path: 'Register',
          name: 'MasterUsers',
          component: MasterUsers,
          meta: {requiresAuth: true},
        },
        {
          path: 'News',
          name: 'MasterNews',
          component: MasterNews,
          meta: {requiresAuth: true},
        },
        {
          path: 'Items',
          name: 'MasterItems',
          component: MasterItems,
          meta: {requiresAuth: true},
        },
        {
          path: 'Inventory/:id',
          name: 'MasterInventory',
          component: Inventory,
          props: true,
          meta: {requiresAuth: true},
        },
      ],
    },
    {
      path: '/404',
      name: '404',
      component: NotFound,
    }, {
      path: '*',
      redirect: '/404',
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (store.getters['auth/isLoggedIn'] && to.matched.some((record) => record.meta.requiresNoAuth)) {
    next('/Profile');
  } else if (!store.getters['auth/isLoggedIn'] && to.matched.some((record) => record.meta.requiresAuth)) {
    next('/Account/Login?ReturnUrl=' + to.fullPath);
  } else {
    next();
  }
});

store.watch(
  ((state: any, getters: any) => getters['auth/isLoggedIn']) as any,
  (isLoggedIn: boolean) => {
    if (isLoggedIn && router.currentRoute.matched.some((r) => r.meta.requiresNoAuth)) {
      if (router.currentRoute.query.ReturnUrl) router.push(router.currentRoute.query.ReturnUrl);
      else router.push('/Profile');
    } else if (!isLoggedIn && router.currentRoute.matched.some((r) => r.meta.requiresAuth)) {
      router.push('/Account/Login?ReturnUrl=' + router.currentRoute.fullPath);
    }
  },
);

export default router;
