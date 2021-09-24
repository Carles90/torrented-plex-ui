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


      <download-item
          v-for="download in downloads"
          :key="download.id"
          :download="download"
          @click="selectDownload(download)"
          :class="{selected: selectedDownload && selectedDownload.id === download.id}"
      />

      <div v-if="downloads.length === 0" class="ion-padding">
        {{ $t('downloads.no_downloads') }}
      </div>
    </ion-content>

    <pop-card v-if="selectedDownload">
      <p class="text-ellipsis">{{ selectedDownload.name }}</p>

      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-button v-if="selectedDownload.state === 'pausedDL'" expand="block" color="success"
                        @click="resumeDownload()">
              {{ $t('downloads.resume') }}
            </ion-button>
            <ion-button v-else expand="block" color="warning" @click="pauseDownload()">
              {{ $t('downloads.pause') }}
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button expand="block" color="danger" @click="cancelDownload()">
              {{ $t('downloads.delete') }}
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </pop-card>
  </ion-page>
</template>

<script lang="ts">
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonPage,
  IonRow,
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
import PopCard from "@/components/PopCard.vue";

export default {
  name: 'Downloads',
  components: {
    PopCard,
    DownloadItem,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonGrid,
    IonRow,
    IonCol
  },
  setup() {
    const {t} = useI18n();
    const downloads: Ref<DownloadDto[]> = ref([]);
    const refreshInterval: Ref<number | null> = ref(null);
    const loading: Ref<HTMLIonLoadingElement[]> = ref([]);
    const selectedDownload: Ref<DownloadDto | null> = ref(null);

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
      refreshInterval.value = setInterval(() => getDownloads(false), 3000);
    };

    const endRefreshInterval = () => {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
      }

      refreshInterval.value = null;
    };

    const selectDownload = (download: DownloadDto) => {
      if (download.progress == 1) {
        return;
      }
      selectedDownload.value = download;
    }

    const pauseDownload = async () => {
      if (!selectedDownload.value) {
        return;
      }

      await showLoading(t('downloads.pausing'));

      axios.post("/download/" + selectedDownload.value.id + "/pause")
          .then(() => {
            getDownloads(false);
          })
          .catch(error => {
            console.error(error);
          })
          .finally(async () => {
            await hideLoading();
            selectedDownload.value = null;
          });
    }

    const resumeDownload = async () => {
      if (!selectedDownload.value) {
        return;
      }

      await showLoading(t('downloads.resuming'));

      axios.post("/download/" + selectedDownload.value.id + "/resume")
          .then(() => {
            getDownloads(false);
          })
          .catch(error => {
            console.error(error);
          })
          .finally(async () => {
            await hideLoading();
            selectedDownload.value = null;
          });
    }

    const cancelDownload = async () => {
      if (!selectedDownload.value) {
        return;
      }

      await showLoading(t('downloads.cancelling'));

      axios.delete("/download/" + selectedDownload.value.id)
          .then(() => {
            getDownloads(false);
          })
          .catch(error => {
            console.error(error);
          })
          .finally(async () => {
            await hideLoading();
            selectedDownload.value = null;
          });
    }

    onIonViewWillEnter(() => {
      getDownloads(true);
      startRefreshInterval();
      selectedDownload.value = null;
    });

    onIonViewWillLeave(() => {
      endRefreshInterval();
    });

    return {
      downloads,
      selectedDownload,
      getDownloads,
      selectDownload,
      pauseDownload,
      resumeDownload,
      cancelDownload,
    }
  }
}
</script>