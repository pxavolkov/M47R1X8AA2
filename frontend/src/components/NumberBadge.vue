<template>
  <div v-if="value > 0" class="my-badge yellow">{{ value }}</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class NumberBadge extends Vue {
  @Prop() private value!: number;
}
</script>

<style lang="scss">
.my-badge {
  background: #008DD5;
  width: 35px;
  height: 35px;
  border-radius: 18px;
  display: inline-flex;
  position: absolute;
  font-size: 1.5rem;
  padding-left: 3px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
</style>
