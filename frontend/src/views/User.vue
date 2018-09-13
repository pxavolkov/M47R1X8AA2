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

          <TransferItem :userName="transfer.username" :userId="transfer.userId"/>

          <TransferMoney :userName="transfer.username" :userId="transfer.userId"/>

          <b-row v-for="(item, i) in filteredList" :key="i" style="border-top: 1px dashed #0098DA; display: flex; align-items: center;">
            <b-col cols="3">
              <SmallAvatar :id="item.id" :photoUploaded="item.photoUploaded"/>
            </b-col>
            <b-col cols="3" class="pb-2">
              <div class="green">{{ item.firstName }}</div>
              <div class="green">{{ item.lastName }}</div>
              <button tag="button" class="btn img-button p-0" @click="showMailAlert">
                <img title="Отправить сообщение" src="@/assets/img/mail.png"/>
                <NumberBadge class="messagesCount" :value="item.unreadMessages"/>
              </button>
            </b-col>
            <b-col cols="3" style="align-self: flex-end;">
              <button class="btn img-button" v-b-modal.transferItemModal @click="setTransfer(item)">
                <img title="Передать предметы" src="@/assets/img/senditem.png"/>
              </button>
            </b-col>
            <b-col cols="3" style="align-self: flex-end;">
              <button class="btn img-button" v-b-modal.transferMoneyModal @click="setTransfer(item)">
                <img title="Перевести кредиты" src="@/assets/img/sendmoney.png"/>
              </button>
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
import { PublicProfile, InventoryItem } from 'shared/responses';
import axios from 'axios';
import SmallAvatar from '@/components/SmallAvatar.vue';
import NumberBadge from '@/components/NumberBadge.vue';
import TransferMoney from '@/components/TransferMoney.vue';
import TransferItem from '@/components/TransferItem.vue';

const namespace: string = 'profile';

@Component({components: {SmallAvatar, NumberBadge, TransferMoney, TransferItem}})
export default class User extends Vue {
  @State((state) => state.profile.list) private list!: PublicProfile[];
  @Getter('isListLoaded', { namespace }) private isLoaded!: boolean;

  private transfer = {
    userId: -1,
    username: '',
  };
  private search = '';

  public beforeCreate() {
    this.$store.dispatch(`${namespace}/list`);
    this.$store.dispatch(`inventory/load`);
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

  private showAlert(type: string, text: string) {
    this.$store.commit('alert/show', {type, text});
  }

  private showMailAlert() {
    this.showAlert('warning', 'Сообщения отключены системой защиты');
  }

  private setTransfer(profile: PublicProfile) {
    this.transfer.userId = profile.id;
    this.transfer.username = profile.firstName + ' ' + profile.lastName;
  }
}
</script>

<style lang="scss">
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

.messagesCount {
  position: relative;
  right: 23px;
  top: -8px;
}
</style>
