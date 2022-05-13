<script setup lang="ts">
import openMap from "/@/components/Map/Map.vue";
import carTree from "/@/components/CarTree/CarTree.vue";
</script>

<template>
  <div>
    <el-container style="position: relative">
      <el-aside width="300px"> <car-tree /></el-aside>
      <el-container>
        <el-main style="padding: 0px 0px 0px 10px"><open-map /></el-main>
        <el-footer>Footer</el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped></style>
