<template>
  <div v-if="isLoaded">
    <h2 class="green text-center">Свойства</h2>
    <b-button to="/Master/Register" class="mb-2">Регистрации</b-button><br>

    <b-button variant="primary" v-b-modal.editModal @click="setEdit()">Добавить свойство</b-button>
    <h3 class="green">Редактирование</h3>
    <b-modal id="editModal" size="lg" hide-header :ok-variant="edit.id === -1 ? 'success' : 'warning'" :ok-title="edit.id === -1 ? 'Добавить' : 'Изменить'" cancel-title="Отмена" @hidden="editError = ''" @ok="editSubmit">
      <span>ID: <span class="green">{{ edit.id }}</span></span><br/>
      <b-form-group
        label="Название:"
        label-for="inputName">
        <b-form-input size="sm" id="inputName" v-model="edit.name"></b-form-input>
      </b-form-group>
      <b-form-group label="Кто может просматривать:">
        <b-form-checkbox-group id="checkboxesViewRoles" name="viewRoles" v-model="edit.viewRoles" :options="roleOptionsWithoutMaster"></b-form-checkbox-group>
      </b-form-group>
      <b-form-group label="Кто может редактировать:">
        <b-form-checkbox-group id="checkboxesEditRoles" name="editRoles" v-model="edit.editRoles" :options="roleOptionsWithoutMaster"></b-form-checkbox-group>
      </b-form-group>
    </b-modal>

    <b-table id="master-properties" class="lightGreen" bordered hover :items="properties" :fields="fields">
      <template slot="viewRoles" slot-scope="data">
        <b-badge v-for="(item, i) in getRolesText(data.value)" :key="i" class="mr-1 mb-1">{{ item }}</b-badge>
      </template>
      <template slot="editRoles" slot-scope="data">
        <b-badge v-for="(item, i) in getRolesText(data.value)" :key="i" class="mr-1 mb-1">{{ item }}</b-badge>
      </template>
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
import { Property } from 'shared/master';
import { Role } from 'shared/enums';

const namespace: string = 'master';

const newProperty = {
  id: -1,
  name: '',
  viewRoles: [],
  editRoles: [],
};

@Component
export default class MasterProperties extends Vue {
  @State((state) => state.master.properties) private properties!: any[];
  @Getter('isPropertiesLoaded', { namespace }) private isLoaded!: boolean;
  @Action('updateProperty', { namespace }) private updatePropertyAction!: (data: {data: Property}) => Promise<void>;
  @Action('addProperty', { namespace }) private addPropertyAction!: (data: {data: Property}) => Promise<void>;

  private edit: {
    id: number,
    name: string,
    viewRoles: number[],
    editRoles: number[],
  } = {
    id: -1,
    name: '',
    viewRoles: [],
    editRoles: [],
  };

  public beforeCreate() {
    this.$store.dispatch(`${namespace}/properties`);
  }

  private get fields() {
    return [
      {key: 'id', label: 'ID'},
      {key: 'name', label: 'Название'},
      {key: 'viewRoles', label: 'Роли для просмотра'},
      {key: 'editRoles', label: 'Роли для редактирования'},
      {key: 'actions', label: ''},
    ];
  }

  private setEdit(property?: Property) {
    if (!property) Object.assign(this.edit, newProperty);
    else {
      this.edit.id = property.id as any;
      this.edit.name = property.name;
      this.edit.viewRoles = this.getRolesValues(property.viewRoles);
      this.edit.editRoles = this.getRolesValues(property.editRoles);
    }
  }

  private showAlert(type: string, text: string) {
    this.$store.commit('alert/show', {type, text});
  }

  private getRoles(bitmask: number) {
    // tslint:disable-next-line no-bitwise
    return this.roleOptions.filter((v) => bitmask & v.value);
  }

  private getRolesText(bitmask: number) {
    return this.getRoles(bitmask).map((v) => v.text);
  }

  private getRolesValues(bitmask: number) {
    return this.getRoles(bitmask).map((v) => v.value);
  }

  private get roleOptions(): Array<{value: number, text: string}> {
    return Object.keys(Role)
      .filter((k) => typeof Role[k as any] === 'number')
      .map((v) => ({value: Role[v as any] as any, text: v}));
  }

  private get roleOptionsWithoutMaster(): Array<{value: number, text: string}> {
    return this.roleOptions.filter((v) => v.value !== Role.Master);
  }

  private async editSubmit() {
    if (this.edit.id === -1) {
      this.addPropertyAction({data: {
        name: this.edit.name,
        viewRoles: this.rolesToNumber(this.edit.viewRoles),
        editRoles: this.rolesToNumber(this.edit.editRoles),
      }})
        .then()
        .catch((err: any) => {
          this.showAlert('danger', `Ошибка при добавлении свойства (${err.response.status})`);
        });
    } else {
      this.updatePropertyAction({data: {
        id: this.edit.id,
        name: this.edit.name,
        viewRoles: this.rolesToNumber(this.edit.viewRoles),
        editRoles: this.rolesToNumber(this.edit.editRoles),
      }})
        .then()
        .catch((err: any) => {
          this.showAlert('danger', `Ошибка при изменении свойства (${err.response.status})`);
        });
    }
  }

  private rolesToNumber(roles: number[]) {
    // tslint:disable-next-line no-bitwise
    return roles.reduce((acc, v) => acc | v, 0);
  }
}
</script>

<style lang="scss">

</style>
