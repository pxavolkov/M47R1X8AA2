<template>
  <b-row v-if="isLoaded" class="blue">
    <b-col cols="0" sm="2"></b-col>
    <b-col cols="12" sm="8" class="p-0">
      <b-row>
        <b-col cols="12">
          <div class="green text-center">users online: {{ list.length }}</div>
          <div class="text-center">
            <img src="@/assets/img/search.png" style="height: 15px;"/>
            <input v-model="search" class="green" style="background: transparent; border: none; width: 250px" type="text" placeholder="введите имя пользователя" />
          </div>

          <b-modal id="transferModal" size="sm" hide-header ok-title="Перевести" cancel-title="Отмена" @hidden="transferError = ''" @ok="transferSubmit">
            <span>Имя: <span class="green">{{ transferUserName }}</span></span><br/>
            <b-form-group
              horizontal
              :label-cols="3"
              label="Сумма: "
              label-for="inputAmount">
              <b-form-input size="sm" id="inputAmount" v-model="transfer.amount"></b-form-input>
            </b-form-group>
          </b-modal>

          <b-modal ref="alertModal" id="alertModal" hide-header hide-footer>
            <b-alert :variant="alert.type" show>{{ alert.text }}</b-alert>
          </b-modal>

          <b-row v-for="(item, i) in filteredList" :key="i" style="border-top: 1px dashed #0098DA; display: flex; align-items: center;">
            <b-col cols="3">
              <img v-if="item.photoUploaded" :src="photoPath(item.id)" class="avatar-small"/>
              <div v-else class="avatar-small">
                <div>^</div>
                <div>^</div>
              </div>
            </b-col>
            <b-col cols="6" class="pb-2">
              <div class="green">{{ item.firstName }}</div>
              <div class="green">{{ item.lastName }}</div>
              <button class="btn img-button p-0" @click="showMailAlert">
                <img title="Отправить сообщение" src="@/assets/img/mail.png"/>
              </button>
            </b-col>
            <b-col cols="3" style="align-self: flex-end;">
              <button class="btn img-button" v-b-modal.transferModal @click="setTransfer(item)">
                <img title="Перевести кредиты" src="@/assets/img/sendmoney.png"/>
              </button>
            </b-col>
            <b-col cols="12">
              <transition name="fade-out">
                <b-alert v-if="alert.userId === item.id" :variant="alert.type" show dismissible>{{ alert.text }}</b-alert>
              </transition>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { PublicProfile } from 'shared/responses';
import axios from 'axios';

const namespace: string = 'profile';

@Component
export default class User extends Vue {
  @State((state) => state.profile.list) private list!: PublicProfile[];
  @Getter('isListLoaded', { namespace }) private isLoaded!: boolean;
  @Action('transfer', { namespace }) private transferAction!: ({}) => Promise<void>;

  private alert = {
    text: '',
    type: '',
  };
  private transfer = {
    userId: 0,
    amount: 100,
  };
  private transferUserName = '';
  private search = '';

  public beforeCreate() {
    this.$store.dispatch(`${namespace}/list`);
  }

  get filteredList(): PublicProfile[] {
    if (!this.search.length) return this.list;
    else {
      return this.list.filter(
      ({firstName, lastName}) => (firstName.toLowerCase().indexOf(this.search.toLowerCase()) > -1 ||
        lastName.toLowerCase().indexOf(this.search.toLowerCase()) > -1 ||
        `${firstName.toLowerCase()} ${lastName.toLowerCase()}`.indexOf(this.search.toLowerCase()) > -1));
    }
  }

  private photoPath(id: number) {
    return '/api/photo/' + id + '.png';
  }

  private showAlert(type: string, text: string) {
    this.$store.commit('alert/show', {type, text});
  }

  private showMailAlert() {
    this.showAlert('warning', 'Сообщения отключены системой защиты');
  }

  private showTransferSuccessAlert() {
    this.showAlert('success', 'Кредиты успешно перечислены');
  }

  private showTransferFailAlert() {
    this.showAlert('danger', 'Ошибка при переводе кредитов. Обратитесь к администрации');
  }

  private setTransfer(profile: PublicProfile) {
    this.transfer.userId = profile.id;
    this.transferUserName = profile.firstName + ' ' + profile.lastName;
  }

  private async transferSubmit() {
    this.transferAction({data: this.transfer})
      .then(() => this.showAlert('success', 'Кредиты успешно перечислены'))
      .catch((err) => {
        if (err.response.status === 500) {
          this.showAlert('danger', 'Ошибка при переводе кредитов. Обратитесь к администрации');
        } else if (err.response.status === 403) {
          this.showAlert('danger', 'Недостаточно средств');
        } else if (err.response.status === 400) {
          this.showAlert('danger', 'Ошибка при переводе кредитов. Неверное количество');
        } else this.showAlert('danger', `Ошибка при переводе кредитов (${err.response.status})`);
      });
  }
}
</script>

<style lang="scss">
#transferModal .modal-content {
  background-color: #00212F;
  color: #fff;
}

#alertModal .modal-body {
  padding: 0;
  .alert {
    margin: 0;
  }
}

.avatar-small {
  border: 2px solid #0098DA;
  border-radius: 10px;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  text-align: center;
  width: 87px;
  height: 87px;
}

.img-button {
  background: transparent;
  img {
    height: 42px;
  }
}

.fade-out-enter-active {
  transition: opacity 0.25s;
}
.fade-out-leave-active {
  transition: opacity 5s;
}
.fade-out-enter, .fade-out-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

button.close {
  font-family: initial;
}

.form-row div {
  display: flex;
  align-items: center;
}
</style>
