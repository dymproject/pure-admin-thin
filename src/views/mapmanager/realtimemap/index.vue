<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import openMap from "/@/components/OpenlayersMap/Map.vue";
import carTree from "./components/CarTree.vue";
import { CarTreeProfile, decryptJWT, getLastTrack } from "/@/api/map";
import { TrackData, TrackDataProfile } from "/@/api/map";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { storageSession } from "/@/utils/storage";
import { loadEnv } from "@build/index";
import { ElMessageBox } from "element-plus";
const trackTableData = ref([]);
const trackTable = ref();
//巡检数据
const deviceCheckData = ref([]);
const deviceCheckTable = ref();
//终端参数数据
const deviceParamsData = ref([]);
const deviceParamsTable = ref();
//命令数据
const commandData = ref([]);
const cmdTable = ref();
//标签页model-value
const tabsValue = ref("first");

const getList = () => {
  getLastTrack().then((result: any) => {
    trackTableData.value = result;
    map.value.addCar(result);
  });
};
getList();

const map = ref();
const tree = ref();
onMounted(() => {
  let olviewports = document.getElementsByClassName("ol-viewport");
  if (olviewports.length > 1) {
    olviewports[0].setAttribute("style", "display:none");
  }

  let eloverlays = document.getElementsByClassName("el-overlay");
  if (eloverlays.length > 1) {
    const drawer = eloverlays[1] as HTMLElement;
    drawer.style.position = "absolute";
  }
});
const treeClickEvent = (data: any) => {
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

const commandOption = reactive({
  show: false,
  commandSwitch: true,
  title: "",
  mac: "",
  mtype: null,
  checkedNodes: []
});

const treeRightClickEvent = (event: any, data: any, node: any) => {
  carCommandModels.value = [];
  if (!data.isOrganization) {
    tree.value.treeRef.setChecked(node.key, true);
    const checkedNodes = tree.value.treeRef.getCheckedNodes();
    checkedNodes.forEach((node: CarTreeProfile) => {
      const { mac, mtype, label } = node;
      carCommandModels.value.push({
        mac: mac,
        mtype: mtype,
        plateNo: label,
        sendTime: new Date().toLocaleString()
      });
    });
    commandOption.commandSwitch = true;
    commandOption.show = true;
    tabsValue.value = "fourth";
    commandOption.title = node.label + "-控制面板";
    treeClickEvent(data);
  }
};
interface CarCommandModel {
  mac: string;
  mtype: number;
  plateNo: string;
  sendTime: string;
}
const carCommandModels = ref<Array<CarCommandModel>>();

//执行简单命令
const excuteSimpleCommand = (commandName: string) => {
  connection.invoke(
    "ExcuteCommand",
    token,
    carCommandModels.value,
    commandName,
    null
  );
};
//设置回传间隔
const setReturnInterval = () => {
  ElMessageBox.prompt("请输入间隔时间：单位（秒/S)", "设置回传间隔", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /^[1-9]\d*|0$/,
    inputErrorMessage: "间隔时间为正整数"
  })
    .then(({ value }) => {
      connection.invoke(
        "ExcuteCommand",
        token,
        carCommandModels,
        "setreturninterval",
        value
      );
    })
    .catch(() => {});
};

//发送tts文字消息
const sendTtsMessage = () => {
  ElMessageBox.prompt("请输入TTS文字消息", "TTS文字消息", {
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  })
    .then(({ value }) => {
      connection.invoke(
        "ExcuteCommand",
        token,
        carCommandModels,
        "sendttsmessage",
        value
      );
    })
    .catch(() => {});
};

//设置超速报警
const setSpeedAlarm = () => {
  ElMessageBox.prompt("请输入报警速度：单位（km/h)", "设置报警速度", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /^[1-9]\d*|0$/,
    inputErrorMessage: "请输入正整数"
  })
    .then(({ value }) => {
      connection.invoke(
        "ExcuteCommand",
        token,
        carCommandModels,
        "setspeedalarm",
        value
      );
    })
    .catch(() => {});
};

//设置工作模式
const setWorkMode = () => {
  ElMessageBox.prompt("设置工作模式（1GPS.2北斗.3联合定位）", "工作模式", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /^[1-3]$/,
    inputErrorMessage: "请按要求输入各模式所代表的数字"
  })
    .then(({ value }) => {
      connection.invoke(
        "ExcuteCommand",
        token,
        carCommandModels,
        "setworkmode",
        value
      );
    })
    .catch(() => {});
};

const tableDblClick = (row: { row: TrackData }) => {
  const record: TrackData = row.row;
  //移动到地图中心
  map.value.moveToMapCenter([record.longitude, record.latitude]);
  //设置跟踪车辆
  map.value.setFollowCar(record);
};

const listenTracks = (trackData: TrackData) => {
  //移动车辆
  if (trackData.locate) {
    map.value.moveCar(trackData);
  }
  //更新实时table
  const record: TrackDataProfile = trackTableData.value.find(
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
interface CommandRecordDto {
  id: string;
  mac: string;
  plateNo: string;
  sendTime: string;
  commandName: string;
  responseTime: string;
  responseDescription: string;
}
const listenCommand = (data: CommandRecordDto) => {
  const record = commandData.value.find((cr: CommandRecordDto) => {
    return cr.id == data.id;
  });
  if (record) {
    record.responseDescription = data.responseDescription;
    record.responseTime = data.responseTime;
  } else {
    commandData.value.push(data);
    cmdTable.value.loadData(commandData.value);
  }
};

const listenPatrol = (data: any) => {
  deviceCheckData.value.push(data);
  deviceCheckTable.value.loadData(deviceCheckData.value);
};

const listenParameters = (data: any) => {
  deviceParamsData.value.push(data);
  deviceParamsTable.value.loadData(deviceParamsData.value);
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
//监听命令数据
connection.on("ListenCommand", listenCommand);
//监听终端巡检树
connection.on("ListenPatrol", listenPatrol);
//监听终端参数查询
connection.on("ListenParameters", listenParameters);
//重新加载tree数据
const reloadTreeData = () => {
  connection.invoke("ReloadTreeData", token.TenantId, token.OrganizationId);
};
const RefreshOfflineCars = () => {
  setInterval(() => {
    connection.invoke(
      "RefreshOfflineCars",
      token.TenantId,
      token.OrganizationId
    );
  }, 1000 * 20);
};
RefreshOfflineCars();
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
          <el-drawer
            v-model="commandOption.show"
            direction="btt"
            size="50%"
            custom-class="cmddrawer"
            :with-header="true"
            :title="commandOption.title"
            @closed="tabsValue = `first`"
          >
            <div>
              <el-row>
                <el-col :span="8">
                  <vxe-button
                    size="small"
                    class="cmd-button"
                    content="位置查询"
                    @click="excuteSimpleCommand('locationquery')"
                  />
                </el-col>
                <el-col :span="8">
                  <vxe-button
                    size="small"
                    class="cmd-button"
                    content="终端巡检"
                    @click="excuteSimpleCommand('devicecheck')"
                  />
                </el-col>
                <el-col :span="8">
                  <vxe-button
                    size="small"
                    class="cmd-button"
                    content="终端参数查询"
                    @click="excuteSimpleCommand('deviceparamssearch')"
                  />
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <vxe-button
                    size="small"
                    class="cmd-button"
                    content="设置回传间隔"
                    @click="setReturnInterval"
                  />
                </el-col>
                <el-col :span="8">
                  <vxe-button
                    size="small"
                    class="cmd-button"
                    content="发送tts消息"
                    @click="sendTtsMessage"
                  />
                </el-col>
                <el-col :span="8">
                  <vxe-button
                    size="small"
                    class="cmd-button"
                    content="超速报警设置"
                    @click="setSpeedAlarm"
                  />
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <vxe-button
                    size="small"
                    class="cmd-button"
                    content="设置工作模式"
                    @click="setWorkMode"
                  />
                </el-col>
              </el-row>
            </div>
          </el-drawer>
        </div>
      </el-col>
      <el-col :span="18">
        <el-row>
          <el-col>
            <open-map ref="map" :zoom="12" :center="[116.405668, 39.90607]" />
          </el-col>
          <el-col>
            <el-tabs type="border-card" v-model="tabsValue">
              <el-tab-pane label="实时位置" name="first">
                <vxe-table
                  ref="trackTable"
                  border
                  height="240"
                  show-header-overflow
                  show-overflow
                  :row-config="{
                    isCurrent: true,
                    isHover: true,
                    keyField: 'mac'
                  }"
                  :data="trackTableData"
                  @cell-dblclick="tableDblClick"
                >
                  <vxe-column
                    type="seq"
                    align="center"
                    title="序号"
                    width="60"
                  />
                  <vxe-column field="plateNo" title="车牌号" min-width="150" />
                  <vxe-column field="orgName" title="单位" min-width="200" />
                  <vxe-column field="mac" title="识别码" min-width="150" />
                  <vxe-column field="sim" title="SIM卡" min-width="150" />
                  <vxe-column
                    field="gnssTime"
                    title="定位时间"
                    min-width="180"
                  />
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
                  <vxe-column
                    field="locateMode"
                    title="定位模式"
                    min-width="100"
                  />
                  <vxe-column
                    field="mileage"
                    title="里程(km)"
                    min-width="100"
                  />
                  <vxe-column
                    field="signalStrength"
                    title="场强"
                    min-width="100"
                  />
                  <vxe-column
                    field="satellitenCount"
                    title="卫星数"
                    min-width="100"
                  />
                  <vxe-column field="precision" title="精度" min-width="100" />
                  <vxe-column field="battery" title="电量" min-width="100" />
                </vxe-table>
              </el-tab-pane>
              <el-tab-pane label="巡检信息" name="second">
                <vxe-table
                  :align="`left`"
                  height="240"
                  :data="deviceCheckData"
                  ref="deviceCheckTable"
                >
                  <vxe-column
                    type="seq"
                    align="center"
                    title="序号"
                    width="60"
                  />
                  <vxe-column field="plateNo" title="车牌号" />
                  <vxe-column field="mac" title="识别码" />
                  <vxe-column field="csq" title="信号强度" />
                  <vxe-column field="vstar" title="可见星数" />
                  <vxe-column field="ustar" title="可用星数" />
                  <vxe-column field="snr" title="卫星信噪比" />
                  <vxe-column field="deviceMessage" title="设备信息" />
                </vxe-table>
              </el-tab-pane>
              <el-tab-pane label="终端参数信息" name="third">
                <vxe-table
                  :align="`left`"
                  height="240"
                  :data="deviceParamsData"
                  ref="deviceParamsTable"
                >
                  <vxe-column
                    type="seq"
                    align="center"
                    title="序号"
                    width="60"
                  />
                  <vxe-column field="plateNo" title="车牌号" />
                  <vxe-column field="mac" title="识别码" />
                  <vxe-column field="csq" title="信号强度" />
                  <vxe-column field="callTypeStr" title="跟踪方式" />
                  <vxe-column field="callInterval" title="跟踪间隔" />
                  <vxe-column field="version" title="终端固件版本" />
                </vxe-table>
              </el-tab-pane>
              <el-tab-pane label="命令信息" name="fourth">
                <vxe-table height="240" :data="commandData" ref="cmdTable">
                  <vxe-column
                    type="seq"
                    align="center"
                    title="序号"
                    width="60"
                  />
                  <vxe-column field="plateNo" title="车牌号" />
                  <vxe-column field="mac" title="识别码" />
                  <vxe-column field="id" title="指令标识" :visible="false" />
                  <vxe-column field="commandName" title="指令名称" />
                  <vxe-column field="sendTime" title="发出时间" />
                  <vxe-column field="responseTime" title="反馈时间" />
                  <vxe-column field="responseDescription" title="反馈结果" />
                </vxe-table>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.car-tree {
  background-color: #d7f7ed;
  position: relative;
}

.cmddrawer {
  position: absolute !important;
}

.tree-div {
  padding: 10px;
  background-color: #d7f7ed;
  position: relative;
  overflow: hidden;
}

.cmd-button {
  width: 95%;
  margin: 2px;
}

:deep() .el-tabs--border-card > .el-tabs__content {
  padding: 0px;
}
</style>
