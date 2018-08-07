<template>
  <div class="green mainFont padding5">
    {{ magicNumbers }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import utils from '@/utils';

@Component
export default class MagicNumbers extends Vue {
  @Prop() private freq!: number;
  private magicNumbers: string = '2323.5656.9054532.323';
  private interval: number = -1;
  public created(): void {
    this.interval = window.setInterval(this.updateMagicNumbers, this.freq);
  }
  public beforeDestroy(): void {
    window.clearInterval(this.interval);
  }
  private getNext(length: number): string {
    return new Array(length).fill(0).reduce((acc) => acc + utils.getRandomInt(0, 10), '');
  }
  private updateMagicNumbers(): void {
    this.magicNumbers = this.getNext(4) + '.' + this.getNext(4) + '.' + this.getNext(7) + '.' + this.getNext(3);
  }
}
</script>
