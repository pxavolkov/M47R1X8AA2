<template>
  <div class="blue">
    <h3 class="yellow text-center">Записи</h3>
    <h4 class="green text-center"><span v-if="server.needPassword && server.correctPassword">🔓 </span>{{ server.name }}</h4>
    <div class="green text-center">всего: {{ entries.length }}</div>

    <ServerPasswordModal @enter="enterServerPassword"/>

    <b-modal id="entryModal" ref="entryModal" class="defaultModal" :title="entry.key" header-text-variant="green" size="sm" hide-footer>
      <b-form-group
        v-if="entry.needPassword"
        horizontal
        :label-cols="3"
        label="Пароль: "
        label-for="inputPassword">
        <b-input-group size="sm">
          <b-form-input id="inputPassword" v-model="entryInput.password" :state="entry.correctPassword ? true : null" @keyup.native.enter="enterEntryPassword"></b-form-input>
          <b-input-group-append>
            <b-btn variant="primary" @click="enterEntryPassword">ОК</b-btn>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
      <b-form-group
        v-if="entry.encrypted"
        horizontal
        :label-cols="3"
        label="Ключ: "
        label-for="inputDecryptionKey">
        <b-input-group size="sm">
          <b-form-input id="inputDecryptionKey" v-model="entryInput.decryptionKey" @keyup.native.enter="enterDecryptionKey"></b-form-input>
          <b-input-group-append>
            <b-btn variant="primary" @click="enterDecryptionKey">ОК</b-btn>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
      <template v-if="entry.text">
        <h5 class="yellow">Текст<span v-if="entry.decrypted"> (расшифровано)</span></h5>
        <p>{{ entry.text }}</p>
      </template>
      <template v-if="entry.link">
        <h5 class="yellow">Ссылка<span v-if="entry.decrypted"> (расшифровано)</span></h5>
        <a :href="entry.link">{{ entry.link }}</a>
      </template>
    </b-modal>

    <div class="text-center mb-1">
      <img src="@/assets/img/search.png" style="height: 15px;"/>
      <input v-model="search" @keyup.enter="findEntry" class="green" style="background: transparent; border: none; width: 250px" type="text" placeholder="введите название записи"/>
      <b-btn class="ml-1" size="sm" variant="outline-primary" @click="findEntry">ОК</b-btn>
    </div>
    <template v-if="isEntriesLoaded">
      <KbEntryItem v-if="entry.id > -1 && entries.length === 0" :data="entry" @click.native="entryClick(-1)"/>
      <KbEntryItem v-else-if="entries.length > 0" v-for="(item, i) in entries" :key="i" :data="item" @click.native="entryClick(i)"/>
      <h3 v-else class="text-danger text-center">Записи не найдены</h3>
    </template>
    <div class="text-center">
      <router-link to="/Kb">Вернуться к списку серверов</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Getter, Mutation } from 'vuex-class';
import KbEntryItem from '@/components/KbEntryItem.vue';
import ServerPasswordModal from '@/components/ServerPasswordModal.vue';
import { KbEntry, KbServer } from 'shared/responses';
import { KbStateServer } from '@/store/types';

const namespace: string = 'kb';

@Component({components: {KbEntryItem, ServerPasswordModal}})
export default class KbEntries extends Vue {
  @Prop(String) private id!: string;
  @State((state) => state.kb.entries) private entries!: KbEntry[];
  @State((state) => state.kb.server) private server!: KbStateServer;
  @State((state) => state.kb.entry) private entry!: KbEntry;
  @Getter('isEntriesLoaded', { namespace }) private isEntriesLoaded!: boolean;
  @Mutation('setServer', { namespace }) private setServerMutation!: (data: KbStateServer) => void;
  @Mutation('setEntry', { namespace }) private setEntryMutation!: (data: KbEntry) => void;
  @Mutation('clearEntries', { namespace }) private clearEntriesMutation!: () => void;
  private search: string = '';
  private entryInput = {
    password: '',
    decryptionKey: '',
  };

  private get serverId() {
    return parseInt(this.id, 10);
  }

  public created() {
    if (this.serverId !== this.server.id) {
      this.setServerMutation({
        id: this.serverId,
        name: '',
        description: '',
        password: null,
      });
    }
    this.loadEntries();
  }

  private loadEntries() {
    this.$store.dispatch(`${namespace}/loadEntries`, {data: {
      serverId: this.server.id,
      serverName: this.server.name,
      serverPassword: this.server.password || null,
    }}).catch((err) => {
      if (err.response.status === 500) {
        this.showAlert('danger', 'Ошибка при загрузке записей. Обратитесь к администрации');
      } else if (err.response.status === 404) this.showAlert('danger', 'Сервер не найден');
      else if (err.response.status === 403) this.showAlert('danger', 'Нет доступа');
      else if (err.response.status === 400) this.$root.$emit('bv::show::modal', 'serverPasswordModal');
      else if (err.response.status !== 401) {
        this.showAlert('danger', `Ошибка при загрузке записей (${err.response.status})`);
      }
    });
  }

  private async loadEntry() {
    const passwordEntered = this.entryInput.password.length;
    try {
      const data = await this.$store.dispatch(`${namespace}/loadEntry`, {data: {
        id: this.entry.id,
        serverPassword: this.server.password || null,
        entryPassword: passwordEntered ? this.entryInput.password : null,
        decryptionKey: this.entryInput.decryptionKey.length ? this.entryInput.decryptionKey : null,
      }});
      if (passwordEntered && !data.data.correctPassword) this.showAlert('danger', 'Неверный пароль');
    } catch (err) {
      if (err.response.status === 500) {
        this.showAlert('danger', 'Ошибка при загрузке записи. Обратитесь к администрации');
      } else if (err.response.status === 404) this.showAlert('danger', 'Запись не найдена');
      else if (err.response.status === 403) this.showAlert('danger', 'Нет доступа');
      else if (err.response.status === 400) this.showAlert('danger', 'Неверный пароль');
      else if (err.response.status !== 401) {
        this.showAlert('danger', `Ошибка при загрузке записей (${err.response.status})`);
      }
      throw err;
    }
  }

  private async findEntry() {
    try {
      await this.$store.dispatch(`${namespace}/loadEntry`, {data: {
        serverId: this.server.id,
        serverPassword: this.server.password || null,
        entryKey: this.search,
      }});
      this.clearEntriesMutation();
    } catch (err) {
      if (err.response.status === 500) {
        this.showAlert('danger', 'Ошибка при поиске записи. Обратитесь к администрации');
      } else if (err.response.status === 404) this.showAlert('danger', 'Запись не найдена');
      else if (err.response.status !== 401) {
        this.showAlert('danger', `Ошибка при поиске записи (${err.response.status})`);
      }
    }
  }

  private enterServerPassword() {
    this.loadEntries();
  }

  private enterEntryPassword() {
    this.loadEntry();
  }

  private enterDecryptionKey() {
    this.loadEntry();
  }

  private showAlert(type: string, text: string) {
    this.$store.commit('alert/show', {type, text});
  }

  private async entryClick(i: number) {
    const entry = i === -1 ? this.entry : this.entries[i];
    if (!entry.hasAccess) this.showAlert('danger', 'У вас нет доступа к этой записи');
    else {
      this.entryInput.password = '';
      this.entryInput.decryptionKey = '';
      this.setEntryMutation(entry);
      await this.loadEntry();
      (this.$refs.entryModal as any).show();
    }
  }
}
</script>
