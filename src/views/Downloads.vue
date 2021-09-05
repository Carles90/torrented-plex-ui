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
            <ion-button v-if="selectedDownload.status === 'Paused'" expand="block" color="success"
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

    <pop-card v-if="selectedIncoming">
      <p class="text-ellipsis">{{ selectedIncoming.name }}</p>

      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-button expand="block" color="primary" @click="selectFileToOrder()">
              {{ $t('downloads.order') }}
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button expand="block" color="danger" @click="deleteIncoming()">
              {{ $t('downloads.delete') }}
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </pop-card>

    <pop-card v-if="orderingFile">
      <h1>{{ $t('downloads.order_file.title') }}</h1>
      <p class="text-ellipsis">{{ selectedIncoming.name }}</p>
      <ion-list>
        <ion-radio-group v-model="selectedFileType">
          <ion-item>
            <ion-label>{{ $t('downloads.order_file.movie') }}</ion-label>
            <ion-radio slot="start" value="movie"></ion-radio>
          </ion-item>
          <ion-item>
            <ion-label>{{ $t('downloads.order_file.show') }}</ion-label>
            <ion-radio slot="start" value="show"></ion-radio>
          </ion-item>
        </ion-radio-group>
      </ion-list>

      <template v-if="selectedFileType === 'show'">
        <p>{{ $t('downloads.order_file.which_show') }}</p>
        <ion-select v-model="selectedFileFolderName" :placeholder="$t('downloads.order_file.select_show')">
          <ion-select-option v-for="show in shows" :value="show" :key="show">{{ show }}</ion-select-option>
          <ion-select-option value="other">{{ $t('downloads.order_file.other') }}</ion-select-option>
        </ion-select>
        <template v-if="selectedFileFolderName === 'other'">
          <p>{{ $t('downloads.order_file.new_name_label') }}</p>
          <ion-input v-model="selectedFileNewFolderName" :placeholder="$t('downloads.order_file.new_name')"/>
        </template>
      </template>

      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-button expand="block" color="primary" :disabled="!canSubmitOrder">
              {{ $t('downloads.order_file.order') }}
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button expand="block" color="light" @click="cancelOrderingFile()">
              {{ $t('downloads.order_file.cancel') }}
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
  IonList,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonTitle,
  IonToolbar,
  loadingController,
  onIonViewWillEnter,
  onIonViewWillLeave
} from '@ionic/vue';
import {computed, ref, Ref} from 'vue';
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
    IonCol,
    IonList,
    IonRadioGroup,
    IonRadio

  },
  setup() {
    const {t} = useI18n();
    const downloads: Ref<DownloadDto[]> = ref([]);
    const incomings: Ref<IncomingDto[]> = ref([]);
    const shows: Ref<string[]> = ref([]);
    const refreshInterval: Ref<number | null> = ref(null);
    const loading: Ref<HTMLIonLoadingElement[]> = ref([]);
    const selectedDownload: Ref<DownloadDto | null> = ref(null);
    const selectedIncoming: Ref<IncomingDto | null> = ref(null);
    const orderingFile: Ref<IncomingDto | null> = ref(null);
    const selectedFileType: Ref<string> = ref('movie');
    const selectedFileFolderName: Ref<string> = ref('');
    const selectedFileNewFolderName: Ref<string> = ref('');

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

    const getShows = async () => {
      axios.get("/incoming/shows")
          .then(data => {
            shows.value = data.data;
          })
          .catch(error => {
            console.error(error);
          });
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

    const deleteIncoming = async () => {
      if (!selectedIncoming.value) {
        return;
      }

      await showLoading(t('downloads.deleting'));

      axios.post("/incoming", {
        fileName: selectedIncoming.value.name
      })
          .then(() => {
            getDownloads(false);
          })
          .catch(error => {
            console.error(error);
          })
          .finally(async () => {
            await hideLoading();
            selectedIncoming.value = null;
          });
    }

    const selectFileToOrder = () => {
      if (!selectedIncoming.value) {
        return;
      }

      orderingFile.value = selectedIncoming.value;
      selectedFileType.value = 'movie';
    }

    const cancelOrderingFile = () => {
      orderingFile.value = null;
      selectedIncoming.value = null;
    }

    const canSubmitOrder = computed(() => {
      if (selectedFileType.value === 'movie') {
        return true;
      } else if (selectedFileType.value === 'show') {
        if (!selectedFileFolderName.value) {
          return false;
        }

        if (selectedFileFolderName.value === 'other') {
          return selectedFileNewFolderName.value !== '';
        }

        return true;
      }

      return false;
    });

    onIonViewWillEnter(() => {
      getShows();
      getDownloads(true);
      startRefreshInterval();
      selectedDownload.value = null;
      selectedIncoming.value = null;
    });

    onIonViewWillLeave(() => {
      endRefreshInterval();
    });

    return {
      shows,
      downloads,
      incomings,
      selectedDownload,
      selectedIncoming,
      orderingFile,
      selectedFileType,
      selectedFileFolderName,
      selectedFileNewFolderName,
      canSubmitOrder,
      getDownloads,
      selectDownload,
      selectIncoming,
      pauseDownload,
      resumeDownload,
      cancelDownload,
      deleteIncoming,
      selectFileToOrder,
      cancelOrderingFile
    }
  }
}
</script>