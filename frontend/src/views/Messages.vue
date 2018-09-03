<template>
  <div class="blue messages">
    <div class="message-container">
      <MessageItem v-for="(item, i) in messages" :key="i" :message="item" :user="users[item.fromUserId]"/>
    </div>
    <b-form-input v-if="false" v-model="text1" class="my-1" type="text" placeholder="Введите сообщение"></b-form-input>
    <b-form-textarea v-if="false" v-model="text" class="my-1" placeholder="Введите сообщение" :rows="1" :max-rows="6" style="resize: none;"></b-form-textarea>
    <b-input-group class="my-1 message-input">
      <textarea v-model="text" class="form-control" placeholder="Введите сообщение" :rows="rows" style="resize: none;" @keyup.enter.prevent="onEnter"></textarea>
      <b-btn slot="append" variant="primary" @click="sendMessage()" :disabled="sending">Отправить</b-btn>
    </b-input-group>
    <div class="text-center">
      <router-link to="/Profile" >Вернуться в профиль</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { Message } from 'shared/responses';
import { SendMessage } from 'shared/requests';
import MessageItem from '@/components/MessageItem.vue';
import { Users } from '@/store/types';
import socket from '@/socket';

const namespace: string = 'message';
const maxRows = 6;

@Component({components: {MessageItem}})
export default class Messages extends Vue { // TODO
  @Prop(String) private userId!: string;
  @State((state) => state.message.users) private users!: Users;
  @Action('sendMessage', { namespace }) private sendMessageAction!: (data: SendMessage) => Promise<void>;

  private text: string = '';
  private isLoaded: boolean = false;
  private sending: boolean = false;

  public created() {
    this.$store.dispatch(`${namespace}/loadDialog`, {userId: this.userId});
  }

  private async sendMessage() {
    this.sending = true;
    this.text.trim();
    await this.sendMessageAction({userId: parseInt(this.userId, 10), text: this.text});
    this.sending = false;
    this.text = '';
  }

  private onEnter(e: KeyboardEvent) {
    if (e.ctrlKey) this.appendNewline();
    else this.sendMessage();
    e.preventDefault();
    return false;
  }

  private appendNewline() {
    this.text += '\n';
  }

  private get messages() {
    return this.$store.state.message.messages[this.userId] || [];
  }

  private get rows() {
    return Math.min(this.text.split(/\r\n|\r|\n/).length, maxRows);
  }
}
</script>

<style lang="scss">
.messages {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
}

.message-input {
  flex: 1 0 auto;
}

.message-container {
  height: 100%;
  overflow-y: scroll;
}
</style>
