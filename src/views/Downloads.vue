<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ $t('downloads.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ $t('downloads.title') }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div v-for="download in downloads" :key="download.id" class="download-item">
        <div class="download-item-name">{{ download.name }}</div>
        <ion-row>
          <ion-col>
            U. Enviant:<br/>
            <b>{{ download.usersSending }}</b>
          </ion-col>
          <ion-col>
            U. Disponibles:<br/>
            <b>{{ download.usersAvailable }}</b>
          </ion-col>
          <ion-col>
            Total Usuaris:<br/>
            <b>{{ download.usersTotal }}</b>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            Estat:<br/>
            <b>{{ download.status }}</b>
          </ion-col>
          <ion-col>
            Prioritat:<br/>
            <b>{{ download.priority }}</b>
          </ion-col>
        </ion-row>
      </div>

      <div v-if="downloads.length === 0" class="ion-padding">
        {{ $t('downloads.no_downloads') }}
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {IonCol, IonContent, IonHeader, IonPage, IonRow, IonTitle, IonToolbar} from '@ionic/vue';
import {onMounted, ref, Ref} from 'vue';
import axios from 'axios';
import {DownloadDto} from "@/dto/downloadDto";

export default {
  name: 'Downloads',
  components: {IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonRow, IonCol},
  setup() {
    const downloads: Ref<DownloadDto[]> = ref([]);

    const getDownloads = () => {
      axios.get("/download")
          .then(data => {
            downloads.value = data.data;
          })
          .catch(error => {
            console.error(error);
          });
    };

    onMounted(() => {
      getDownloads();
    });

    return {
      downloads,
      getDownloads
    }
  }
}
</script>