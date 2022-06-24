<script setup lang="ts">
import { ElTreeV2 } from "element-plus";
import { ref } from "vue";
import {
  CarTreeProfile,
  getCarTree,
  TrackData,
  TreeIconColorEnum
} from "/@/api/map";

const emit = defineEmits(["reload-tree-data"]);

const props = {
  value: "id",
  label: "label",
  children: "children"
};
const treeRef = ref<InstanceType<typeof ElTreeV2>>();
const treeData = ref();
const initTree = () => {
  getCarTree().then((result: any) => {
    treeData.value = result;
  });
};
const updateTreeNode = (trackData: TrackData) => {
  function traverse(nodes: CarTreeProfile[]) {
    nodes.forEach(node => {
      const children = node.children;
      if (node.trackData && node.trackData.mac == trackData.mac) {
        if (node.color == TreeIconColorEnum.black) {
          emit("reload-tree-data");
        }
        if (!trackData.locate) {
          node.color = TreeIconColorEnum.white;
        } else if (trackData.alarm) {
          node.color = TreeIconColorEnum.red;
        } else if (trackData.speed > 0) {
          node.color = TreeIconColorEnum.green;
        } else if (trackData.speed == 0) {
          node.color = TreeIconColorEnum.yellow;
        } else {
          node.color = TreeIconColorEnum.black;
        }
        node.trackData = trackData;
        return;
      }
      if (children) {
        traverse(children);
      }
    });
  }
  const nodes = treeData.value as CarTreeProfile[];
  traverse(nodes);
};

initTree();

defineExpose({ treeData, updateTreeNode });
</script>

<template>
  <el-tree-v2 ref="treeRef" :data="treeData" :props="props">
    <template #default="{ node, data }">
      <span class="custom-tree-node">
        <span style="margin: 5px">
          <iconify-icon-offline
            v-if="!node.isLeaf"
            icon="fa-home"
            :color="'#4B4B4B'"
          />
          <iconify-icon-offline
            v-else
            icon="fa-automobile"
            :color="data.color"
          />
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
