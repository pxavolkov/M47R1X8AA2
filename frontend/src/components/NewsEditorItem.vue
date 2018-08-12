<template>
  <b-row class="news-item">
    <b-col cols="9">
      <textarea class="invisible-input fontsize150" ref="title" @keyup="textAreaAdjust($refs.title)" v-model="data.title" placeholder="Заголовок"></textarea>
      <textarea class="invisible-input" ref="text" @keyup="textAreaAdjust($refs.text)" v-model="data.text" placeholder="Текст новости"></textarea>
    </b-col>
    <b-col cols="3" class="pl-2 pr-0">
      <input class="invisible-input text-center" type="text" v-model="data.createDate">
      <b-button class="mt-2" size="sm" :variant="isDirty ? 'success' : ''" :disabled="!isDirty" @click="save">Сохранить</b-button>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { News } from 'shared/master';

@Component
export default class NewsEditorItem extends Vue {
  @Prop() private news: News | undefined;

  private data = {
    title: this.news ? this.news.title : '',
    text: this.news ? this.news.text : '',
    createDate: this.formattedDate,
  };

  public mounted() {
    this.textAreaAdjust(this.$refs.title as HTMLElement);
    this.textAreaAdjust(this.$refs.text as HTMLElement);
  }

  private get isDirty() {
    return !this.news || this.news.title !== this.data.title ||
      this.news.text !== this.data.text ||
      this.formattedDate !== this.data.createDate;
  }

  get formattedDate(): string {
    const d = this.news ? this.news.createDate as Date : new Date();
    return (`${d.getDate().toString().padStart(2, '0')}.` +
      `${(d.getMonth() + 1).toString().padStart(2, '0')}.` +
      `${d.getFullYear()}`);
  }

  private textAreaAdjust(element: HTMLElement) {
    element.style.height = '1px';
    element.style.height = (2 + element.scrollHeight) + 'px';
  }

  private async save() {
    const parts = this.data.createDate.split('.');
    const createDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    const data = Object.assign({}, this.data, {createDate});
    if (this.news) this.$store.dispatch('master/updateNews', {data: {newsId: this.news.id, data}});
    else {
      await this.$store.dispatch('master/addNews', {data});
      this.data.title = '';
      this.data.text = '';
      this.data.createDate = this.formattedDate;
    }
  }
}
</script>

<style lang="scss">
.news-item {
  border-bottom: 1px dashed #0098DA;
}

.invisible-input {
  background-color: transparent;
  border: 1px dashed #0098DA;
  width: 100%;
  color: #0098DA;
}
</style>