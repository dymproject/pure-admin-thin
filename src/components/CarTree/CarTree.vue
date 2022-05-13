<script setup lang="ts">
import { reactive } from "vue";
import { getCarTree } from "/@/api/map";

const props = {
  value: "id",
  label: "label",
  children: "children"
};
const $pageOption = reactive({
  data: []
});
const initTree = () => {
  getCarTree().then((result: any) => {
    $pageOption.data = result;
    console.log(result);
  });
};
initTree();
</script>

<template>
  <el-tree-v2 :data="$pageOption.data" :props="props" :height="800">
    <template #default="{ node, data }">
      <span class="custom-tree-node">
        <span style="margin: 5px">
          <iconify-icon-offline icon="office-building" :color="'#000000'" />
        </span>
        <span>
          <span>{{ node.label }}</span>
        </span>
      </span>
      <span
        class="custom-tree-node"
        :style="{ justifyContent: 'flex-end' }"
        v-if="!node.isLeaf"
      >
        <a> ({{ data.onlineCount }}/{{ data.count }}) </a>
      </span>
    </template>
  </el-tree-v2>
</template>

<style scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  padding: 5px;
  align-items: center;
  font-size: 14px;
  padding-right: 20px;
  justify-content: flex-start;
}
</style>
