<template>
  <div class="container main">
    <GlobalAlert/>
    <nav class="navbar navbar-toggleable-md">
      <router-link to="/Profile" class="navbar-brand yellow fontsize150" style="margin-left: auto; margin-right: auto;">Virtech inner web</router-link>
      <h4 v-if="isLoggedIn" class="debug-header text-center text-danger">{{ email }} <button @click="logoutAndRedirect">Logout</button></h4>
    </nav>
    <b-row class="justify-content-center" style="margin-top: 10px;">
      <b-col style="max-width: 540px;">
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
  color: #FFF7B2;
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
</style>