<template>
  <div>
    <vxe-modal width="600" v-model="modalVisable" show-footer> 123 </vxe-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const modalVisable = computed(() => {
  return props.visible;
});
</script>

<style>
.example {
  color: red;
}
</style>
