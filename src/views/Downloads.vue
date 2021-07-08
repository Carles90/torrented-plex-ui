<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Descàrregues</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Descàrregues</ion-title>
                </ion-toolbar>
            </ion-header>

            <ion-item v-for="download in downloads" :key="download.id">
                <div>{{download.name}} {{download.percent}}%</div>
            </ion-item>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
    import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/vue';
    import {onMounted, ref, Ref} from 'vue';
    import axios from 'axios';
    import {DownloadDto} from "@/dto/downloadDto";

    export default {
        name: 'Downloads',
        components: {IonHeader, IonToolbar, IonTitle, IonContent, IonPage},
        setup() {
            const downloads: Ref<DownloadDto[]> = ref([]);

            const getDownloads = () => {
                axios.get("http://plex.lan:8080/download")
                    .then(data => {
                        downloads.value = data.data;
                    })
                    .catch(error => {
                        console.error(error);
                    });
            };

            onMounted(() => {
                getDownloads();
            });

            return {
                downloads,
                getDownloads
            }
        }
    }
</script>