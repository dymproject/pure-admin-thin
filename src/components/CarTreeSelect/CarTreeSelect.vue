<script setup lang="ts">
import { reactive } from "vue";
import { getCarTree } from "/@/api/map";
const selectOption = reactive({
  data: [],
  value: ""
});
const initialSelect = () => {
  getCarTree().then((result: any) => {
    selectOption.data = result;
  });
};
initialSelect();
defineExpose({ initialSelect });
</script>

<template>
  <el-tree-select
    value-key="id"
    filterable
    v-model="selectOption.value"
    :data="selectOption.data"
  />
</template>

<style scoped></style>
