<template>
  <div class="download-item">
    <div class="download-item-name">{{ download.name }}</div>
    <ion-progress-bar v-if="isPaused()" class="my-2" color="medium" :value="download.percent / 100"/>
    <ion-progress-bar v-else-if="isWaiting()" class="my-2" color="warning" :value="download.percent / 100"/>
    <ion-progress-bar v-else class="my-2" color="primary" :value="download.percent / 100" :buffer="downloadBuffer()"/>
    <div class="download-item-row">
      <div class="download-item-col">
        {{ $t('downloads.users_sending') }}:<br/>
        <b>{{ download.usersSending }}</b>
      </div>
      <div class="download-item-col">
        {{ $t('downloads.users_available') }}:<br/>
        <b>{{ download.usersAvailable }}</b>
      </div>
      <div class="download-item-col">
        {{ $t('downloads.users_total') }}:<br/>
        <b>{{ download.usersTotal }}</b>
      </div>
    </div>
    <div class="download-item-row">
      <div class="download-item-col">
        {{ $t('downloads.status') }}:<br/>
        <b>{{ statusName() }}</b>
      </div>
      <div class="download-item-col">
        {{ $t('downloads.priority') }}:<br/>
        <b>{{ priority() }}</b>
      </div>
      <div class="download-item-col">
        {{ $t('downloads.speed') }}:<br/>
        <b v-if="download.speed">{{ download.speed }}</b>
        <b v-else>0 B/s</b>
      </div>
    </div>
  </div>
</template>

<script>
import {DownloadDto} from "@/dto/downloadDto";
import {useI18n} from "vue-i18n";
import {IonProgressBar} from "@ionic/vue";

export default {
  name: "DownloadItem",
  components: {
    IonProgressBar
  },
  props: {
    download: {
      type: DownloadDto
    }
  },
  setup(props) {
    const {t} = useI18n();

    const statusName = () => {
      switch (props.download.status) {
        case "Downloading":
          return t('downloads.statuses.downloading');
        case "Waiting":
          return t('downloads.statuses.waiting');
        case "Paused":
          return t('downloads.statuses.paused');
      }

      return props.download.status;
    };

    const priority = () => {
      switch (props.download.priority) {
        case "Auto [Hi]":
          return t('downloads.priorities.auto_hi');
        case "Auto [No]":
          return t('downloads.priorities.auto_no');
        case "Auto [Lo]":
          return t('downloads.priorities.auto_lo');
        case "High":
          return t('downloads.priorities.high');
        case "Normal":
          return t('downloads.priorities.normal');
        case "Low":
          return t('downloads.priorities.low');
      }

      return props.download.priority;
    };

    const downloadBuffer = () => {
      if (props.download.status === 'Downloading') {
        return props.download.percent / 100;
      }

      return 1;
    }

    const isPaused = () => {
      return props.download.status === 'Paused';
    }

    const isWaiting = () => {
      return props.download.status === 'Waiting';
    }

    return {
      statusName,
      priority,
      downloadBuffer,
      isPaused,
      isWaiting
    };
  }
}
</script>
