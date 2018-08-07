<template>
  <section id="loginForm">
    <form class="form-horizontal blue" method="post" role="form" @submit.prevent="submit">
      <h4 class="text-center">Вход в матрицу</h4>

      <h6 class="text-danger">{{ errorMessage }}</h6>

      <b-form-group
        label="Email"
        label-for="inputEmail"
        :invalid-feedback="emailFeedback"
        :state="emailState"
      >
        <b-form-input id="inputEmail" :state="emailState" v-model="form.email" @blur.native="dirty.email = true"></b-form-input>
      </b-form-group>

      <b-form-group
        label="Пароль"
        label-for="inputPassword"
        :invalid-feedback="passwordFeedback"
        :state="passwordState"
      >
        <b-form-input type="password" id="inputPassword" :state="passwordState" v-model="form.password" @blur.native="dirty.password = true"></b-form-input>
      </b-form-group>

      <div class="form-group">
        <b-form-checkbox v-model="form.rememberMe">
          Запомнить меня
        </b-form-checkbox>
      </div>

      <b-form-group>
        <input type="submit" value="Войти" class="big-button fontsize150 green" style="width: 100%"/>
      </b-form-group>

      <div class="topProgressBar"><div></div></div>
      <div class="text-center green">Нет&nbsp;&nbsp;&nbsp;логина/пароля?<br />Пройдите&nbsp;&nbsp;&nbsp;процедуру&nbsp;&nbsp;&nbsp;регистрации!</div>

      <b-form-group>
        <router-link to="/Account/Register" tag="div" class="col-md-offset-2 fontsize150 big-button green" style="margin-top: 15px;">Регистрация</router-link>
      </b-form-group>
    </form>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import utils from '@/utils';
import { LoginRequest } from 'shared/requests';

const namespace: string = 'auth';

@Component
export default class Login extends Vue {
  private form: LoginRequest = {
    email: '',
    password: '',
    rememberMe: false,
  };
  private dirty = {
    email: false,
    password: false,
  };

  @Getter('errorMessage', { namespace }) private errorMessage!: string;

  get emailState(): null | false {
    return !this.dirty.email || utils.emailRegex.test(this.form.email) ? null : false;
  }
  get emailFeedback(): string {
    if (!this.dirty.email) return '';
    else if (this.form.email.length === 0) return 'Пожалуйста введите email';
    else if (!utils.emailRegex.test(this.form.email)) return 'Введите корректный email';
    else return '';
  }

  get passwordState(): null | false {
    return !this.dirty.password || this.form.password.length > 0 ? null : false;
  }
  get passwordFeedback(): string {
    if (!this.dirty.password || this.form.password.length > 0) return '';
    else return 'Пожалуйста введите пароль';
  }

  private submit(): void {
    this.dirty.email = true;
    this.dirty.password = true;
    if (!this.emailState || !this.passwordState) return;

    this.$store.dispatch('auth/login', this.form);
  }
}
</script>

<style lang="scss">
.invalid-feedback {
  font-size: inherit !important;
}
</style>
