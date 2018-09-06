<template>
  <div v-if="isLoaded">
    <h2 class="green text-center">Предметы</h2>
    <b-button to="/Master/Register" class="mb-2">Регистрации</b-button><br>

    <b-button variant="primary" v-b-modal.editModal @click="setEdit()">Добавить предмет</b-button>
    <h3 class="green">Редактирование</h3>
    <b-modal id="editModal" size="lg" hide-header :ok-variant="edit.id === -1 ? 'success' : 'warning'" :ok-title="edit.id === -1 ? 'Добавить' : 'Изменить'" cancel-title="Отмена" @hidden="editError = ''" @ok="editSubmit">
      <span>ID: <span class="green">{{ edit.id }}</span></span><br/>
      <label class="btn btn-primary btn-sm" for="inputIcon">
        <input ref="inputIcon" id="inputIcon" type="file" style="display: none;">
        Загрузить иконку
      </label>
      <b-form-group
        label="Название:"
        label-for="inputTitle">
        <b-form-input size="sm" id="inputTitle" v-model="edit.title"></b-form-input>
      </b-form-group>
      <b-form-group
        label="Краткое описание:"
        label-for="inputShortDesc">
        <b-form-textarea id="inputShortDesc" v-model="edit.shortDesc"></b-form-textarea>
      </b-form-group>
      <b-form-group
        label="Характеристики:"
        label-for="inputLongDesc">
        <b-form-textarea id="inputLongDesc" v-model="edit.longDesc"></b-form-textarea>
      </b-form-group>
    </b-modal>

    <b-table id="master-items" class="lightGreen" bordered hover :items="items" :fields="fields">
      <template slot="icon" slot-scope="data">
        <img class="item-icon" :src="getIcon(data.item.id)">
      </template>
      <span slot="shortDesc" slot-scope="data" v-html="data.value"></span>
      <span slot="longDesc" slot-scope="data" v-html="data.value"></span>
      <template slot="actions" slot-scope="data">
        <b-button size="sm" variant="primary" v-b-modal.editModal @click="setEdit(data.item)">Изменить</b-button>
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Getter, Action } from 'vuex-class';
import utils from '@/utils';
import { Item } from 'shared/master';

const namespace: string = 'master';

const newItem = {
  id: -1,
  title: '',
  shortDesc: '',
  longDesc: '',
};

@Component
export default class MasterItems extends Vue {
  @State((state) => state.master.items) private items!: any[];
  @Getter('isItemsLoaded', { namespace }) private isLoaded!: boolean;
  @Action('updateItem', { namespace }) private updateItemAction!: (data: {data: FormData}) => Promise<void>;
  @Action('addItem', { namespace }) private addItemAction!: (data: {data: FormData}) => Promise<void>;

  private edit = {
    id: -1,
    title: '',
    shortDesc: '',
    longDesc: '',
  };

  public beforeCreate() {
    this.$store.dispatch(`${namespace}/items`);
  }

  private get fields() {
    return [
      {key: 'id', label: 'ID'},
      {key: 'icon', label: 'Иконка'},
      {key: 'title', label: 'Название'},
      {key: 'shortDesc', label: 'Краткое описание', formatter: utils.nl2br},
      {key: 'longDesc', label: 'Характеристики', formatter: utils.nl2br},
      {key: 'actions', label: ''},
    ];
  }

  private setEdit(item?: Item) {
    if (!item) Object.assign(this.edit, newItem);
    else {
      this.edit.id = item.id;
      this.edit.title = item.title;
      this.edit.shortDesc = item.shortDesc;
      this.edit.longDesc = item.longDesc;
    }
  }

  private showAlert(type: string, text: string) {
    this.$store.commit('alert/show', {type, text});
  }

  private getIcon(id: number) {
    return utils.getItemIcon(id);
  }

  private async editSubmit() {
    const files = (this.$refs.inputIcon as HTMLInputElement).files;

    const data = new FormData();
    if (this.edit.id !== -1) data.append('id', this.edit.id.toString());
    data.append('title', this.edit.title);
    data.append('shortDesc', this.edit.shortDesc);
    data.append('longDesc', this.edit.longDesc);
    if (files && files[0]) data.append('icon', files[0]);

    if (this.edit.id === -1) {
      this.addItemAction({data})
        .then()
        .catch((err: any) => {
          this.showAlert('danger', `Ошибка при добавлении предмета (${err.response.status})`);
        });
    } else {
      this.updateItemAction({data})
        .then()
        .catch((err: any) => {
          this.showAlert('danger', `Ошибка при изменении предмета (${err.response.status})`);
        });
    }
  }
}
</script>

<style lang="scss">

</style>
