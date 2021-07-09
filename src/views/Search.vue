<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{$t('search.title')}}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{$t('search.title')}}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-item>
        <ion-icon slot="end" name="logo-ionic"></ion-icon>
        <ion-label position="floating">{{$t('search.what_do_you_want_to_search')}}</ion-label>
        <ion-input v-model="searchForm.value" @change="performSearch"></ion-input>
      </ion-item>

      <div>{{searchResults}}</div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
  import {IonContent, IonHeader, IonIcon, IonInput, IonPage, IonTitle, IonToolbar, loadingController} from '@ionic/vue';
  import {reactive, ref, Ref} from 'vue';
  import axios from 'axios';

  export default {
    name: 'Search',
    components: {IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonIcon, IonInput},
    setup() {
      const searchForm = reactive({
        value: ''
      });
      const searchResults = ref([]);
      const loading: Ref<HTMLIonLoadingElement | null> = ref(null);

      const showLoading = async () => {
        loading.value = await loadingController.create({
          message: 'Please wait...',
          duration: 3000
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
        axios.post("/search", {
          search: searchForm.value
        })
          .then(() => {
            setTimeout(() => refreshResults(), 5000);
          })
          .catch(error => {
            hideLoading();
            console.error(error);
          });
      };

      return {
        searchForm,
        searchResults,
        performSearch,
        refreshResults
      }
    }
  }
</script>