<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ $t('search.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ $t('search.title') }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-item>
        <ion-icon slot="end" name="logo-ionic"></ion-icon>
        <ion-label position="floating">{{ $t('search.what_do_you_want_to_search') }}</ion-label>
        <ion-input v-model="searchForm.value" @change="performSearch"></ion-input>
      </ion-item>

      <table v-if="searchResults && searchResults.length > 0" class="data-table">
        <thead>
        <tr>
          <th class="text-left">{{ $t('search.item_name') }}</th>
          <th style="width: 90px;" class="text-right">{{ $t('search.item_size') }}</th>
          <th style="width: 60px;" class="text-right">{{ $t('search.item_sources') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(result, idx) in searchResults" :key="idx" @click="askDownloadFile(idx)">
          <td class="text-left nowrap">{{ result.name }}</td>
          <td class="text-right">{{ sizeFormat(result.size) }}</td>
          <td class="text-right">{{ result.sources }}</td>
        </tr>
        </tbody>
      </table>

      <div class="ion-padding" v-else-if="searchResults && searchResults.length === 0">
        {{ $t('search.no_results') }}
      </div>

    </ion-content>

    <pop-card v-if="downloadingFile">
      <h1>Començar descàrrega</h1>
      <table class="data-table vertical-align-top">
        <tbody>
        <tr>
          <th style="width: 60px;">{{ $t('search.item_name') }}:</th>
          <td>{{ downloadingFile.name }}</td>
        </tr>
        <tr>
          <th>{{ $t('search.item_size') }}:</th>
          <td>{{ sizeFormat(downloadingFile.size) }}</td>
        </tr>
        <tr>
          <th>{{ $t('search.item_sources') }}:</th>
          <td>{{ downloadingFile.sources }}</td>
        </tr>
        </tbody>
      </table>

      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-button class="mt-3" expand="block" color="primary" @click="startDownload">Descarregar</ion-button>
          </ion-col>
          <ion-col>
            <ion-button class="mt-3" expand="block" color="light" @click="cancelDownload">Cancel·lar</ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </pop-card>
  </ion-page>
</template>

<script lang="ts">
import {IonContent, IonHeader, IonIcon, IonInput, IonPage, IonTitle, IonToolbar, loadingController} from '@ionic/vue';
import {onMounted, reactive, ref, Ref} from 'vue';
import axios from 'axios';
import {useI18n} from "vue-i18n";
import numbro from "numbro";
import PopCard from "@/components/PopCard.vue";
import {SearchItemDto} from "@/dto/searchItemDto";

export default {
  name: 'Search',
  components: {PopCard, IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonIcon, IonInput},
  setup() {
    const {t} = useI18n();
    const searchForm = reactive({
      value: ''
    });
    const searchResults: Ref<SearchItemDto[]> = ref([]);
    const loading: Ref<HTMLIonLoadingElement | null> = ref(null);
    const downloadingFile: Ref<any> = ref();

    const showLoading = async () => {
      if (loading.value) {
        return;
      }

      loading.value = await loadingController.create({
        message: t('search.searching')
      });

      loading.value.present();
    };

    const hideLoading = async () => {
      if (!loading.value) {
        return;
      }

      loading.value.remove();
      loading.value = null;
    };

    const refreshResults = () => {
      showLoading();
      axios.get("/search")
          .then(data => {
            searchResults.value = data.data;
          })
          .catch(error => {
            console.error(error);
          })
          .finally(() => {
            hideLoading();
          });
    };

    const performSearch = () => {
      showLoading();
      axios.post("/search", {
        query: searchForm.value
      })
          .then(() => {
            setTimeout(() => {
              refreshResults();
            }, 2000);
          })
          .catch(error => {
            hideLoading();
            console.error(error);
          });
    };

    const sizeFormat = (value: number) => {
      let unit = 'MB';
      if (value > 1000) {
        value = value / 1024;
        unit = 'GB';
      }

      return numbro(value).format({
        thousandSeparated: true,
        mantissa: 2,
      }) + ' ' + unit;
    }

    const askDownloadFile = (idx: number) => {
      downloadingFile.value = searchResults.value[idx];
    }

    const cancelDownload = () => {
      downloadingFile.value = null;
    }

    const startDownload = () => {
      if (!downloadingFile.value) {
        return;
      }

      showLoading();
      axios.post("/download", {
        index: downloadingFile.value.downloadIndex
      })
          .then(() => {
            hideLoading();
          })
          .catch(error => {
            hideLoading();
            console.error(error);
          });
    }

    onMounted(() => {
      refreshResults();
    });

    return {
      searchForm,
      searchResults,
      downloadingFile,
      performSearch,
      refreshResults,
      sizeFormat,
      askDownloadFile,
      cancelDownload,
      startDownload
    }
  }
}
</script>