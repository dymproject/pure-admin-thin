<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import CarTreeSelect from "/@/components/CarTreeSelect/CarTreeSelect.vue";
import openMap from "/@/components/OpenlayersMap/Map.vue";
import { getHistoryTrack } from "/@/api/map";
import { VXETable } from "vxe-table";
const searchData = reactive({
  carId: null,
  minSpeed: 0,
  locate: true,
  startTime: new Date().toLocaleDateString() + " 00:00:00",
  endTime: new Date().toLocaleDateString() + " 23:59:59"
});

const formRules = {
  carId: [{ required: true, message: "请选择车辆" }]
};
const tableData = ref();
const trackTable = ref();
const map = ref();

onMounted(() => {
  var olviewports = document.getElementsByClassName("ol-viewport");
  if (olviewports.length > 1) {
    olviewports[0].setAttribute("style", "display:none");
  }
});

const replayOption = reactive({
  playSpeed: 1,
  playInterval: null
});
clearInterval(replayOption.playInterval);
const searchEvent = () => {
  tableData.value = [];
  map.value.clear();
  clearInterval(replayOption.playInterval);

  getHistoryTrack(searchData).then((result: any) => {
    if (result.length == 0) {
      VXETable.modal.message({
        content: "未查询到历史数据！",
        status: "warning"
      });
      return;
    }
    result.forEach(trackData => {
      trackData.tableIndex = new Date(trackData.gnssTime).getTime();
    });
    //划线
    map.value.addLine(result);
    //填充table
    tableData.value = result;
    var trackData = result[0];
    map.value.moveToMapCenter([trackData.longitude, trackData.latitude]);
    map.value.addCar([trackData]);
    let i = 1;

    replayOption.playInterval = setInterval(() => {
      //移动车辆
      map.value.moveCar(result[i]);

      var row = trackTable.value.getRowById(result[i].tableIndex);
      trackTable.value.setCurrentRow(row);
      trackTable.value.scrollToRow(row);
      i++;
      if (i == result.length - 1) {
        clearInterval(replayOption.playInterval);
      }
    }, (1 - (replayOption.playSpeed - 1)) * 200);
  });
};
</script>

<template>
  <div>
    <el-card>
      <el-row>
        <el-col :span="24">
          <vxe-form :data="searchData" :rules="formRules" @submit="searchEvent">
            <vxe-form-item title="车辆" field="carId" :item-render="{}">
              <template #default="{ data }">
                <car-tree-select v-model="data.carId" />
              </template>
            </vxe-form-item>
            <vxe-form-item title="时间" field="replayTime" :item-render="{}">
              <template #default="{ data }">
                <vxe-input v-model="data.startTime" type="datetime" />
                <vxe-input v-model="data.endTime" type="datetime" />
              </template>
            </vxe-form-item>
            <vxe-form-item title="最小速度" field="minSpeed" :item-render="{}">
              <template #default="{ data }">
                <vxe-input
                  v-model="data.minSpeed"
                  type="number"
                  :clearable="false"
                  style="width: 100px"
                />
              </template>
            </vxe-form-item>
            <vxe-form-item title="是否定位" field="locate" :item-render="{}">
              <template #default="{ data }">
                <vxe-select v-model="data.locate" style="width: 80px">
                  <vxe-option :key="-1" :value="undefined" :label="`全部`" />
                  <vxe-option :key="1" :value="true" :label="`是`" />
                  <vxe-option :key="0" :value="false" :label="`否`" />
                </vxe-select>
              </template>
            </vxe-form-item>
            <vxe-form-item title="播放速度" field="playSpeed" :item-render="{}">
              <template #default="{}">
                <vxe-select
                  v-model="replayOption.playSpeed"
                  style="width: 80px"
                >
                  <vxe-option
                    v-for="num in 5"
                    :key="num"
                    :value="`${1 + (num - 1) * 0.25}`"
                    :label="`${1 + (num - 1) * 0.25}倍`"
                  />
                </vxe-select>
              </template>
            </vxe-form-item>
            <vxe-form-item>
              <template #default>
                <vxe-button type="submit" status="primary" content="回放" />
                <vxe-button type="submit" status="warning" content="停止" />
              </template>
            </vxe-form-item>
          </vxe-form>
        </el-col>
      </el-row>
      <el-row style="margin-top: 15px">
        <el-col :span="24">
          <open-map ref="map" :zoom="12" :center="[116.405668, 39.90607]" />
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <vxe-table
            ref="trackTable"
            border
            height="280"
            show-header-overflow
            show-overflow
            :row-config="{
              isCurrent: true,
              isHover: true,
              keyField: 'tableIndex'
            }"
            :data="tableData"
            class="footer"
          >
            <vxe-column type="seq" align="center" title="序号" width="60" />
            <vxe-column field="plateNo" title="车牌号" min-width="150" />
            <vxe-column field="orgName" title="单位" min-width="200" />
            <vxe-column field="mac" title="识别码" min-width="150" />
            <vxe-column field="sim" title="SIM卡" min-width="150" />
            <vxe-column field="gnssTime" title="定位时间" min-width="180" />
            <vxe-column field="longitude" title="经度" min-width="100" />
            <vxe-column field="latitude" title="纬度" min-width="100" />
            <vxe-column field="speed" title="速度" min-width="80" />
            <vxe-column field="heading" title="方向" min-width="80" />
            <vxe-column field="position" title="位置" min-width="200" />
            <vxe-column field="statusStr" title="状态" min-width="100" />
            <vxe-column field="locate" title="是否定位" min-width="100">
              <template #default="{ row }">
                {{ row.locate ? "是" : "否" }}
              </template>
            </vxe-column>
            <vxe-column field="locateMode" title="定位模式" min-width="100" />
            <vxe-column field="mileage" title="里程(km)" min-width="100" />
            <vxe-column field="signalStrength" title="场强" min-width="100" />
            <vxe-column
              field="satellitenCount"
              title="卫星数"
              min-width="100"
            />
            <vxe-column field="precision" title="精度" min-width="100" />
            <vxe-column field="battery" title="电量" min-width="100" />
          </vxe-table>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped></style>
