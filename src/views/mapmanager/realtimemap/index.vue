<script setup lang="ts">
import openMap from "./components/Map.vue";
import carTree from "./components/CarTree.vue";
import LocationTable from "./components/LocationTable.vue";
import { reactive } from "vue";

import { mapCarItem } from "./type";
const $pageOption = reactive({
  mapCarItems: Array<mapCarItem>()
});
$pageOption.mapCarItems = [
  {
    plateNo: "京12345",
    longitude: 116.285982,
    latitude: 39.8304
  },
  { plateNo: "京sfsfs", longitude: 116.397497, latitude: 39.907631 }
];
</script>

<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6"><car-tree style="height: 100%" /></el-col>
      <el-col :span="18">
        <el-row>
          <el-col><open-map :map-car-items="$pageOption.mapCarItems" /></el-col>
          <el-col><location-table /> </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped></style>
