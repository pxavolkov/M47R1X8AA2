<template>
  <b-row v-if="isLoaded" class="blue">
    <b-col cols="0" sm="2"></b-col>
    <b-col cols="12" sm="8" class="p-0">
      <b-row>
        <b-col cols="6" sm="6">
          <router-link to="/Profile/UploadPhoto">
            <img v-if="profile.photoUploaded" :src="photoPath" class="avatar"/>
            <div v-else class="avatar">
              <div class="fontsize200">^</div>
              <div class="fontsize200">^</div>
              <div>
                no<br />photo
              </div>
            </div>
          </router-link>
        </b-col>
        <b-col cols="6" sm="6">
          <div class="fontsize200">Age...{{ profile.age }}</div>
          <div class="fontsize200">Sex...{{ profile.sex === Sex.MALE ? 'M' : 'F' }}</div>
          <div class="fontsize100">
            <span :class="profile.quentaExists ? 'green' : 'orange'" :title="profile.quentaExists ? 'Квента загружена' : 'Квента не загружена'">Квента</span><br />
            <span :class="profile.isCitizen ? 'green' : 'orange'" :title="profile.isCitizen ? 'Доступ к матрице оплачен' : 'Доступ к матрице не оплачен'">Матрица</span><br />
            <span :class="profile.donated ? 'green' : 'orange'" :title="profile.donated ? 'Взнос сдан' : 'Взнос не сдан'">Полигон</span>
          </div>
          <!--
          <div><br/><br/></div>
          <div :class="profile.isCitizen ? 'green' : 'orange'">Registration: {{ profile.isCitizen ? 'YES!' : '!NO!' }}</div>
          -->
        </b-col>

        <b-col cols="12" class="lightGreen fontsize200" style="text-decoration: underline">
          <div>{{ profile.firstName }}</div>
          <div>{{ profile.lastName }}</div>
        </b-col>

        <b-col cols="6" sm="6" class="fontsize200">
          <div class="yellow" style="border-top: 1px dashed #0098DA; border-bottom: 1px dashed #0098DA;">
            <img src="@/assets/img/creditsr.png" />&nbsp;&nbsp;&nbsp;<span id="currentBalance">{{ profile.balance }}</span>
          </div>
          <div class="green" style="border-bottom: 1px dashed #0098DA;">
            <div v-if="miningTimeLeft.length" class="miningTimeLeft"><img src="@/assets/img/miningtimer.png" style="margin-right: 5px;"/>{{ miningTimeLeft }}</div>
            <div v-else class="col-md-offset-2 text-center green hoverlight miningButton" @click="startMining">
              Mining
            </div>
          </div>
        </b-col>
        <router-link to="/Shop" tag="b-col" cols="6" sm="6" class="fontsize200 shopButton">
          <img src="@/assets/img/shopr.png" class="imgButton"/>
        </router-link>

        <b-col cols="12">
          <router-link to="/User" >
            <img src="@/assets/img/userlistr.png" class="imgButton"/>
            <NumberBadge class="totalMessagesCount" :value="profile.unreadMessages"/>
          </router-link>
        </b-col>

        <b-col cols="12" class="almostWhite fontsize200 news" @click="news">
          Новости Опоры
          <NumberBadge class="newsCount" :value="profile.unreadNews"/>
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { Sex } from 'shared/enums';
import { ProfileResponse, StartMiningResponse } from 'shared/responses';
import NumberBadge from '@/components/NumberBadge.vue';

const namespace: string = 'profile';

@Component({components: {NumberBadge}})
export default class Profile extends Vue {
  @State((state) => state.profile.profile) private profile!: ProfileResponse | null;
  @Getter('isProfileLoaded', { namespace }) private isLoaded!: boolean;
  @Action('startMining', { namespace }) private startMiningAction!: () => Promise<{data: StartMiningResponse}>;
  @Action('payRequired', { namespace: 'alert' }) private payRequired!: () => Promise<void>;
  private interval: number = -1;
  private miningTimeLeft: string = '';

  get Sex() {
    return Sex;
  }

  get photoPath() {
    return this.profile ? '/api/photo/' + this.profile.id + '.png' : '';
  }

  public beforeCreate() {
    this.$store.dispatch(`${namespace}/load`).then(() => this.onTick());
  }

  public created() {
    this.interval = window.setInterval(this.onTick, 1000);
  }

  public beforeDestroy() {
    window.clearInterval(this.interval);
  }

  private onTick() {
    if (this.profile && this.profile.miningEndTime) {
      const time = Math.floor((this.profile.miningEndTime - Date.now()) / 1000);
      if (time < 0) {
        this.profile.miningEndTime = null;
        this.miningTimeLeft = '';
        this.profile.balance += this.profile.miningAmount;
      } else {
        this.miningTimeLeft = Math.floor(time / 60).toString().padStart(2, '0') + ':' +
                              (time % 60).toString().padStart(2, '0');
      }
    } else if (this.miningTimeLeft.length) this.miningTimeLeft = '';
  }

  private news() {
    if (!this.isLoaded || !this.profile) return;
    if (this.profile.isCitizen) this.$router.push('/News');
    else this.payRequired();
  }

  private showAlert(type: string, text: string) {
    this.$store.commit('alert/show', {type, text});
  }

  private startMining() {
    if (!this.isLoaded || !this.profile) return;
    if (!this.profile.isCitizen) return this.payRequired();

    this.startMiningAction()
      .then((response) => {
        if (this.profile) {
          this.profile.miningEndTime = response.data.miningEndTime;
          this.profile.miningAmount = response.data.miningAmount;
          this.onTick();
        }
      })
      .catch((err) => {
        if (err.response.status === 500) {
          this.showAlert('danger', 'Ошибка при попытке майнинга. Обратитесь к администрации');
        } else if (err.response.status === 403) {
          this.showAlert('warning', 'Ошибка при попытке майнинга. Попробуйте позже');
        } else this.showAlert('danger', `Ошибка при попытке майнинга (${err.response.status})`);
      });
  }
}
</script>

<style lang="scss">
.avatar {
  border: 2px solid #0098DA;
  border-radius: 10px;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  text-align: center;
  width: 174px;
  height: 174px;
}

.blueBorderButton {
  border: 2px solid #0098DA;
  border-radius: 10px;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  cursor: pointer;
}

.miningButton {
  @extend .blueBorderButton;
  margin-top: 8px;
  margin-bottom: 8px;
}

.miningTimeLeft {
  margin-top: 10px;
  margin-bottom: 10px;
}

.shopButton {
  @extend .blueBorderButton;
  margin-left: -5px;
  display:flex;
  align-items:center;
  justify-content:center;
}

.newsCount {
  right: 9px;
  top: -10px;
}

.totalMessagesCount {
  right: 113px;
  top: 5px;
}

.news {
  text-align: center;
  border-top: 1px dashed #0098DA;
  border-bottom: 1px dashed #0098DA;
  cursor: pointer;
}

.fontsize75 {
  font-size: 75%;
}

.imgButton {
  display: block;
  margin: 0 auto;
  padding: 5px;
}
</style>
