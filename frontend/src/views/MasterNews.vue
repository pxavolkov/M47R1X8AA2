<template>
  <div v-if="isLoaded">
    <h2 class="green text-center">Новости</h2>
    <b-button to="/Master/Register" class="mb-2">Регистрации</b-button>
    <b-container style="max-width:540px">
      <b-row class="blue">
        <b-col cols="0" sm="2"></b-col>
        <b-col cols="12" sm="8" class="p-0">
          <h3 class="green">Добавить новую новость</h3>
          <NewsEditorItem/>
          <h3 class="green">Редактирование</h3>
          <NewsEditorItem v-for="(item, i) in news" :key="i" :news="item"/>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Getter } from 'vuex-class';
import utils from '@/utils';
import NewsEditorItem from '@/components/NewsEditorItem.vue';

const namespace: string = 'master';

@Component({components: {NewsEditorItem}})
export default class MasterNews extends Vue {
  @State((state) => state.master.news) private news!: any[];
  @Getter('isNewsLoaded', { namespace }) private isLoaded!: boolean;

  public beforeCreate() {
    this.$store.dispatch(`${namespace}/news`);
  }
}
</script>

<style lang="scss">

</style>
