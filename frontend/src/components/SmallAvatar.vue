<template>
  <router-link :to="'/Profile/' + id">
    <img v-if="photoUploaded" :src="photoPath" :class="{'avatar-small': !xs, 'avatar-xs': xs}"/>
    <div v-else class="avatar-small">
      <div>^</div>
      <div>^</div>
    </div>
  </router-link>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';

@Component
export default class User extends Vue {
  @Prop(Boolean) private photoUploaded!: boolean;
  @Prop(Number) private id!: number;
  @Prop(Boolean) private xs?: boolean;

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

.avatar-xs {
  border: 2px solid #0098DA;
  border-radius: 5px;
  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  text-align: center;
  width: 50px;
  height: 50px;
}
</style>
