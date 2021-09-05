<template>
  <div class="incoming-item">
    <div class="incoming-item-name">{{ incoming.name }}</div>
    <ion-progress-bar class="my-2" color="success" :value="1"/>
  </div>
</template>

<script>
import {IncomingDto} from "@/dto/incomingDto";
import {IonProgressBar} from "@ionic/vue";

export default {
  name: "IncomingItem",
  components: {
    IonProgressBar
  },
  props: {
    incoming: {
      type: IncomingDto
    }
  },
}
</script>

<style scoped>

</style>