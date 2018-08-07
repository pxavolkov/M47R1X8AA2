<template>
  <div v-if="horizontal" class="equalizer">
    <hr class="eqelem" v-for="i in amount" :key="i - 1" :style="{height: sizes[i - 1] + 'px'}">
  </div>
  <div v-else>
    <hr class="rightprogress" v-for="i in amount" :key="i - 1" :style="{width: sizes[i - 1] + '%'}">
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import utils from '@/utils';

@Component
export default class Equalizer extends Vue {
  @Prop({default: true}) private horizontal!: boolean;
  @Prop() private size!: number;
  @Prop() private min!: number;
  @Prop() private max!: number;
  @Prop() private freq!: number;
  private amount: number = Math.floor(this.size / (this.horizontal ? 10 : 7));
  private sizes: number[] = new Array(this.amount).fill(this.min);
  private interval: number = -1;

  public created(): void {
    this.interval = window.setInterval(this.onTick, this.freq);
  }
  public beforeDestroy(): void {
    window.clearInterval(this.interval);
  }
  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  private getIncremented(current: number): number {
    let sign: number;
    if (current > this.max) sign = -1;
    else if (current < this.min) sign = 1;
    else sign = Math.random() > 0.5 ? 1 : -1;
    return current + sign * utils.getRandomInt(1, 4);
  }
  private onTick(): void {
      this.sizes = this.sizes.map((v) => this.getIncremented(v));
  }
}
</script>

<style lang="scss">
.eqelem {
	display: inline-block;
	border: none;
  color: #5591B3;
  background-color: #5591B3;
  border-color: #5591B3;
  width: 5px;
  margin-right: 5px;
}

.equalizer{
	overflow-x: hidden;
	white-space: nowrap;
  margin: 0 auto;
  height: 80px;
}

.rightprogress {
  display: block;
  height: 1px;
  border: 0;
  border-top: 3px solid #5591B3;
  margin-top: 3px;
  margin-bottom: 0;
  margin-right: 5px;
  float: right;
  clear: right;
}
</style>
