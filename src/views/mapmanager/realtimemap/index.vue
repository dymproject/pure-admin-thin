<script setup lang="ts">
import { onMounted, ref } from "vue";
import { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";
import openMap from "/@/components/OpenlayersMap/Map.vue";
import carTree from "./components/CarTree.vue";
import { decryptJWT, getLastTrack } from "/@/api/map";
import { TrackData, TrackDataProfile } from "/@/api/map";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { storageSession } from "/@/utils/storage";
import { loadEnv } from "@build/index";
const tableData = ref([]);
const trackTable = ref();
//位置数据map
let trackDataMap = new Map();

const getList = () => {
  getLastTrack().then((result: any) => {
    tableData.value = result;
    map.value.addCar(result);
  });
};
getList();

const map = ref();
const tree = ref();
onMounted(() => {
  var olviewports = document.getElementsByClassName("ol-viewport");
  if (olviewports.length > 1) {
    olviewports[0].setAttribute("style", "display:none");
  }
});
const treeClickEvent = (data: TreeNodeData) => {
  if (!data.isOrganization) {
    const { trackData } = data;
    if (trackData) {
      map.value.moveToMapCenter([trackData.longitude, trackData.latitude]);
      map.value.setFollowCar(trackData);
      var row = trackTable.value.getRowById(trackData.mac);
      trackTable.value.setCurrentRow(row);
      trackTable.value.scrollToRow(row);
    }
  }
};
const treeRightClickEvent = (e: Event, data: TreeNodeData) => {
  var trackData = data.trackData as TrackData;
  console.log(trackData);
  // const trackData = tableData.value.find((x: TrackData) => {
  //   return x.carId == 4;
  // });
  // map.value.moveCarFeature(tableData.value[0]);
};

const tableDblClick = (row: { row: TrackData }) => {
  const record: TrackData = row.row;
  //移动到地图中心
  map.value.moveToMapCenter([record.longitude, record.latitude]);
  //设置跟踪车辆
  map.value.setFollowCar(record);
};

const listenTracks = (trackData: TrackData) => {
  //填充trackdatamap
  trackDataMap.set(trackData.mac, trackData);
  //移动车辆
  if (trackData.locate) {
    map.value.moveCar(trackData);
  }
  //更新实时table
  const record: TrackDataProfile = tableData.value.find(
    (data: TrackDataProfile) => {
      return data.mac == trackData.mac;
    }
  );
  record.gnssTime = trackData.gnssTime;
  record.longitude = trackData.longitude;
  record.latitude = trackData.latitude;
  record.speed = trackData.speed;
  record.heading = trackData.heading;
  record.statusStr = trackData.statusStr;
  record.locateMode = trackData.locateMode;
  record.mileage = trackData.mileage;
  record.position = trackData.position;
  record.signalStrength = trackData.signalStrength;
  record.satellitenCount = trackData.satellitenCount;
  record.precision = trackData.precision;
  record.battery = trackData.battery;
  //更新tree
  tree.value.updateTreeNode(trackData);
};

const listenTreeData = (data: any) => {
  tree.value.setData(data);
};
const listenOfflineCar = (data: string[]) => {
  map.value.setCarOffline(data);
};

//获取token
const { accessToken } = storageSession.getItem("info");
const token = decryptJWT(accessToken);

//初始化signalr HubConnection对象
const connection = new HubConnectionBuilder()
  .withUrl(loadEnv().VITE_PROXY_DOMAIN_REAL + "/hubs/chathub", {
    accessTokenFactory: () => accessToken
  })
  .build();
//启动连接
connection.start();
//监听track数据
connection.on("ListenTracks", listenTracks);
//监听tree数据
connection.on("ListenTreeData", listenTreeData);
//监听刷新离线mac数据
connection.on("ListenOfflineCar", listenOfflineCar);
//重新加载tree数据
const reloadTreeData = () => {
  connection.send("ReloadTreeData", token.TenantId, token.OrganizationId);
};
const refreshCarStatus = () => {
  setInterval(() => {
    connection.send("RefreshCarStatus", token.TenantId, token.OrganizationId);
  }, 1000 * 20);
};
refreshCarStatus();
</script>

<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="tree-div">
          <car-tree
            ref="tree"
            class="car-tree"
            @reload-tree-data="reloadTreeData"
            @node-contextmenu="treeRightClickEvent"
            @node-click="treeClickEvent"
            :height="860"
          />
        </div>
      </el-col>
      <el-col :span="18">
        <el-row>
          <el-col>
            <open-map ref="map" :zoom="12" :center="[116.405668, 39.90607]" />
          </el-col>
          <el-col>
            <vxe-table
              ref="trackTable"
              border
              height="280"
              show-header-overflow
              show-overflow
              :row-config="{ isCurrent: true, isHover: true, keyField: 'mac' }"
              :data="tableData"
              @cell-dblclick="tableDblClick"
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
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.car-tree {
  background-color: #d7f7ed;
}

.tree-div {
  padding: 10px;
  background-color: #d7f7ed;
  position: relative;
  overflow: hidden;
}
</style>
