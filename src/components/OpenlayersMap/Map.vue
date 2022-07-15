<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { Map as OpenLayersMap, Overlay, View } from "ol";
import "ol/ol.css";
import { Vector as VectorSource, XYZ } from "ol/source";
import { Icon, Stroke, Style, Text } from "ol/style";
import { Vector as VectorLayer, Tile as TileLayer } from "ol/layer";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Coordinate } from "ol/coordinate";
import { LineString } from "ol/geom";

import { TrackData, TrackDataProfile } from "/@/api/map";
import run from "/@/assets/car/run.png";
import stop from "/@/assets/car/stop.png";
import alarm from "/@/assets/car/alarm.png";
import nogps from "/@/assets/car/nogps.png";
import off from "/@/assets/car/off.png";
import start from "/@/assets/car/start.png";
import end from "/@/assets/car/end.png";

const props = defineProps<{ zoom: number; center: Array<number> }>();
const olMap = ref<OpenLayersMap>();
//视图
const view = new View({
  center: props.center,
  zoom: props.zoom,
  projection: "EPSG:4326"
});
//底图
const baseTileLayer = new TileLayer({
  source: new XYZ({
    url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}"
  })
});
//车辆资源
const carVectorSource = new VectorSource({});
//车辆底图
const carVectorLayer = new VectorLayer({
  source: carVectorSource,
  zIndex: 999
});
const info = reactive({
  plateNo: "",
  orgName: "",
  longitude: null,
  latitude: null,
  gnssTime: null
});
const initMap = () => {
  const infoPopup = document.getElementById("popup");
  const popupOverLay = new Overlay({
    element: infoPopup,
    positioning: "bottom-center",
    stopEvent: false
  });

  olMap.value = new OpenLayersMap({
    layers: [baseTileLayer, carVectorLayer],
    target: "map",
    view: view,
    overlays: [popupOverLay]
  });
  olMap.value.on("click", function (evt) {
    const feature = olMap.value.forEachFeatureAtPixel(
      evt.pixel,
      function (feature: Feature) {
        return feature;
      }
    );
    if (feature) {
      const extData = feature.get("extData") as TrackDataProfile;
      info.plateNo = extData.plateNo;
      info.longitude = extData.longitude;
      info.latitude = extData.latitude;
      info.orgName = extData.orgName;
      info.gnssTime = extData.gnssTime;
      popupOverLay.setPosition(evt.coordinate);
      infoPopup.style.display = "block";
    } else {
      infoPopup.style.display = "none";
    }
  });
};

onMounted(() => {
  initMap();
});

const getFeatureImageUrl = (item: TrackData): string => {
  let seconds =
    (new Date().getTime() - new Date(item.gnssTime).getTime()) / 1000;
  if (seconds < 180) {
    if (!item.locate) {
      return nogps;
    } else if (item.alarm) {
      return alarm;
    } else if (item.speed > 0) {
      return run;
    } else if (item.speed == 0) {
      return stop;
    }
  } else {
    return off;
  }
};
let carFeatureMap = new Map();

//画线
const addLine = (trackDataList: TrackDataProfile[]) => {
  let path = [];
  trackDataList.forEach(trackData => {
    path.push([trackData.longitude, trackData.latitude]);
  });
  const line = new Feature({
    geometry: new LineString(path)
  });
  const lineStyle = new Style({
    stroke: new Stroke({ color: "#ff0000", width: 3 })
  });
  line.setStyle(lineStyle);
  carVectorSource.addFeature(line);
  //设置起终点
  const lineGeometry = line.getGeometry();
  const startPoint = lineGeometry.getFirstCoordinate();
  const endPoint = lineGeometry.getLastCoordinate();
  const startFeature = new Feature({
    geometry: new Point(startPoint),
    name: "start",
    population: 4000,
    rainfall: 500
  });
  const iconStyle = new Style({
    image: new Icon({
      anchor: [0.5, 0.8],
      src: start
    })
  });
  startFeature.setStyle(iconStyle);
  const endFeature = startFeature.clone();
  endFeature.setGeometry(new Point(endPoint));
  const endIconStyle = iconStyle.clone();
  endIconStyle.setImage(
    new Icon({
      anchor: [0.5, 0.8],
      src: end
    })
  );
  endFeature.setStyle(endIconStyle);
  carVectorSource.addFeature(startFeature);
  carVectorSource.addFeature(endFeature);
};

const addCar = (trackDataList: TrackDataProfile[]) => {
  //车辆数据
  trackDataList.forEach(trackData => {
    const carFeature = new Feature({
      geometry: new Point([trackData.longitude, trackData.latitude]),
      name: trackData.plateNo,
      population: 4000,
      rainfall: 500
    });
    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        rotation: (Math.PI / 180) * trackData.heading,
        src: getFeatureImageUrl(trackData)
      })
    });
    carFeature.setStyle(iconStyle);
    carFeature.set("extData", trackData);
    carVectorSource.addFeature(carFeature);
    carFeatureMap.set(trackData.mac, carFeature);
  });
};
const clear = () => {
  carFeatureMap = new Map();
  carVectorSource.clear();
};

//以此点为中心，移动地图
const moveToMapCenter = (coordinate: Coordinate) => {
  view.setCenter(coordinate);
};
//移动车辆
const moveCar = (trackData: TrackData) => {
  const currentFeature = carFeatureMap.get(trackData.mac) as Feature;

  if (followFeature.value) {
    const extData = followFeature.value.get("extData") as TrackDataProfile;
    if (trackData.mac == extData.mac) {
      //移动到地图中心
      moveToMapCenter([trackData.longitude, trackData.latitude]);
    }
  }
  currentFeature.setGeometry(
    new Point([trackData.longitude, trackData.latitude])
  );
  const currentFeatureStyle = currentFeature.getStyle() as Style;
  const currentFeatureImage = new Icon({
    anchor: [0.5, 0.5],
    rotation: (Math.PI / 180) * trackData.heading,
    src: getFeatureImageUrl(trackData)
  });
  currentFeatureStyle.setImage(currentFeatureImage);
};
//设置车辆跟踪
const followFeature = ref<Feature>();
const setFollowCar = (trackData: TrackData) => {
  //取消原来追踪车辆的显示文字
  if (followFeature.value) {
    const followFeatureStyle = followFeature.value.getStyle() as Style;
    followFeatureStyle.setText(null);
  }
  //设置追踪车辆的显示文字
  followFeature.value = carFeatureMap.get(trackData.mac);
  const extData = followFeature.value.get("extData") as TrackDataProfile;
  const iconStyle = new Style({
    image: new Icon({
      anchor: [0.5, 0.5],
      rotation: (Math.PI / 180) * trackData.heading,
      src: getFeatureImageUrl(trackData)
    }),
    text: new Text({
      font: "14px sans-serif",
      rotation: (Math.PI / 180) * trackData.heading,
      offsetX: 0,
      offsetY: -20,
      text: extData.plateNo
    })
  });
  followFeature.value.setStyle(iconStyle);
};

//车辆下线
const setCarOffline = (macs: string[]) => {
  macs.forEach((mac: string) => {
    const feature = carFeatureMap.get(mac) as Feature;
    const featureStyle = feature.getStyle() as Style;
    const featurImage = featureStyle.getImage() as Icon;
    if (featurImage.getSrc().indexOf("off") > -1) {
      return;
    }
    const extData = feature.get("extData") as TrackDataProfile;
    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        rotation: (Math.PI / 180) * extData.heading,
        src: off
      })
    });
    feature.setStyle(iconStyle);
  });
};
defineExpose({
  olMap,
  clear,
  moveToMapCenter,
  addCar,
  addLine,
  initMap,
  moveCar,
  setCarOffline,
  setFollowCar
});
</script>

<template>
  <div id="map" class="map" />
  <div id="popup" style="display: none" class="ol-popup">
    <div id="popup-content">
      <el-row>
        <el-col :span="12">车牌号</el-col>
        <el-col :span="12">{{ info.plateNo }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="12">单位</el-col>
        <el-col :span="12">{{ info.orgName }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="12">经度</el-col>
        <el-col :span="12">{{ info.longitude }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="12">纬度</el-col>
        <el-col :span="12">{{ info.latitude }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="12">定位时间</el-col>
        <el-col :span="12">{{ info.gnssTime }}</el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 600px;
}

.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 480px;
}

.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}

.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}

.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
</style>
