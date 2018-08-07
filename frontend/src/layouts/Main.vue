<template>
  <div class="container main" style="max-width: 540px;">
    <GlobalAlert/>
    <nav class="navbar navbar-dark">
      <b-navbar-brand to="/Profile" class="yellow mx-auto">Virtech inner web</b-navbar-brand>
      <template v-if="isLoggedIn">
        <b-navbar-toggle target="nav_collapse" right></b-navbar-toggle>
        <b-collapse is-nav id="nav_collapse" class="blue text-right">
          <b-navbar-nav>
            <b-nav-item @click="logoutAndRedirect">Выход</b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </template>
    </nav>
    <b-row class="justify-content-center" style="margin-top: 10px;">
      <b-col>
        <div class="topProgressBar" id="topProgressBar"><div></div></div>
        <router-view/>
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';
import GlobalAlert from '@/components/GlobalAlert.vue';

const namespace: string = 'auth';

@Component({components: {GlobalAlert}})
export default class Main extends Vue {
  @Getter('email', { namespace }) private email!: string;
  @Action('logout', { namespace }) private logout!: () => void;
  @Getter('isLoggedIn', { namespace }) private isLoggedIn!: boolean;

  private logoutAndRedirect() {
    this.logout();
    this.$router.push('/Account/Login');
  }
}
</script>

<style lang="scss">
.debug-header {
  position: absolute;
  right: 0;
}

.main {
  font-family: Hooge;
  text-transform: uppercase;
}

.hoverlight {
  opacity: .7
}

.hoverlight:hover {
  opacity: 1
}

.yellow {
  color: #FFF7B2 !important;
}

.lightGreen {
  color: #D6E9D8;
}

.almostWhite {
  color: #FFF7B2;
}

.fontsize150{
  font-size:150%
}

.fontsize200{
  font-size:200%
}

.topProgressBar{
  height:5px;
  border:1px solid #107FA9;
  margin-bottom: 9px;
}

.topProgressBar div{
  border:2px solid #107FA9;
  width:40%;
  float:right;
  margin-right: 15px;
}

#topProgressBar {
  margin-top: -11px;
}

#nameSearch::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: #0098DA;
  font-family: Hooge;
  opacity: 0.6;
}

#nameSearch::-webkit-input-placeholder { /* Chrome/Opera/Safari */
  color: #0098DA;
  font-family: Hooge;
  opacity: 0.6;
}

#nameSearch::-moz-placeholder { /* Firefox 19+ */
  color: #0098DA;
  font-family: Hooge;
  opacity: 0.6;
}

#nameSearch:-ms-input-placeholder { /* IE 10+ */
  color: #0098DA;
  font-family: Hooge;
  opacity: 0.6;
}

#nameSearch:-moz-placeholder { /* Firefox 18- */
  color: #0098DA;
  font-family: Hooge;
  opacity: 0.6;
}

.big-button {
  @extend .hoverlight;
  text-align: center;
  border: 2px solid #0098DA;
  border-radius: 10px;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  cursor: pointer;
  background-color: transparent;
}

.navbar-brand {
  font-size: 150%;
  &:hover {
    color: #0056b3 !important;
  }
}

.navbar-toggler {
  border: 2px solid #107FA9 !important;
  border-radius: 5px;
}

.nav-item a {
  color: #0098DA !important;
  opacity: .7;
  &:hover {
    opacity: 1;
  }
}
</style>