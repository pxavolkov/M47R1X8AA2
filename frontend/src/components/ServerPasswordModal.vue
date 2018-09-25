<template>
  <b-modal id="serverPasswordModal" class="defaultModal" size="sm" header-text-variant="green" :title="server.name" ok-title="Ок" cancel-title="Отмена" @ok="enterPassword">
    <b-form-group
      class="m-0"
      horizontal
      :label-cols="3"
      label="Пароль: "
      label-for="inputPassword">
      <b-form-input size="sm" id="inputPassword" v-model="password"></b-form-input>
    </b-form-group>
  </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide } from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class';
import { KbStateServer } from '@/store/types';

const namespace = 'kb';

@Component
export default class ServerPasswordModal extends Vue {
  @State((state) => state.kb.server) private server!: KbStateServer;
  @Mutation('setServerPassword', { namespace }) private setServerPasswordMutation!: (password: string) => void;
  private password: string = '';

  private async enterPassword() {
    this.setServerPasswordMutation(this.password);
    this.$emit('enter');
  }
}
</script>