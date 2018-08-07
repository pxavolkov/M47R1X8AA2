<template>
  <div class="blue mainFont padding10">
    <slot></slot> <span class="green fontsize150" id="dots">{{ text }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ProgressDots extends Vue {
  @Prop() private min!: number;
  @Prop() private max!: number;
  @Prop() private freq!: number;
  private text: string = new Array(this.min).fill('.').join(' ');
  private count: number = this.min;
  private interval: number = -1;

  public created(): void {
    this.interval = window.setInterval(this.updateProgress, this.freq);
  }
  public beforeDestroy(): void {
    window.clearInterval(this.interval);
  }
  private updateProgress(): void {
    if (this.count > this.max) {
      this.count = 1;
      this.text = '.';
    } else {
      this.text += ' .';
      this.count++;
    }
  }
}
</script>
