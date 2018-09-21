<template>
  <b-button size="sm" :variant="switchVariant(value)" @click="switchValue">{{ title }}: {{ value ? 'выключить' : 'включить' }}</b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ProfileSwitch extends Vue {
  @Prop(String) private action!: string;
  @Prop(String) private property!: string;
  @Prop(Number) private userId!: number;
  @Prop(Boolean) private value!: boolean;
  @Prop(String) private title!: string;

  private switchValue() {
    const data: any = {};
    data.userId = this.userId;
    data[this.property] = !this.value;
    this.$store.dispatch(`master/${this.action}`, {data});
  }

  private switchVariant(value: boolean) {
    return value ? 'success' : 'danger';
  }
}
</script>