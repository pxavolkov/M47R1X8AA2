<template>
  <div class="blue">
    <h3 class="yellow text-center">Дополнительная информация</h3>
    <h4 class="yellow text-center">Пользователь: <span class="green" v-if="profile">{{ profile.firstName }} {{ profile.lastName }}</span></h4>

    <b-modal id="editPropertyModal" class="defaultModal" size="sm" hide-header ok-title="Сохранить" cancel-title="Отмена" @ok="editPropertySubmit">
      <span>
        Свойство:
        <span v-if="edit.propertyId !== -1" class="green">{{ editPropertyName }}</span>
        <b-form-select v-else v-model="edit.propertyId" :options="addProperties" :state="propertySelectState" size="sm" class="mb-1"/>
      </span><br/>
      <b-form-textarea v-model="edit.value" placeholder="Значение" :rows="3" :max-rows="6" style="resize: none;"></b-form-textarea>
    </b-modal>

    <b-table thead-class="d-none" :fields="fields" :items="visibleProperties">
      <span slot="value" slot-scope="data" v-html="data.value"></span>
      <template slot="actions" slot-scope="data">
        <b-button v-if="data.item.canEdit" @click="setEdit(data.item)" size="xs" v-b-modal.editPropertyModal>✏️</b-button>
      </template>
    </b-table>
    <div class="text-center">
      <b-button v-if="canAddProperty" @click="setEdit()" variant="primary" v-b-modal.editPropertyModal>Добавить</b-button>
    </div>
    <div class="text-center">
      <router-link to="/Profile" >Вернуться в профиль</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { InventoryItem, Item, PropertyValueEditable, PublicProfile } from 'shared/responses';
import { SetProperty } from 'shared/requests';
import { InventoryItemData } from 'shared/master';
import utils from '@/utils';

const namespace: string = 'property';

const newItem = {
  id: -1,
  value: '',
  name: '',
};

@Component
export default class Properties extends Vue {
  @Prop(String) private id!: string;
  @State((state) => state.property.list) private properties!: PropertyValueEditable[];
  @State((state) => state.property.profile) private profile!: PublicProfile;
  @Action('payRequired', { namespace: 'alert' }) private payRequired!: () => Promise<void>;
  @Action('updateValue', { namespace }) private updateValueAction!: ({data}: {data: SetProperty}) => Promise<void>;

  private edit = {
    propertyId: -1,
    value: '',
  };
  private propertySelectState: 'invalid' | null = null;

  public created() {
    this.$store.dispatch(`${namespace}/load`, {params: {userId: this.userId}}).catch((err) => {
      if (err.response.status === 500) {
        this.showAlert('danger', 'Ошибка при загрузке дополнительной информации. Обратитесь к администрации');
      } else if (err.response.status === 403) this.payRequired();
      else if (err.response.status !== 401) {
        this.showAlert('danger', `Ошибка при загрузке дополнительной информации (${err.response.status})`);
      }
    });
  }

  private get fields() {
    return [
      {key: 'name', label: 'Название'},
      {key: 'value', label: 'Значение', class: 'w-100', formatter: utils.nl2br},
      {key: 'actions', label: ''},
    ];
  }

  private showAlert(type: string, text: string) {
    this.$store.commit('alert/show', {type, text});
  }

  private setEdit(item: {id: number, value: string} = newItem) {
    this.propertySelectState = null;
    this.edit.propertyId = item.id;
    this.edit.value = item.value;
  }

  private editPropertySubmit(evt: Event) {
    if (this.edit.propertyId === -1) {
      this.propertySelectState = 'invalid';
      evt.preventDefault();
    } else {
      this.updateValueAction({data: Object.assign({}, this.edit, {userId: this.userId})})
        .then()
        .catch((err: any) => {
          this.showAlert('danger', `Ошибка при редактировании значения (${err.response.status})`);
        });
    }
  }

  private get userId() {
    return this.id ? parseInt(this.id, 10) : null;
  }

  private get visibleProperties() {
    return this.properties.filter((v) => v.value);
  }

  private get canAddProperty() {
    return this.properties.some((v) => !v.value && v.canEdit);
  }

  private get editPropertyName() {
    const prop = this.properties.find((v) => v.id === this.edit.propertyId);
    return prop ? prop.name : '';
  }

  private get addProperties() {
    return this.properties.filter((v) => !v.value && v.canEdit).map((v) => ({value: v.id, text: v.name}));
  }
}
</script>

<style lang="scss">

</style>
