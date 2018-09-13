<template>
  <div v-if="isLoaded">
    <h2 class="green text-center">Регистрации</h2>
    <b-button to="/Master/News" class="mb-2">Новости</b-button><br>
    <h5 class="green">Действия с выбранными пользователями ({{ selectedUsers.length }}):</h5>
    <b-button variant="primary" class="mb-2" :disabled="selectedUsers.length === 0" v-b-modal.sendMessageModal>Отправить сообщение</b-button>

    <b-modal id="balanceEditModal" class="defaultModal" size="sm" hide-header ok-title="Изменить" cancel-title="Отмена" @hidden="balanceEditError = ''" @ok="balanceEditSubmit">
      <span>Имя: <span class="green">{{ balanceEditUserName }}</span></span><br/>
      <b-form-group
        horizontal
        :label-cols="3"
        label="Баланс: "
        label-for="inputAmount">
        <b-form-input size="sm" id="inputAmount" v-model="balanceEdit.balance"></b-form-input>
      </b-form-group>
    </b-modal>

    <b-modal id="sendMessageModal" class="defaultModal" size="sm" hide-header ok-title="Отправить" cancel-title="Отмена" @ok="sendMessageSubmit">
      <span>Имена: <span class="green">{{ selectedPlayerNames }}</span></span><br/>
      <b-form-textarea v-model="messageText" placeholder="Введите сообщение" :rows="3" :max-rows="9" style="resize: none;"></b-form-textarea>
    </b-modal>

    <b-table id="master-users" class="lightGreen" bordered hover :items="users" :fields="fields">
      <template slot="HEAD_checkbox" slot-scope="data">
        <b-form-checkbox @click.native.stop v-model="allUsersSelected" class="no-label"></b-form-checkbox>
      </template>
      <template slot="checkbox" slot-scope="data">
        <b-form-checkbox v-model="selectedUsers" :value="data.index" class="no-label"></b-form-checkbox>
      </template>
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
      <template slot="balance" slot-scope="data">
        {{ data.item.profile.balance }} <b-button size="sm" variant="primary" v-b-modal.balanceEditModal @click="setBalanceEdit(data.item)">Изменить</b-button>
      </template>
      <template slot="quenta" slot-scope="data">
        <a v-if="data.item.profile.quentaPath" :href="`/api/quenta/${data.item.id}/${data.item.profile.quentaPath}`" download>Скачать</a>
        <div v-else>
          Нет
          <label class="btn btn-primary btn-sm" :for="'inputQuenta' + data.item.id">
            <input :ref="'inputQuenta' + data.item.id" :id="'inputQuenta' + data.item.id" type="file" style="display: none;" @change="fileUpload(data.item.id)">
            Загрузить
          </label>
        </div>
      </template>
      <template slot="actions" slot-scope="data">
        <b-button v-if="data.item.profile.isCitizen" size="sm" variant="danger" @click="setCitizen(data.item.id, false)">Выключить</b-button>
        <b-button v-else size="sm" variant="success" @click="setCitizen(data.item.id, true)">Включить</b-button>
        <br>
        <b-button class="mt-1" size="sm" variant="primary" :to="'Inventory/' + data.item.id">Инвентарь</b-button>
        <br>
        <b-button class="mt-1" size="sm" variant="primary" :to="'/Messages/' + data.item.id">Сообщения</b-button>
      </template>
      <template slot="donate" slot-scope="data">
        <b-button v-if="data.item.profile.donated" size="sm" variant="danger" @click="setDonated(data.item.id, false)">Не оплатил</b-button>
        <b-button v-else size="sm" variant="success" @click="setDonated(data.item.id, true)">Оплатил</b-button>
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Getter, Action } from 'vuex-class';
import { Sex } from 'shared/enums';
import { User, SetBalance, SendMultiMessage } from 'shared/master';
import utils from '@/utils';

const namespace: string = 'master';

@Component
export default class MasterUsers extends Vue {
  @State((state) => state.master.users) private users!: User[];
  @Getter('isUsersLoaded', { namespace }) private isLoaded!: boolean;
  @Action('setBalance', { namespace }) private setBalanceAction!: (data: {data: SetBalance}) => Promise<void>;
  @Action('uploadQuenta', { namespace }) private uploadQuentaAction!: (data: {data: FormData}) => Promise<void>;
  @Action('sendMultiMessage', { namespace })
  private sendMultiMessageAction!: (data: {data: SendMultiMessage}) => Promise<void>;

  private balanceEdit = {
    userId: 0,
    balance: 0,
  };
  private balanceEditUserName = '';
  private selectedUsers: string[] = [];
  private messageText: string = '';

  public beforeCreate() {
    this.$store.dispatch(`${namespace}/users`);
  }

  private get fields() {
    return [
      {key: 'checkbox', label: ''},
      {key: 'playerName', label: 'Имя (возраст)'},
      {key: 'email', label: 'Email'},
      {key: 'registrationDate', label: 'Дата регистрации', formatter: this.dateFormatter},
      {key: 'info', label: 'Контакт'},
      {key: 'allergy', label: 'Аллергии'},
      {key: 'profile', label: 'Персонаж'},
      {key: 'balance', label: 'Баланс'},
      {key: 'quenta', label: 'Квента'},
      {key: 'actions', label: ''},
      {key: 'donate', label: 'Взнос'},
    ];
  }

  private get Sex() {
    return Sex;
  }

  private get allUsersSelected() {
    return this.selectedUsers.length === this.users.length;
  }

  private set allUsersSelected(value: boolean) {
    if (value === this.allUsersSelected) return;
    if (value) this.selectedUsers = Object.keys(this.users);
    else this.selectedUsers = [];
  }

  private get selectedPlayerNames() {
    return this.selectedUsers.map((i) => this.users[i as any].playerName).join(', ');
  }

  private get selectedUserIds() {
    return this.selectedUsers.map((i) => this.users[i as any].id);
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

  private setDonated(userId: number, donated: boolean) {
    this.$store.dispatch(`${namespace}/setDonated`, {data: {userId, donated}});
  }

  private showAlert(type: string, text: string) {
    this.$store.commit('alert/show', {type, text});
  }

  private setBalanceEdit(user: User) {
    this.balanceEdit.userId = user.id;
    this.balanceEdit.balance = user.profile.balance;
    this.balanceEditUserName = user.profile.firstName + ' ' + user.profile.lastName;
  }

  private async balanceEditSubmit() {
    this.setBalanceAction({data: this.balanceEdit})
      .then()
      .catch((err: any) => {
        this.showAlert('danger', `Ошибка при изменении баланса (${err.response.status})`);
      });
  }

  private async sendMessageSubmit() {
    this.sendMultiMessageAction({data: {userIds: this.selectedUserIds, text: this.messageText}})
      .then()
      .catch((err: any) => {
        this.showAlert('danger', `Ошибка при отправке сообщения (${err.response.status})`);
      });
  }

  private async fileUpload(id: number) {
    const files = (this.$refs['inputQuenta' + id] as HTMLInputElement).files;
    if (!files || !files[0]) return;

    const data = new FormData();
    data.append('quenta', files[0]);
    data.append('userId', id.toString());
    this.uploadQuentaAction({data})
      .then()
      .catch((err: any) => {
        this.showAlert('danger', `Ошибка при загрузке квенты (${err.response.status})`);
      });
  }
}
</script>

<style lang="scss">
#master-users th {
  font-weight: normal;
  color: aqua;
}

.custom-control-inline.no-label {
  margin: 0;
}
</style>
