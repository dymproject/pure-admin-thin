<script setup lang="ts">
import { reactive } from "vue";
import { getDictonaryChildrenByCode } from "/@/api/dictonary";

const props = defineProps<{ dictonaryCode: string; placeholder: string }>();

const selectOption = reactive({
  data: [],
  value: ""
});
defineExpose({ selectOption });

const initDict = () => {
  getDictonaryChildrenByCode(props.dictonaryCode).then((selectData: any) => {
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
      :value="option.code"
      :label="option.name"
    />
  </vxe-select>
</template>

<style scoped></style>
