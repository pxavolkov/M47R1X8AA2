<template>
  <div class="container">
    <PageLoader/>
    <div class="row">
      <div class="col-12 col-lg-8">
        <div id="logo">
          <img srcset="@/assets/img/logo_new_xs.png 300w, @/assets/img/logo_new.png 560w" sizes="(min-width: 576px) 560px, 300px" src="@/assets/img/logo_new.png" />
        </div>
        <div class="mainFont">
          <div class="marginCenter mainWidth">
            <span class="blue">Время:&nbsp;</span><span class="green">........................................&nbsp;28&#8209;30.09.2018</span><br />
            <span class="blue">Место:&nbsp;</span><span class="green">.....................................................&nbsp;Крым</span>
          </div>
        </div>

        <Equalizer class="mainWidth" :size="560" :min="25" :max="30" :freq="100"/>

        <div>
          <div class="mainWidth marginCenter relative heightButtons">
            <a href="https://vk.com/cyberpunk2218" target="_blank">
              <img srcset="@/assets/img/vkb_xs.png 100w, @/assets/img/vkb.png 186w" sizes="(min-width: 576px) 186px, 100px" src="@/assets/img/vkb.png" class="buttonvk"/>
            </a>
            <router-link to="/Account/Login">
              <img srcset="@/assets/img/webb_xs.png 100w, @/assets/img/webb.png 186w" sizes="(min-width: 576px) 186px, 100px" src="@/assets/img/webb.png" class="buttonweb"/>
            </router-link>
            <a href="http://ru.cyberpunk2218.wikia.com" target="_blank">
              <img srcset="@/assets/img/bwwiki_xs.png 100w, @/assets/img/bwwiki.png 186w" sizes="(min-width: 576px) 186px, 100px" src="@/assets/img/bwwiki.png" class="buttonwiki" />
            </a>
          </div>
        </div>

        <div class="video">
          <iframe src="https://www.youtube.com/embed/LpEM5GN_D2w?rel=0&amp;showinfo=0" frameborder="0" allowfullscreen class="rightborder"></iframe>
        </div>
      </div>

        <!-- right column -->
      <div class="col-lg-4 d-none d-lg-block">
        <div class="rightborder">
          <ProgressDots :min="21" :max="35" :freq="1000">Work in progress </ProgressDots>
          <Equalizer :horizontal="false" :size="413" :min="25" :max="30" :freq="100"/>
          <div class="clearRight"></div>
          <RotatingCircles/>
          <div class="clearRight"></div>
          <MagicNumbers :freq="500"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import PageLoader from '@/components/PageLoader.vue';
import MagicNumbers from '@/components/MagicNumbers.vue';
import RotatingCircles from '@/components/RotatingCircles.vue';
import ProgressDots from '@/components/ProgressDots.vue';
import Equalizer from '@/components/Equalizer.vue';

@Component({components: {PageLoader, MagicNumbers, RotatingCircles, ProgressDots, Equalizer}})
export default class HelloWorld extends Vue {
}
</script>

<style lang="scss">
/* Logo---------------------------------------------------------*/
#logo{
	margin-top: 30px;
  margin-bottom: 10px;
}

#logo img {
  height: auto;
  margin: auto;    
  display: block;
}

/* Buttons ---------------------------------------------------------*/
.heightButtons {
  height: 75px;
  width: 300px;
}

.buttonvk {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0.7;
}

.buttonvk:hover {
  opacity: 1;
}

.buttonweb {
  position: absolute;
  left: 100px;
  top: 0;
  opacity: 0.7;
}

.buttonweb:hover {
  opacity: 1;
}

.buttonwiki {
  position: absolute;
  left: 200px;
  top: 0;
  opacity: 0.7;
}

.buttonwiki:hover {
  opacity: 1;
}

@media (min-width: 576px) {
  .heightButtons {
    height: 130px;
    width: 560px;
  }
  .buttonweb {
    left: 185px;
  }
  .buttonwiki {
    left: 370px;
  }
}

/* Video---------------------------------------------------------*/
.video {
  padding-bottom: 20px;
}

.video iframe {
	display:block;
	margin: 0 auto;
  padding: 3px;
  width: 304px;
  height: 171px;
}

@media (min-width: 576px) {
  .video iframe {
    width: 560px;
    height: 315px;
  }
}

/* Basic styles---------------------------------------------------------*/
.mainFont{
  font-family: 'RussoOne';
}

.mainWidth {
    width: 300px;
}

@media (min-width: 576px) {
  .mainWidth {
    width: 560px;
  }
}

.rightborder {
  margin-top: 20px;
  border: 1px solid #9DD3AF;
  border-radius: 10px;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
}

/* Simple properties---------------------------------------------------------*/
.clearRight {
  clear: right;
}

.marginCenter {
  margin: 0 auto;
}

.fontsize150 {
  font-size: 150%;
}

.padding5 {
  padding: 5px;
}

.padding10 {
  padding: 10px;
}

.relative {
  position: relative;
}

.marginBottom15 {
  margin-bottom: 15px;
}

/* Modal---------------------------------------------------------*/
.modal a, .modal a:hover, .modal a:visited, .modal a:active{
  text-decoration: none;
  outline: none;
  color: #0895D0;
}

.leftprogress {
  display: block;
  height: 1px;
  border: 0;
  border-top: 2px solid #5591B3;
  margin-top: 2px;
  margin-bottom: 0;
  float: left;
  clear: left;
  z-index: -1;
}

.imgcircle2 {
  position: absolute; 
  bottom: 0; 
  right: 20px;
}

.modalMain {
  font-family: Hooge;
  text-transform: uppercase;
  text-align: center;
  border: 1px solid #107FA9;
  border-radius: 5px;
  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  color: #CDE7CF;
}

.modalProgressBar {
  height: 5px;
  border: 1px solid #107FA9;
}

.modalProgressBar div {
  border: 2px solid #107FA9;
  width: 40%;
  float: right;
}

.modalMainText {
  padding: 10px 0;
  width: 300px;
}

.modalProgress {
  position: absolute;
  bottom:25px;
  width:30%;
}

.modalCirclesContainer {
  position: absolute;
  right: 0;
  width:30%;
}
</style>
