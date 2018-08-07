<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import PageLoader from '@/components/PageLoader.vue';

@Component
export default class App extends Vue {
}
</script>

<style lang="scss">
/* Fonts---------------------------------------------------------*/
@font-face {
  font-family: 'RussoOne';
  src: url('./assets/fonts/russo_one_regular.eot?#iefix') format('embedded-opentype'), 
    url('./assets/fonts/russo_one_regular.ttf')  format('truetype');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'Sanasoft';
  src: url('./assets/fonts/Sanasoft_Inset_B.kz.eot?#iefix') format('embedded-opentype'), 
    url('./assets/fonts/Sanasoft_Inset_B.kz.ttf')  format('truetype');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'Hooge';
  src: url('./assets/fonts/hooge_05_55_cyr.eot?#iefix') format('embedded-opentype'), 
    url('./assets/fonts/hooge_05_55_cyr.ttf')  format('truetype');
  font-weight: normal;
  font-style: normal;
}

/* Background---------------------------------------------------------*/
body {
  background-color: #1A5784;
  background: url(./assets/img/BACK11.png) no-repeat center center fixed; 
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}

/* Basic styles---------------------------------------------------------*/
.blue {
  color: #0098DA;
}

.green {
  color: #9DD3AF;
}

.orange {
  color: #FE6F01;
}

</style>
