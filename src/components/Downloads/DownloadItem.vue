<template>
  <div class="download-item">
    <div class="download-item-name">{{ download.name }}</div>
    <ion-progress-bar v-if="isCompleted()" class="my-2" color="success" :value="download.progress"/>
    <ion-progress-bar v-else-if="isPaused()" class="my-2" color="medium" :value="download.progress"/>
    <ion-progress-bar v-else-if="isWaiting()" class="my-2" color="warning" :value="download.progress"/>
    <ion-progress-bar v-else class="my-2" color="primary" :value="download.progress" :buffer="downloadBuffer()"/>

    <template v-if="!isCompleted()">
      <div class="download-item-row">
        <div class="download-item-col">
          {{ $t('downloads.seeds') }}:<br/>
          <b>{{ download.seeds }}</b>
        </div>
        <div class="download-item-col">
          {{ $t('downloads.leechs') }}:<br/>
          <b>{{ download.leechs }}</b>
        </div>
        <div class="download-item-col">
          {{ $t('downloads.status') }}:<br/>
          <b>{{ statusName() }}</b>
        </div>
      </div>
      <div class="download-item-row">
        <div class="download-item-col">
          {{ $t('downloads.speed') }}:<br/>
          <b>{{ toSpeed(download.downloadSpeed) }}</b>
        </div>
        <div class="download-item-col">
          {{ $t('downloads.downloaded') }}:<br/>
          <b>{{ toSize(download.downloaded) }} / {{ toSize(download.size) }}</b>
        </div>
        <div class="download-item-col">
          {{ $t('downloads.eta') }}:<br/>
          <b v-if="download.state === 'downloading'">{{ toTime(download.eta) }}</b>
          <b v-else>-</b>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import {DownloadDto} from "@/dto/downloadDto";
import {useI18n} from "vue-i18n";
import {IonProgressBar} from "@ionic/vue";
import numbro from "numbro";

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
      switch (props.download.state) {
        case "downloading":
          return t('downloads.statuses.downloading');
        case "stalledDL":
          return t('downloads.statuses.stalled');
        case "pausedDL":
          return t('downloads.statuses.paused');
      }

      return props.download.state;
    };

    const downloadBuffer = () => {
      if (props.download.state === 'downloading') {
        return props.download.progress;
      }

      return 1;
    }

    const isCompleted = () => {
      return props.download.progress === 1;
    }

    const isPaused = () => {
      return props.download.state === 'pausedDL';
    }

    const isWaiting = () => {
      return props.download.status === 'stalledDL';
    }

    const toSpeed = (v) => {
      let val = v;
      let unit = 'B/s';
      let mantissa = 0;

      if (val > 1048576) {
        val = val / 1048576;
        unit = 'MB/s';
        mantissa = 2;
      } else if (val > 1024) {
        val = val / 1024;
        unit = 'kB/s';
        mantissa = 2;
      }

      return numbro(val).format({
        thousandSeparated: true,
        mantissa: mantissa,
      }) + ' ' + unit;
    }

    const toSize = (v) => {
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

    const toTime = (v) => {
      let val = v;
      let unit = 's';
      let mantissa = 0;

      if (val > 86400) {
        val = val / 86400;
        unit = 'd';
        mantissa = 2;
      } else if (val > 3600) {
        val = val / 3600;
        unit = 'h';
        mantissa = 2;
      } else if (val > 60) {
        val = val / 60;
        unit = 'm';
        mantissa = 0;
      }

      return numbro(val).format({
        thousandSeparated: true,
        mantissa: mantissa,
      }) + ' ' + unit;
    }

    return {
      statusName,
      downloadBuffer,
      isCompleted,
      isPaused,
      isWaiting,
      toSpeed,
      toSize,
      toTime
    };
  }
}
</script>
