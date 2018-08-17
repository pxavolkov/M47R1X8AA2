<template>
  <b-row class="blue">
    <b-col cols="0" sm="2"></b-col>
    <b-col cols="12" sm="8" class="p-0">
      <NewsItem v-for="(item, i) in news" :key="i" :title="item.title" :text="item.text" :date="new Date(item.date)"/>
      <div class="text-center">
        <router-link to="/Profile" >Вернуться в профиль</router-link>
      </div>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { News as NewsData } from 'shared/responses';
import NewsItem from '@/components/NewsItem.vue';

const namespace: string = 'news';

@Component({components: {NewsItem}})
export default class News extends Vue {
  @State((state) => state.news.news ? state.news.news.news : []) private news!: NewsData[];
  @Action('payRequired', { namespace: 'alert' }) private payRequired!: () => Promise<void>;
  private isLoaded: boolean = false;

  public beforeCreate() {
    this.$store.dispatch(`${namespace}/load`).catch((err) => {
      if (err.response.status === 500) {
        this.showAlert('danger', 'Ошибка при загрузке новостей. Обратитесь к администрации');
      } else if (err.response.status === 403) this.payRequired();
      else if (err.response.status !== 401) {
        this.showAlert('danger', `Ошибка при загрузке новостей (${err.response.status})`);
      }
    });
  }

  private showAlert(type: string, text: string) {
    this.$store.commit('alert/show', {type, text});
  }
}
</script>