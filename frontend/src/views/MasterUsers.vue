<template>
  <div v-if="isLoaded">
    <h2 class="green text-center">Регистрации</h2>
    <b-button to="/Master/News" class="mb-2">Новости</b-button>
    <b-table id="master-users" class="lightGreen" bordered hover :items="users" :fields="fields">
      <template slot="playerName" slot-scope="data">
        {{ data.value }} ({{ data.item.playerAge }})
      </template>
      <template slot="email" slot-scope="data">
        <a :href="'mailto:' + data.value">{{ data.value }}</a>
      </template>
      <template slot="info" slot-scope="data">
        <a v-if="isUrl(data.value)" :href="data.value">{{ data.value }}</a>
        <span v-else>{{ data.value }}</span>
      </template>
      <template slot="profile" slot-scope="data">
        Имя: {{ data.value.firstName }} {{ data.value.lastName }} (возраст: {{ data.value.age }}). Пол: {{ data.value.sex === Sex.MALE ? 'М' : 'Ж' }}
      </template>
      <template slot="quenta" slot-scope="data">
        <a v-if="data.item.profile.quentaPath" :href="`/api/quenta/${data.item.id}/${data.item.profile.quentaPath}`" download>Скачать</a>
        <span v-else>Нет</span>
      </template>
      <template slot="actions" slot-scope="data">
        <b-button v-if="data.item.profile.isCitizen" size="sm" variant="danger" @click="setCitizen(data.item.id, false)">Выключить</b-button>
        <b-button v-else size="sm" variant="success" @click="setCitizen(data.item.id, true)">Включить</b-button>
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Getter } from 'vuex-class';
import { Sex } from 'shared/enums';
import utils from '@/utils';

const namespace: string = 'master';

@Component
export default class MasterUsers extends Vue {
  @State((state) => state.master.users) private users!: any[];
  @Getter('isUsersLoaded', { namespace }) private isLoaded!: boolean;

  public beforeCreate() {
    this.$store.dispatch(`${namespace}/users`);
  }

  private get fields() {
    return [
      {key: 'playerName', label: 'Имя (возраст)'},
      {key: 'email', label: 'Email'},
      {key: 'registrationDate', label: 'Дата регистрации', formatter: this.dateFormatter},
      {key: 'info', label: 'Контакт'},
      {key: 'allergy', label: 'Аллергии'},
      {key: 'profile', label: 'Персонаж'},
      {key: 'quenta', label: 'Квента'},
      {key: 'actions', label: ''},
    ];
  }

  private get Sex() {
    return Sex;
  }

  private dateFormatter(date: string): string {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}` +
      `/${d.getFullYear()}`;
  }

  private isUrl(str: string): boolean {
    return utils.urlRegex.test(str);
  }

  private setCitizen(userId: number, isCitizen: boolean) {
    this.$store.dispatch(`${namespace}/setCitizen`, {data: {userId, isCitizen}});
  }
}
</script>

<style lang="scss">
#master-users th {
  font-weight: normal;
  color: aqua;
}
</style>
