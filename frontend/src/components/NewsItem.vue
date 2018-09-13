<template>
  <b-row class="news-item">
    <b-col cols="9">
      <div class="fontsize150">{{ title }}</div>
      <div ref="text" class="news-text" :class="{preview: needExpand && !expanded}" :style="maxHeight">{{ text }}</div>
    </b-col>
    <b-col cols="3">
      <div>{{ formattedDate }}</div>
      <button class="news-toggle" :class="{expanded}" v-if="needExpand" @click="toggle()">V</button>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class NewsItem extends Vue {
  @Prop() private title!: string;
  @Prop() private text!: string;
  @Prop() private date!: Date;

  private height: number = 0;
  private expanded: boolean = false;

  get needExpand(): boolean {
    return this.height > 96;
  }

  get maxHeight(): string {
    return 'max-height:' + (this.needExpand ? this.height + 'px' : 'auto');
  }

  get formattedDate(): string {
    return (`${this.date.getDate().toString().padStart(2, '0')}.` +
      `${(this.date.getMonth() + 1).toString().padStart(2, '0')}.` +
      `${this.date.getFullYear()}`);
  }

  public mounted() {
    this.height = (this.$refs.text as Element).clientHeight;
  }

  private toggle() {
    this.expanded = !this.expanded;
  }
}
</script>

<style lang="scss">
.news-item {
  border-bottom: 1px dashed #0098DA;
  font-family: NewsFont;
}

.news-text {
  transition: all 500ms ease;
  overflow: hidden;
}

.news-text.preview {
  max-height: 72px !important;
}

.news-toggle {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 2em;
  color: inherit;
  border: 1px solid #0098DA;
  border-radius: 10px;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  width: 50px;
  height: 50px;
  background-color: transparent;
  cursor: pointer;
  transition: all 500ms ease;
  &.expanded {
    transform: scaleY(-1); // rotate(180deg);
  }
}

@font-face {
    font-family: NewsFont;
    src: url(../assets/fonts/NewsFont.otf) format('truetype');
    font-weight: 400;
    font-style: normal
}
</style>