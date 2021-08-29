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

      <download-item v-for="download in downloads" :key="download.id" :download="download"/>

      <div v-if="downloads.length === 0" class="ion-padding">
        {{ $t('downloads.no_downloads') }}
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  loadingController,
  onIonViewWillEnter,
  onIonViewWillLeave
} from '@ionic/vue';
import {ref, Ref} from 'vue';
import axios from 'axios';
import {DownloadDto} from "@/dto/downloadDto";
import DownloadItem from "@/components/Downloads/DownloadItem.vue";
import {useI18n} from "vue-i18n";

export default {
  name: 'Downloads',
  components: {DownloadItem, IonHeader, IonToolbar, IonTitle, IonContent, IonPage},
  setup() {
    const {t} = useI18n();
    const downloads: Ref<DownloadDto[]> = ref([]);
    const refreshInterval: Ref<number | null> = ref(null);
    const loading: Ref<HTMLIonLoadingElement[]> = ref([]);

    const showLoading = async (text: string) => {
      const loadingObj = await loadingController.create({
        message: text
      });

      loading.value.push(loadingObj);
      await loadingObj.present();
    };

    const hideLoading = async () => {
      const loadingObj = loading.value.pop();
      if (loadingObj) {
        await loadingObj.remove();
      }
    };

    const getDownloads = async (showLoader: boolean) => {
      if (showLoader) {
        await showLoading(t('downloads.loading'));
      }

      axios.get("/download")
          .then(data => {
            downloads.value = data.data;
          })
          .catch(error => {
            console.error(error);
          })
          .finally(async () => {
            if (showLoader) {
              await hideLoading();
            }
          });
    };

    const startRefreshInterval = () => {
      refreshInterval.value = setInterval(() => getDownloads(false), 10000);
    };

    const endRefreshInterval = () => {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
      }

      refreshInterval.value = null;
    };

    onIonViewWillEnter(() => {
      getDownloads(true);
      startRefreshInterval();
    });

    onIonViewWillLeave(() => {
      endRefreshInterval();
    });

    return {
      downloads,
      getDownloads
    }
  }
}
</script>