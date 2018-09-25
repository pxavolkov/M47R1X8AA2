<template>
  <div class="blue">
    <h3 class="yellow text-center">Сервера</h3>
    <div class="green text-center">всего: {{ servers.length }}</div>

    <ServerPasswordModal @enter="enterPassword"/>

    <div class="text-center mb-1">
      <img src="@/assets/img/search.png" style="height: 15px;"/>
      <input v-model="search" @keyup.enter="findServer" class="green" style="background: transparent; border: none; width: 250px" type="text" placeholder="введите название сервера" />
      <b-btn class="ml-1" size="sm" variant="outline-primary" @click="findServer">ОК</b-btn>
    </div>
    <template v-if="isServersLoaded">
      <KbServerItem v-if="server.id > -1 && servers.length === 0" :data="server" @click.native="serverClick(-1)"/>
      <KbServerItem v-else-if="servers.length > 0" v-for="(item, i) in servers" :key="i" :data="item" @click.native="serverClick(i)"/>
      <h3 v-else class="text-danger text-center">Сервера не найдены</h3>
    </template>
    <div class="text-center">
      <router-link to="/Profile">Вернуться в профиль</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State, Getter, Mutation } from 'vuex-class';
import KbServerItem from '@/components/KbServerItem.vue';
import ServerPasswordModal from '@/components/ServerPasswordModal.vue';
import { KbServer } from 'shared/responses';
import { LoadServer } from 'shared/requests';
import { KbStateServer } from '@/store/types';

const namespace: string = 'kb';

@Component({components: {KbServerItem, ServerPasswordModal}})
export default class KbServers extends Vue {
  @State((state) => state.kb.servers) private servers!: KbServer[];
  @State((state) => state.kb.server) private server!: KbStateServer;
  @Getter('isServersLoaded', { namespace }) private isServersLoaded!: boolean;
  @Mutation('setServer', { namespace }) private setServerMutation!: (data: KbStateServer) => void;
  @Mutation('clearServers', { namespace }) private clearServersMutation!: () => void;
  private search: string = '';

  public beforeCreate() {
    this.$store.dispatch(`${namespace}/loadServers`).catch((err) => {
      if (err.response.status === 500) {
        this.showAlert('danger', 'Ошибка при загрузке серверов. Обратитесь к администрации');
      } else if (err.response.status !== 401) {
        this.showAlert('danger', `Ошибка при загрузке серверов (${err.response.status})`);
      }
    });
  }

  private showAlert(type: string, text: string) {
    this.$store.commit('alert/show', {type, text});
  }

  private serverClick(i: number) {
    const server = i === -1 ? this.server : this.servers[i];
    if (!server.hasAccess) this.showAlert('danger', 'У вас нет доступа к этому серверу');
    else {
      this.setServerMutation({
        id: server.id,
        name: server.name,
        description: server.description,
        password: this.server.password || '',
      });
      if (server.needPassword) this.passwordModal();
      else this.$router.push(`/Kb/${server.id}`);
    }
  }

  private passwordModal() {
    this.$root.$emit('bv::show::modal', 'serverPasswordModal');
  }

  private async enterPassword() {
    try {
      const data = await this.$store.dispatch(`${namespace}/loadServer`, {data: {
        serverId: this.server.id,
        serverPassword: this.server.password,
      }});
      if (data.data.correctPassword) this.$router.push(`/Kb/${this.server.id}`);
      else this.showAlert('danger', 'Неверный пароль');
    } catch (err) {
      if (err.response.status === 500) {
        this.showAlert('danger', 'Ошибка при загрузке сервера. Обратитесь к администрации');
      } else if (err.response.status !== 401) {
        this.showAlert('danger', `Ошибка при загрузке сервера (${err.response.status})`);
      }
    }
  }

  private async findServer() {
    try {
      await this.$store.dispatch(`${namespace}/loadServer`, {data: {serverName: this.search}});
      this.clearServersMutation();
    } catch (err) {
      if (err.response.status === 500) {
        this.showAlert('danger', 'Ошибка при поиске сервера. Обратитесь к администрации');
      } else if (err.response.status === 404) this.showAlert('danger', 'Сервер не найден');
      else if (err.response.status !== 401) {
        this.showAlert('danger', `Ошибка при поиске сервера (${err.response.status})`);
      }
    }
  }
}
</script>
