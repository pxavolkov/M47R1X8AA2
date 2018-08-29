<template>
  <div class="message-item">
    <div class="avatar-col">
      <SmallAvatar :id="message.fromUserId" :photoUploaded="user.photoUploaded"/>
    </div>
    <div class="message-col">
      <span class="green">{{ user.firstName }} {{ user.lastName }}</span>
      <span class="float-right">{{ formattedDate }}</span>
      <div class="text-white" v-html="formattedMessage"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import SmallAvatar from '@/components/SmallAvatar.vue';
import escape from 'escape-html';

@Component({components: {SmallAvatar}})
export default class MessageItem extends Vue {
  @Prop() private message!: any;
  @Prop() private user!: any;

  get formattedDate(): string {
    const d = new Date(this.message.date);
    return (`${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.` +
      `${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}: ${d.getMinutes().toString().padStart(2, '0')}`);
  }

  get formattedMessage(): string {
    return escape(this.message.text).replace(/(?:\r\n|\r|\n)/g, '<br/>');
  }
}
</script>

<style lang="scss">
.message-item {
  border-bottom: 1px dashed #0098DA;
  padding: 0.25rem 0;
  display: flex;
}

.avatar-col {
  max-width: 117px;
}

.message-col {
  padding-left: 10px;
  width: 100%;
  word-wrap: break-word;
  overflow-x: hidden;
}
</style>