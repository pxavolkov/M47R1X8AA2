<template>
  <div id="containercircle" @hover="rotateCircles" @mouseenter="startRotation" @mouseLeave="stopRotation = true">
    <img :style="{transform: 'rotate(' + angle1 + 'deg)'}" src="@/assets/img/CIRC1.png" class="imgcircle" @transitionend="rotateCircles"/>
    <img :style="{transform: 'rotate(' + angle2 + 'deg)'}" src="@/assets/img/CIRC2a.png" class="imgcircle" @transitionend="rotateCircles"/>
    <img :style="{transform: 'rotate(' + angle3 + 'deg)'}" src="@/assets/img/CIRC3a.png" class="imgcircle" @transitionend="rotateCircles"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class RotatingCircles extends Vue {
  @Prop() private freq!: number;
  private interval: number = -1;
  private angle1: number = 70;
  private angle2: number = -60;
  private angle3: number = 50;
  private stopRotation: boolean = true;

  private startRotation() {
    this.stopRotation = false;
    this.rotateCircles();
  }
  private rotateCircles() {
    if (this.stopRotation) return;

    this.angle1 = this.angle1 === -20 ? 70 : -20;
    this.angle2 = this.angle2 === 30 ? -60 : 30;
    this.angle3 = this.angle3 === -40 ? 50 : -40;
  }
}
</script>

<style lang="scss">
.imgcircle {
  position: absolute; 
  bottom: 0; 
  right: 10px;
  transition: transform 4s ease;
  transform-origin: 50% 50% 0px;
}

#containercircle {
  float: right;
  position: relative;
  margin-top: 120px;
}
</style>
