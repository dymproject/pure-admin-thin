<script setup lang="ts">
import { reactive } from "vue";
import { getDictonaryChildren } from "/@/api/dictonary";

const props = defineProps<{ dictonaryId: number; placeholder: string }>();

const selectOption = reactive({
  data: [],
  value: ""
});
defineExpose({ selectOption });

const initDict = () => {
  getDictonaryChildren(props.dictonaryId).then((selectData: any) => {
    selectOption.data = selectData;
  });
};
initDict();
</script>

<template>
  <vxe-select v-model="selectOption.value" :placeholder="props.placeholder">
    <vxe-option
      v-for="option in selectOption.data"
      :key="option.id"
      :value="option.id"
      :label="option.name"
    />
  </vxe-select>
</template>

<style scoped></style>
