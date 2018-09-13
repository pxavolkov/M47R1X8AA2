<template>
  <img v-if="photoUploaded" :src="photoPath" class="avatar-small"/>
  <div v-else class="avatar-small">
    <div>^</div>
    <div>^</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';

@Component
export default class User extends Vue {
  @Prop(Boolean) private photoUploaded!: boolean;
  @Prop(Number) private id!: number;

  private get photoPath() {
    return '/api/photo/' + this.id + '.png';
  }
}
</script>

<style lang="scss">
.avatar-small {
  border: 2px solid #0098DA;
  border-radius: 10px;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  text-align: center;
  width: 87px;
  height: 87px;
}
</style>
