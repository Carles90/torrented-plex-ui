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

      <table class="data-table">
        <thead>
        <tr>
          <th class="text-left">Nom</th>
          <th style="width: 75px;" class="text-right">Mida</th>
          <th style="width: 50px;" class="text-right">Fonts</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(result, idx) in searchResults" :key="idx">
          <td class="text-left nowrap">{{ result.name }}</td>
          <td class="text-right">{{ sizeFormat(result.size) }}</td>
          <td class="text-right">{{ result.sources }}</td>
        </tr>
        </tbody>
      </table>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {IonContent, IonHeader, IonIcon, IonInput, IonPage, IonTitle, IonToolbar, loadingController} from '@ionic/vue';
import {onMounted, reactive, ref, Ref} from 'vue';
import axios from 'axios';
import {useI18n} from "vue-i18n";
import numbro from "numbro";

export default {
  name: 'Search',
  components: {IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonIcon, IonInput},
  setup() {
    const {t} = useI18n();
    const searchForm = reactive({
      value: ''
    });
    const searchResults = ref([]);
    const loading: Ref<HTMLIonLoadingElement | null> = ref(null);

    const showLoading = async () => {
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
              showLoading();
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

    onMounted(() => {
      refreshResults();
    });

    return {
      searchForm,
      searchResults,
      performSearch,
      refreshResults,
      sizeFormat
    }
  }
}
</script>