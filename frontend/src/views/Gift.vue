<template>
  <div v-if="isActivated" class="text-center">
    <h2 class="almostWhite">Поздравляем!</h2>
    <h3 class="blue">Вы выиграли:</h3>
    <p class="blue" v-if="activated.creditsBonus"><span class="green">{{ activated.creditsBonus }}</span> кредитов</p>
    <p class="blue" v-if="activated.itemId"><span class="green">{{ activated.item.title }}</span> в количестве <span class="green">{{ activated.itemAmount }}шт</span></p>
    <p class="blue" v-if="activated.creditsBonus">Свойство <span class="green">{{ activated.property.name }}</span> со значением <span class="green">{{ activated.propertyValue }}</span></p>
  </div>
  <div v-else-if="isLoaded" class="text-center">
    <SmallAvatar :id="profile.id" :photoUploaded="profile.photoUploaded" :xs="true"/>&nbsp;
    <span class="green">{{ profile.firstName }} {{ profile.lastName }}</span><br><br>
    <div v-if="isCodeValid">
      <h3 class="blue">Вы действительно хотите активировать код?</h3>
      <b-button variant="success" size="lg" @click="activateCode">ДА!</b-button>
    </div>
    <h3 v-else class="blue">Исопльзованный код либо неправильный, <br>либо уже погашен.<br>Воспользуйтесь другим.</h3>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { ActivateCode } from 'shared/requests';
import { PublicProfile, ActivateResponse } from 'shared/responses';
import SmallAvatar from '@/components/SmallAvatar.vue';

const namespace: string = 'gift';

@Component({components: {SmallAvatar}})
export default class Gift extends Vue {
  @Prop(String) private code!: string;
  @State((state) => state.gift.gift ? state.gift.gift.profile : {}) private profile!: PublicProfile;
  @State((state) => state.gift.activated) private activated!: ActivateResponse;
  @Getter('isLoaded', { namespace }) private isLoaded!: boolean;
  @Getter('isCodeValid', { namespace }) private isCodeValid!: boolean;
  @Getter('isActivated', { namespace }) private isActivated!: boolean;
  @Action('activate', { namespace }) private activateCodeAction!: (data: {data: ActivateCode}) => Promise<void>;

  private async created() {
    this.$store.dispatch(`${namespace}/load`, {params: {code: this.code}});
  }

  private async activateCode() {
    try {
      await this.activateCodeAction({data: {userId: this.profile.id, code: this.code}});
    } catch (err) {
      this.showAlert('danger', `Ошибка активации кода (${err.response.status})`);
    }
  }

  private showAlert(type: string, text: string) {
    this.$store.commit('alert/show', {type, text});
  }
}
</script>
