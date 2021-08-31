<template>
  <div class="incoming-item">
    <div class="incoming-item-name">{{ incoming.name }}</div>
    <ion-progress-bar class="my-2" color="success" :value="1"/>
  </div>
</template>

<script>
import {IncomingDto} from "@/dto/incomingDto";

export default {
  name: "IncomingItem",
  components: {},
  props: {
    incoming: {
      type: IncomingDto
    }
  },
}
</script>

<style scoped>

</style>