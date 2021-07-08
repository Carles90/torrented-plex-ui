<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Cercar</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Cercar</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-item>
        <ion-icon slot="end" name="logo-ionic"></ion-icon>
        <ion-label position="floating">¿Què vols descarregar?</ion-label>
        <ion-input placeholder="Nom de la pel·lícula, sèrie..."></ion-input>
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar} from '@ionic/vue';

export default {
  name: 'Search',
  components: {IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonIcon}
}
</script>