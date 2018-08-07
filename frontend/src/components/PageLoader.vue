<template>
  <div ref="loader" id="loader">
    <div id="loaderMessage" class="mainFont blue">{{ loaderMessage }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class PageLoader extends Vue {
  @Prop({default: 8000}) private duration!: number;
  @Prop({default: 5}) private dotsNumber!: number;
  @Prop({default: 1000}) private dotsInterval!: number;
  private timerLoader: number = -1;
  private loaderCount: number = 0;
  private loaderMessage: string = 'Loading cyberdeck interface ';
  public created(): void {
    // hide loader
    setTimeout(this.hide, this.duration);

    // add dots and final word to loader message
    this.timerLoader = window.setInterval(this.onTick, this.dotsInterval);
  }
  private onTick(): void {
    if (this.loaderCount < this.dotsNumber) {
        this.loaderCount++;
        this.loaderMessage += '.';
    } else {
        this.loaderMessage += ' complete';
        window.clearInterval(this.timerLoader);
    }
  }
  private hide(): void {
    (this.$refs.loader as HTMLElement).style.display = 'none';
    clearInterval(this.timerLoader);
  }
}
</script>

<style lang="scss">
#loader {
	position:fixed;
	padding:0;
	margin:0;
	top:0;
	left:0;
	width: 100%;
	height: 100%;

	background: url(../assets/img/loader.gif) no-repeat center center fixed;
	-webkit-background-size: center;
	-moz-background-size: center;
	-o-background-size: center;
	background-size: center;
	z-index: 1000;
	background-color: #0E2225;
}

#loaderMessage {
	text-align: center;
	margin-top: 50px;
}
</style>
