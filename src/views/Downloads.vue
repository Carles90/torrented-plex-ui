<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Descàrregues</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Descàrregues</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-item v-for="download in downloads" :key="download.id">
        <div>{{ download.name }} {{ download.percent }}%</div>
      </ion-item>

      <div v-if="downloads.length === 0" class="centered-message">
        No hi ha cap descàrrega activa.
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/vue';
import {onMounted, ref, Ref} from 'vue';
import axios from 'axios';
import {DownloadDto} from "@/dto/downloadDto";

export default {
  name: 'Downloads',
  components: {IonHeader, IonToolbar, IonTitle, IonContent, IonPage},
  setup() {
    const downloads: Ref<DownloadDto[]> = ref([]);

    const getDownloads = () => {
      console.log("GET", process.env);
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