<script setup lang="ts">
import { reactive } from "vue";
import { getOrgTree } from "/@/api/organization";

const treeOption = reactive({
  data: [],
  value: ""
});
defineExpose({ treeOption });
const initOrg = () => {
  getOrgTree().then((treeData: any) => {
    treeOption.data = treeData;
  });
};
initOrg();
</script>

<template>
  <el-tree-select
    v-model="treeOption.value"
    size="default"
    style="width: 100%"
    check-strictly="true"
    :data="treeOption.data"
  />
</template>

<style scoped></style>
