<template>
    <ion-page>
        <ion-tabs>
            <ion-router-outlet></ion-router-outlet>
            <ion-tab-bar slot="bottom">
                <ion-tab-button tab="tab1" href="/downloads">
                    <ion-icon :icon="cloudDownloadOutline"/>
                    <ion-label>Descàrregues</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="tab2" href="/search">
                    <ion-icon :icon="searchOutline"/>
                    <ion-label>Cercar</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="tab3" href="/status">
                    <ion-icon :icon="analyticsOutline"/>
                    <ion-label>Estat</ion-label>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script lang="ts">
    import {IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs} from '@ionic/vue';
    import {analyticsOutline, cloudDownloadOutline, searchOutline} from 'ionicons/icons';

    export default {
        name: 'Tabs',
        components: {IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet},
        setup() {
            return {
                cloudDownloadOutline,
                searchOutline,
                analyticsOutline,
            }
        }
    }
</script>