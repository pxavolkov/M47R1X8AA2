<template>
  <div class="kbserver-item blueBorderButton">
    <span class="fontsize150" v-if="data.needPassword" v-b-tooltip.hover title="Нужен пароль">🔒 </span>
    <span class="fontsize150" :class="{'text-danger': !data.hasAccess}" v-b-tooltip.hover="!data.hasAccess" :title="data.hasAccess ? '' : 'Нет доступа'">{{ data.name }}</span>
    <div ref="text" class="kbserver-description">{{ data.description }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class KbServerItem extends Vue {
  @Prop() private data!: any;
}
</script>

<style lang="scss">
.kbserver-item {
  padding: 5px;
  margin-bottom: 5px;
}
</style>