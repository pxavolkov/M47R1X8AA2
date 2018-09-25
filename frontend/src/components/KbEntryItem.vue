<template>
  <div class="kbentry-item blueBorderButton">
    <span class="fontsize150" v-if="data.needPassword" v-b-tooltip.hover title="Нужен пароль">🔒 </span>
    <span class="fontsize150" :class="{'text-danger': !data.hasAccess}" v-b-tooltip.hover="!data.hasAccess" :title="data.hasAccess ? '' : 'Нет доступа'">{{ data.key }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class KbEntryItem extends Vue {
  @Prop() private data!: any;
}
</script>

<style lang="scss">
.kbentry-item {
  padding-top: 2px;
  padding-left: 10px;
  margin-bottom: 5px;
}
</style>