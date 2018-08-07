<template>
  <b-row class="green">
    <b-col cols="0" sm="2"></b-col>
    <b-col cols="12" sm="8" class="p-0">
      <b-row>
        <b-col cols="12">
          <div class="fontsize150">Внимание!</div>
          <div>Администрация предупреждает, что фото, на котором не видно лица пользователя, будет удалено без предупреждения.</div>

          <div v-if="imageUploaded" class="blue text-center mt-2">
            <h4>Картинка загружена!</h4>
            <h4><router-link to="/Profile" class="blue">- перейти в свой профиль -</router-link></h4>
          </div>

          <div v-else class="text-center mt-2">
            <div v-if="imageUploadError" class="blue">
              <h4>Возникла непредвиденная ошибка при загрузке. Попробуйте ещё раз.</h4>
            </div>
            <!--<label class="btn btn-primary" for="file">
              <input id="file" name="file" type="file" style="display: none;" onchange="javascript: document.getElementById('uploadForm').submit();">
              Загрузить картинку
            </label>-->
            <croppa v-model="myCroppa"
              :width="340"
              :height="340"
              :quality="1"
              placeholder="Выберите изображение"
              :placeholder-font-size="25"
              :disabled="false"
              :prevent-white-space="true"
              :show-remove-button="true"
              initial-size="cover"
              initial-position="center"
              @new-image-drawn="onImageLoad"
              @image-remove="onImageRemove">  
            </croppa >
            <b-button variant="primary m-1" @click="myCroppa.rotate()">Повернуть</b-button><br/>
            <b-button variant="primary m-1" @click="myCroppa.flipX()">Отразить по X</b-button>
            <b-button variant="primary m-1" @click="myCroppa.flipY()">Отразить по Y</b-button><br/>
            <b-button variant="success m-1" @click="uploadPhoto()">Загрузить картинку</b-button>
          </div>
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import axios from 'axios';

const namespace: string = 'profile';

@Component
export default class UploadPhoto extends Vue {
  @Action('uploadPhoto', { namespace }) private uploadPhotoAction!: (options: any) => Promise<void>;
  private myCroppa: any = {};
  private imageSelected = false;
  private imageUploaded = false;
  private imageUploadError = false;

  private onImageLoad() {
    this.imageSelected = true;
  }

  private onImageRemove() {
    this.imageSelected = false;
  }

  private showAlert(type: string, text: string) {
    this.$store.commit('alert/show', {type, text});
  }

  private async uploadPhoto() {
    const blob = await this.myCroppa.promisedBlob('image/png');
    const formData = new FormData();
    formData.append('photo', blob);
    this.uploadPhotoAction({
      params: {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
      data: formData,
    }).then((response) => {
      this.imageUploaded = true;
    }).catch((err) => {
      this.imageUploadError = true;
      if (err.response.status === 500) {
        this.showAlert('danger', 'Ошибка при загрузке. Обратитесь к администрации');
      } else this.showAlert('danger', `Ошибка при загрузке (${err.response.status})`);
    });
  }
}
</script>