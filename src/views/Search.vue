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
          <th style="width: 60px;" class="text-right">{{ $t('search.item_seeders') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="(result, idx) in searchResults"
            :key="idx"
            @click="askDownloadFile(idx)"
            :class="{selected: downloadingFile && downloadingFileIdx === idx}"
        >
          <td class="text-left nowrap">{{ result.title }}</td>
          <td class="text-right">{{ toSize(result.size) }}</td>
          <td class="text-right">{{ result.seeders }}</td>
        </tr>
        </tbody>
      </table>

      <div class="ion-padding" v-else-if="searchResults && searchResults.length === 0">
        {{ $t('search.no_results') }}
      </div>

    </ion-content>

    <pop-card v-if="downloadingFile">
      <h1>{{ $t('search.download_card.title') }}</h1>
      <table class="data-table vertical-align-top">
        <tbody>
        <tr>
          <th style="width: 70px;">{{ $t('search.download_card.item_name') }}:</th>
          <td>{{ downloadingFile.title }}</td>
        </tr>
        <tr>
          <th>{{ $t('search.download_card.item_size') }}:</th>
          <td>{{ toSize(downloadingFile.size) }}</td>
        </tr>
        <tr>
          <th>{{ $t('search.download_card.item_seeders') }}:</th>
          <td>{{ downloadingFile.seeders }}</td>
        </tr>
        <tr>
          <th>{{ $t('search.download_card.item_leechers') }}:</th>
          <td>{{ downloadingFile.peers }}</td>
        </tr>
        <tr>
          <th>{{ $t('search.download_card.item_tracker') }}:</th>
          <td>{{ downloadingFile.tracker }}</td>
        </tr>
        </tbody>
      </table>

      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-button class="mt-3" expand="block" color="primary" @click="startDownload">
              {{ $t('search.download_card.download') }}
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button class="mt-3" expand="block" color="light" @click="cancelDownload">
              {{ $t('search.download_card.cancel') }}
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </pop-card>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
  loadingController
} from '@ionic/vue';
import {reactive, ref, Ref} from 'vue';
import axios from 'axios';
import {useI18n} from "vue-i18n";
import numbro from "numbro";
import PopCard from "@/components/PopCard.vue";
import {SearchItemDto} from "@/dto/searchItemDto";
import router from "@/router";

export default {
  name: 'Search',
  components: {
    PopCard,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonIcon,
    IonInput,
    IonRow,
    IonCol,
    IonGrid,
    IonButton,
    IonItem,
    IonLabel
  },
  setup: function () {
    const {t} = useI18n();
    const searchForm = reactive({
      value: ''
    });
    const searchResults: Ref<SearchItemDto[]> = ref([]);
    const loading: Ref<HTMLIonLoadingElement[]> = ref([]);
    const downloadingFile: Ref<any> = ref();
    const downloadingFileIdx: Ref<number | null> = ref(null);

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

    const performSearch = async () => {
      await showLoading(t('search.searching'));
      downloadingFile.value = null;
      downloadingFileIdx.value = null;
      axios.post("/search", {
        query: searchForm.value
      })
          .then(async (data: any) => {
            await hideLoading();
            searchResults.value = data.data;
          })
          .catch(async error => {
            await hideLoading();
            console.error(error);
          });
    };

    const toSize = (v: number) => {
      let val = v;
      let unit = 'B';
      let mantissa = 0;

      if (val > 1073741824) {
        val = val / 1073741824;
        unit = 'GB';
        mantissa = 2;
      } else if (val > 1048576) {
        val = val / 1048576;
        unit = 'MB';
        mantissa = 2;
      } else if (val > 1024) {
        val = val / 1024;
        unit = 'kB';
        mantissa = 2;
      }

      return numbro(val).format({
        thousandSeparated: true,
        mantissa: mantissa,
      }) + ' ' + unit;
    }

    const askDownloadFile = (idx: number) => {
      downloadingFile.value = searchResults.value[idx];
      downloadingFileIdx.value = idx;
    }

    const cancelDownload = () => {
      downloadingFile.value = null;
      downloadingFileIdx.value = null;
    }

    const startDownload = async () => {
      if (!downloadingFile.value) {
        return;
      }

      await showLoading(t('search.downloading'));
      axios.post("/download", {
        link: downloadingFile.value.link
      })
          .then(async () => {
            await hideLoading();
            cancelDownload();
            await router.push('downloads');
          })
          .catch(async error => {
            await hideLoading();
            console.error(error);
          });
    }

    return {
      searchForm,
      searchResults,
      downloadingFile,
      downloadingFileIdx,
      performSearch,
      toSize,
      askDownloadFile,
      cancelDownload,
      startDownload
    }
  }
}
</script>