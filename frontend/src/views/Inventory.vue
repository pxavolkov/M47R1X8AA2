<template>
  <div class="blue">
    <h3 class="yellow text-center">
      Инвентарь
      <b-button v-if="isMaster" size="sm" v-b-modal.giveItemModal>Выдать предмет</b-button>
    </h3>

    <div class="inventory-container">
      <b-modal v-if="isMaster" id="giveItemModal" size="sm" hide-header ok-variant="success" ok-title="Выдать предмет" cancel-title="Отмена" @ok="giveItem()">
        <b-form-group label="Предмет:" label-for="inputGiveItemId">
          <b-form-select id="inputGiveItemId" v-model="selectedGiveItemId" :options="giveItemOptions" class="mb-3" />
        </b-form-group>
        <b-form-group label="Количество:" label-for="inputGiveItemAmount">
          <b-form-input id="inputGiveItemAmount" v-model.number="giveItemAmount"></b-form-input>
        </b-form-group>
      </b-modal>
      <b-modal id="itemModal" class="defaultModal" :title="itemModal.title" hide-footer>
        <center><img class="item-icon" v-if="itemModal.itemId > -1" :src="getItemIcon(itemModal.itemId)"></center>
        <h3 class="yellow">Описание</h3>
        <p v-html="itemModal.shortDesc"></p>
        <h3 class="yellow">Характеристики</h3>
        <p v-html="itemModal.longDesc"></p>
      </b-modal>
      <div v-for="(item, i) in inventory" :key="i" class="inventory-item blueBorderButton hoverlight" v-b-modal.itemModal @click="showItem(i)">
        <div class="icon-container">
          <img class="item-icon" :src="getItemIcon(item.itemId)">
        </div>
        <div class="item-bottom">
          <span class="item-title green">
            {{ item.item.title }}
          </span>
          <span v-if="item.amount > 1 || isMaster" class="item-amount">
            <b-button v-if="isMaster" size="xs" @click.stop="decItemAmount(item.itemId)">-</b-button>
            (x{{ item.amount }})
            <b-button v-if="isMaster" size="xs" @click.stop="incItemAmount(item.itemId)">+</b-button>
            &nbsp;
          </span>
        </div>
      </div>
    </div>
    <div class="text-center">
      <router-link to="/Profile" >Вернуться в профиль</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { InventoryItem, Item } from 'shared/responses';
import { InventoryItemData } from 'shared/master';
import utils from '@/utils';

const namespace: string = 'inventory';

@Component
export default class Inventory extends Vue {
  @Prop(String) private id!: string;
  @State((state) => state.inventory.items) private userInventory!: InventoryItem[];
  @State((state) => state.master.inventory) private masterInventory!: InventoryItem[];
  @Action('payRequired', { namespace: 'alert' }) private payRequired!: () => Promise<void>;
  @Action('giveItem', { namespace: 'master' })
  private giveItemAction!: (data: {data: InventoryItemData}) => Promise<void>;
  @Action('takeItem', { namespace: 'master' })
  private takeItemAction!: (data: {data: InventoryItemData}) => Promise<void>;
  private selectedItem = -1;
  private selectedGiveItemId = -1;
  private giveItemAmount = 1;

  public created() {
    if (this.isMaster) {
      this.$store.dispatch(`master/loadInventory`, {params: {userId: this.userId}}).catch((err) => {
        if (err.response.status === 500) {
          this.showAlert('danger', 'Ошибка при загрузке инвентаря. Обратитесь к администрации');
        } else if (err.response.status !== 401) {
          this.showAlert('danger', `Ошибка при загрузке инвентаря (${err.response.status})`);
        }
      });
      this.$store.dispatch(`master/items`);
    } else {
      this.$store.dispatch(`${namespace}/load`).catch((err) => {
        if (err.response.status === 500) {
          this.showAlert('danger', 'Ошибка при загрузке инвентаря. Обратитесь к администрации');
        } else if (err.response.status === 403) this.payRequired();
        else if (err.response.status !== 401) {
          this.showAlert('danger', `Ошибка при загрузке инвентаря (${err.response.status})`);
        }
      });
    }
  }

  private showAlert(type: string, text: string) {
    this.$store.commit('alert/show', {type, text});
  }

  private getItemIcon(id: number) {
    return utils.getItemIcon(id);
  }

  private showItem(id: number) {
    this.selectedItem = id;
  }

  private incItemAmount(itemId: number) {
    this.giveItemAction({data: {userId: this.userId, itemId, amount: 1}});
  }

  private decItemAmount(itemId: number) {
    this.takeItemAction({data: {userId: this.userId, itemId, amount: 1}});
  }

  private giveItem() {
    this.giveItemAction({data: {userId: this.userId, itemId: this.selectedGiveItemId, amount: this.giveItemAmount}});
  }

  private get itemModal() {
    return this.inventory[this.selectedItem] ? {
      itemId: this.inventory[this.selectedItem].itemId,
      title: this.inventory[this.selectedItem].item.title,
      shortDesc: utils.nl2br(this.inventory[this.selectedItem].item.shortDesc),
      longDesc: utils.nl2br(this.inventory[this.selectedItem].item.longDesc),
    } : {
      itemId: -1,
      title: '',
      shortDesc: '',
      longDesc: '',
    };
  }

  private get userId() {
    return parseInt(this.id, 10);
  }

  private get isMaster() {
    return this.userId > -1;
  }

  private get inventory() {
    return this.isMaster ? this.masterInventory : this.userInventory;
  }

  private get giveItemOptions() {
    if (!this.isMaster) return [];

    return this.$store.state.master.items.map((v: Item) => ({value: v.id, text: `${v.id}. ${v.title}`}));
  }
}
</script>

<style lang="scss">
.inventory-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.inventory-item {
  width: 204px;
  min-height: 230px;
  background-color: rgba(5, 50, 70, 0.7);
  text-align: center;
  margin: 10px;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .icon-container {
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

img.item-icon {
  max-width: 200px;
  max-height: 200px;
}

.item-amount {
  float: right;
  color: white;
  justify-self: end;
}

.item-title {
  flex: 1;
}

.item-bottom {
  flex: 1;
  display: flex;
  align-items: center;
}

.btn-xs {
  padding: 0 0.1rem !important;
  font-size: 0.875rem !important;
  line-height: 1.5 !important;
  border-radius: 0.2rem !important;
}
</style>
