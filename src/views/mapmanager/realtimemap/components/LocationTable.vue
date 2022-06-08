<script setup lang="ts">
import { getLastTrack } from "/@/api/map";
import { reactive } from "vue";
const $pageOption = reactive({
  tableData: []
});
const getList = () => {
  getLastTrack().then((result: any) => {
    console.log(result);
    $pageOption.tableData = result;
  });
};
getList();
</script>

<template>
  <vxe-table
    border
    height="200"
    show-header-overflow
    show-overflow
    :row-config="{ isHover: true }"
    :data="$pageOption.tableData"
    class="footer"
  >
    <vxe-column type="seq" align="center" title="序号" width="60" />
    <vxe-column field="plateNo" title="车牌号" min-width="100" />
    <vxe-column field="orgName" title="单位" min-width="100" />
    <vxe-column field="mac" title="识别码" min-width="150" />
    <vxe-column field="sim" title="SIM卡" min-width="150" />
    <vxe-column field="gnssTime" title="定位时间" min-width="150" />
    <vxe-column field="longitude" title="经度" min-width="100" />
    <vxe-column field="latitude" title="纬度" min-width="100" />
    <vxe-column field="speed" title="速度" min-width="80" />
    <vxe-column field="heading" title="方向" min-width="80" />
    <vxe-column field="status" title="状态" min-width="100" />
    <vxe-column field="locateMode" title="定位模式" min-width="100" />
    <vxe-column field="mileage" title="里程(km)" min-width="100" />
    <vxe-column field="signalStrength" title="场强" min-width="100" />
    <vxe-column field="satellitenCount" title="卫星数" min-width="100" />
    <vxe-column field="precision" title="精度" min-width="100" />
    <vxe-column field="battery" title="电量" min-width="100" />
  </vxe-table>
</template>

<style scoped></style>
