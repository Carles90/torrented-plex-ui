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

      <incoming-item
          v-for="incoming in incomings"
          :key="incoming.name"
          :incoming="incoming"
          @click="selectIncoming(incoming)"
          :class="{selected: selectedIncoming && selectedIncoming.name === incoming.name}"
      />
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
            <ion-button v-if="selectedDownload.status === 'Paused'" expand="block" color="success">
              {{ $t('downloads.resume') }}
            </ion-button>
            <ion-button v-else expand="block" color="warning">
              {{ $t('downloads.pause') }}
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button expand="block" color="danger">
              {{ $t('downloads.delete') }}
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </pop-card>

    <pop-card v-if="selectedIncoming">
      <p class="text-ellipsis">{{ selectedIncoming.name }}</p>

      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-button expand="block" color="primary">
              {{ $t('downloads.order') }}
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button expand="block" color="danger">
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
import {IncomingDto} from "@/dto/incomingDto";
import IncomingItem from "@/components/Downloads/IncomingItem.vue";
import PopCard from "@/components/PopCard.vue";

export default {
  name: 'Downloads',
  components: {
    PopCard,
    IncomingItem,
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
    const incomings: Ref<IncomingDto[]> = ref([]);
    const refreshInterval: Ref<number | null> = ref(null);
    const loading: Ref<HTMLIonLoadingElement[]> = ref([]);
    const selectedDownload: Ref<DownloadDto | null> = ref(null);
    const selectedIncoming: Ref<IncomingDto | null> = ref(null);

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

    const getIncomings = async (showLoader: boolean) => {
      if (showLoader) {
        await showLoading(t('downloads.loading'));
      }

      axios.get("/incoming")
          .then(data => {
            incomings.value = data.data;
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

    const getDownloads = async (showLoader: boolean) => {
      if (showLoader) {
        await showLoading(t('downloads.loading'));
      }

      axios.get("/download")
          .then(data => {
            downloads.value = data.data;
            getIncomings(showLoader);
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

    const selectDownload = (download: DownloadDto) => {
      selectedDownload.value = download;
      selectedIncoming.value = null;
    }

    const selectIncoming = (incoming: IncomingDto) => {
      selectedDownload.value = null;
      selectedIncoming.value = incoming;
    }

    onIonViewWillEnter(() => {
      getDownloads(true);
      startRefreshInterval();
    });

    onIonViewWillLeave(() => {
      endRefreshInterval();
    });

    return {
      downloads,
      incomings,
      selectedDownload,
      selectedIncoming,
      getDownloads,
      selectDownload,
      selectIncoming
    }
  }
}
</script>