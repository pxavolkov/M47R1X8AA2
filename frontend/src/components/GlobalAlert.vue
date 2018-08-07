<template>
  <b-modal ref="alertModal" id="alertModal" hide-header hide-footer v-model="show">
    <b-alert :variant="type" show>{{ text }}</b-alert>
  </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';

const namespace: string = 'profile';

@Component
export default class GlobalAlert extends Vue {
  @State((state) => state.alert.type) private type!: string;
  @State((state) => state.alert.text) private text!: string;

  get show() {
    return this.$store.state.alert.show;
  }

  set show(val) {
    if (!val) this.$store.commit('alert/hide');
  }
}
</script>

<style lang="scss">
#alertModal .modal-body {
  padding: 0;
  .alert {
    margin: 0;
  }
}
</style>
