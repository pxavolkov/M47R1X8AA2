<template>
  <b-modal id="transferMoneyModal" size="sm" hide-header ok-title="Перевести" cancel-title="Отмена" @ok="submit">
    <span>Имя: <span class="green">{{ userName }}</span></span><br/>
    <b-form-group
      horizontal
      :label-cols="3"
      label="Сумма: "
      label-for="inputAmount">
      <b-form-input size="sm" id="inputAmount" v-model.number="amount"></b-form-input>
    </b-form-group>
  </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { TransferMoney } from 'shared/requests';

@Component
export default class User extends Vue {
  @Prop(String) private userName!: string;
  @Prop(Number) private userId!: number;
  @Action('transfer', {namespace: 'profile'}) private transferAction!: (data: {data: TransferMoney}) => Promise<void>;
  private amount: number = 0;

  private showAlert(type: string, text: string) {
    this.$store.commit('alert/show', {type, text});
  }

  private showTransferSuccessAlert() {
    this.showAlert('success', 'Кредиты успешно перечислены');
  }

  private showTransferFailAlert() {
    this.showAlert('danger', 'Ошибка при переводе кредитов. Обратитесь к администрации');
  }

  private async submit() {
    this.transferAction({data: {
      userId: this.userId,
      amount: this.amount,
    }})
      .then(() => this.showAlert('success', 'Кредиты успешно перечислены'))
      .catch((err) => {
        if (err.response.status === 500) {
          this.showAlert('danger', 'Ошибка при переводе кредитов. Обратитесь к администрации');
        } else if (err.response.status === 403) {
          this.showAlert('danger', 'Недостаточно средств');
        } else if (err.response.status === 400) {
          this.showAlert('danger', 'Ошибка при переводе кредитов. Неверное количество');
        } else this.showAlert('danger', `Ошибка при переводе кредитов (${err.response.status})`);
      });
  }
}
</script>

<style lang="scss">
#transferMoneyModal .modal-content {
  background-color: #00212F;
  color: #fff;
}
</style>
