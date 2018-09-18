<template>
  <section id="registerForm">
    <form class="form-horizontal blue" enctype="multipart/form-data" method="post" role="form" @submit.prevent="submit">
      <h4 class="text-center">Введите данные для логина</h4>

      <h6 class="text-danger">{{ errorMessage }}</h6>

      <b-form-group
        label="Email"
        label-for="inputEmail"
        :invalid-feedback="errors.email"
        :state="state('email')"
      >
        <b-form-input id="inputEmail" :state="state('email')" v-model="form.email" @blur.native="update('email')"></b-form-input>
      </b-form-group>

      <b-form-group
        label="Пароль"
        label-for="inputPassword"
        :invalid-feedback="errors.password"
        :state="state('password')"
      >
        <b-form-input type="password" id="inputPassword" :state="state('password')" v-model="form.password" @blur.native="update('password')"></b-form-input>
      </b-form-group>

      <b-form-group
        label="Пароль"
        label-for="inputConfirmPassword"
        :invalid-feedback="errors.confirmPassword"
        :state="state('confirmPassword')"
      >
        <b-form-input type="password" id="inputConfirmPassword" :state="state('confirmPassword')" v-model="form.confirmPassword" @blur.native="update('confirmPassword')"></b-form-input>
      </b-form-group>

      <div style="margin-top: 26px;">
        <h4 class="text-center">Введите данные игрока</h4>
      </div>

      <b-form-group
        label="Имя игрока"
        label-for="inputPlayerName"
        :invalid-feedback="errors.playerName"
        :state="state('playerName')"
      >
        <b-form-input id="inputPlayerName" :state="state('playerName')" v-model="form.playerName" @blur.native="update('playerName')"></b-form-input>
      </b-form-group>

      <b-form-group
        label="Возраст игрока"
        label-for="inputPlayerAge"
        :invalid-feedback="errors.playerAge"
        :state="state('playerAge')"
      >
        <b-form-input id="inputPlayerAge" :state="state('playerAge')" v-model="playerAgeText" @blur.native="update('playerAge')"></b-form-input>
      </b-form-group>

      <b-form-group
        label="Адрес страницы ВК или телефон"
        label-for="inputInfo"
        :invalid-feedback="errors.info"
        :state="state('info')"
      >
        <b-form-input id="inputInfo" :state="state('info')" v-model="form.info" @blur.native="update('info')"></b-form-input>
      </b-form-group>

      <b-form-group
        label="Аллергии, противопоказания"
        label-for="inputAllergy"
        :invalid-feedback="errors.allergy"
        :state="state('allergy')"
      >
        <b-form-input id="inputAllergy" :state="state('allergy')" v-model="form.allergy" @blur.native="update('allergy')"></b-form-input>
      </b-form-group>

      <div style="margin-top: 26px;">
        <h4 class="text-center">Введите данные персонажа</h4>
      </div>

      <b-form-group
        label="Имя персонажа"
        label-for="inputFirstName"
        :invalid-feedback="errors.firstName"
        :state="state('firstName')"
      >
        <b-form-input id="inputFirstName" :state="state('firstName')" v-model="form.firstName" @blur.native="update('firstName')"></b-form-input>
      </b-form-group>

      <b-form-group
        label="Фамилия персонажа"
        label-for="inputLastName"
        :invalid-feedback="errors.lastName"
        :state="state('lastName')"
      >
        <b-form-input id="inputLastName" :state="state('lastName')" v-model="form.lastName" @blur.native="update('lastName')"></b-form-input>
      </b-form-group>

      <b-form-group label="Пол">
        <b-form-radio-group id="radiosSex" v-model="form.sex" >
          <b-form-radio :value="Sex.MALE" checked>М</b-form-radio>
          <b-form-radio :value="Sex.FEMALE">Ж</b-form-radio>
        </b-form-radio-group>
      </b-form-group>

      <b-form-group
        label="Возраст"
        label-for="inputAge"
        :invalid-feedback="errors.age"
        :state="state('age')"
      >
        <b-form-input id="inputAge" :state="state('age')" v-model="ageText" @blur.native="update('age')"></b-form-input>
      </b-form-group>

      <div class="form-group">
        <label class="control-label" for="inputQuenta">Квента</label>
        <div>
          <label class="btn btn-primary" for="inputQuenta">
            <input ref="inputQuenta" id="inputQuenta" type="file" style="display: none;" @change="fileChanged">
            Загрузить
          </label>
          <label id="filename">&nbsp;&nbsp;{{ fileName }}</label>
        </div>
      </div>

      <b-form-group>
        <input type="submit" value="Зарегистрироваться" class="big-button fontsize150 blue" style="width: 100%"/>
      </b-form-group>
    </form>
  </section>
</template>

<script lang="ts">
import axios from 'axios';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import utils from '@/utils';
import { Sex } from 'shared/enums';
import { RegisterRequest } from 'shared/requests';

interface IBooleanObject {
  [key: string]: boolean;
}

interface IStringObject {
  [key: string]: string;
}

@Component
export default class Register extends Vue {
  private form = new RegisterRequest();
  private playerAgeText = '';
  private ageText = '';
  private fileName = '';
  private dirty: IBooleanObject = {
    email: false,
    password: false,
    confirmPassword: false,
    playerName: false,
    playerAge: false,
    info: false,
    allergy: false,
    firstName: false,
    lastName: false,
    age: false,
  };
  private errors: IStringObject = {
    email: '',
    password: '',
    confirmPassword: '',
    playerName: '',
    playerAge: '',
    info: '',
    allergy: '',
    firstName: '',
    lastName: '',
    age: '',
  };
  private errorMessage = '';

  private async submit(): Promise<void> {
    for (const i in this.dirty) this.dirty[i] = true;
    if (!await this.validate()) return;

    this.errorMessage = '';
    const formData = new FormData();
    formData.append('data', JSON.stringify(this.form));
    const inputQuenta = this.$refs.inputQuenta as HTMLInputElement;
    if (inputQuenta.files && inputQuenta.files.length > 0) {
      formData.append('quenta', inputQuenta.files[0]);
    }
    try {
      const response = await axios.post('/api/user/register', formData, {headers: {
        'Content-Type': 'multipart/form-data',
      }});
      this.$router.push('/Profile');
    } catch (err) {
      if (err.response.status === 403) this.errorMessage = 'Такой email уже зарегистрирован';
      else if (err.response.status === 400) this.errorMessage = 'Проверьте правильность ввода всех данных';
      else if (err.response.status === 422) this.errorMessage = 'Не удалось загрузить квенту';
      else this.errorMessage = `Неизвестная ошибка (${err.response.status})`;
    }
  }

  private state(key: string): false | null {
    return this.errors[key].length ? false : null;
  }

  private async update(key: string) {
    this.dirty[key] = true;
    this.validate();
  }

  private async validate(): Promise<boolean> {
    const errors = await this.form.validate();
    if (errors.length === 0) return true;

    // Clear previous errors
    for (const key of Object.keys(this.errors)) {
      this.errors[key] = '';
    }

    // Set errors
    for (const err of errors) {
      if (this.dirty[err.property]) {
        this.errors[err.property] = err.constraints.isNotEmpty || err.constraints[Object.keys(err.constraints)[0]];
      }
    }

    return false;
  }

  @Watch('playerAgeText')
  private onPlayerAgeTextChanged(val: string, oldVal: string) {
    this.form.playerAge = parseInt(val, 10);
  }

  @Watch('ageText')
  private onAgeTextChanged(val: string, oldVal: string) {
    this.form.age = parseInt(val, 10);
  }

  get Sex() {
    return Sex;
  }

  private fileChanged(event: any) {
    let path = (this.$refs.inputQuenta as HTMLInputElement).value; // TODO: fix?
    if (path) {
      path = path.substring(path.lastIndexOf('\\') + 1);
      path = path.substring(path.lastIndexOf('/') + 1);
    }
    this.fileName = path;
  }
}
</script>

<style lang="scss">
</style>
