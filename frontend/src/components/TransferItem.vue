<template>
  <b-modal id="transferItemModal" class="defaultModal" size="sm" hide-header ok-title="Передать" cancel-title="Отмена" @ok="submit">
    <span>Имя: <span class="green">{{ userName }}</span></span><br/>
    <b-form-group
      label="Предмет: "
      label-for="inputItem">
      <b-form-select size="sm" v-model="itemId" :options="itemOptions"/>
    </b-form-group>
    <b-form-group
      label="Количество: "
      label-for="inputAmount">
      <b-form-input size="sm" id="inputAmount" v-model.number="amount"></b-form-input>
    </b-form-group>
  </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { TransferItem } from 'shared/requests';
import { InventoryItem } from 'shared/responses';

@Component
export default class User extends Vue {
  @Prop(String) private userName!: string;
  @Prop(Number) private userId!: number;
  @State((state) => state.inventory.items) private inventory!: InventoryItem[];
  @Action('transfer', {namespace: 'inventory'}) private transferAction!: (data: {data: TransferItem}) => Promise<void>;
  private amount: number = 1;
  private itemId: number = -1;

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
      itemId: this.itemId,
      amount: this.amount,
    }})
      .then(() => this.showAlert('success', 'Предмет успешно передан'))
      .catch((err) => {
        if (err.response.status === 500) {
          this.showAlert('danger', 'Ошибка при передаче предмета. Обратитесь к администрации');
        } else if (err.response.status === 400) {
          this.showAlert(
            'danger',
            'Ошибка при передаче предмета. У вас уже нет такого предмета, либо указано неверное количество',
          );
        } else this.showAlert('danger', `Ошибка при передаче предмета (${err.response.status})`);
      });
  }

  private get itemOptions() {
    return this.inventory.map((v) => ({value: v.itemId, text: `${v.item.title} (x${v.amount})`}));
  }
}
</script>

<style lang="scss">

</style>
