<script setup lang="ts">
import { nextTick, reactive } from "vue";
import { Map as OpenLayersMap, Overlay, View } from "ol";
import "ol/ol.css";
import { Vector as VectorSource, XYZ } from "ol/source";
import { Icon, Style, Text } from "ol/style";
import { Vector as VectorLayer, Tile as TileLayer } from "ol/layer";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Coordinate } from "ol/coordinate";

import { TrackData, TrackDataProfile } from "/@/api/map";
import run from "/@/assets/car/run.png";
import stop from "/@/assets/car/stop.png";
// import alarm from "/@/assets/car/alarm.png";
import nogps from "/@/assets/car/nogps.png";
import off from "/@/assets/car/off.png";

//视图
const view = new View({
  center: [116.405668, 39.90607],
  zoom: 12,
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
  latitude: null
});
const initMap = () => {
  const infoPopup = document.getElementById("popup");
  const popupOverLay = new Overlay({
    element: infoPopup,
    positioning: "bottom-center",
    stopEvent: false
  });

  const map = new OpenLayersMap({
    layers: [baseTileLayer, carVectorLayer],
    target: "map",
    view: view,
    overlays: [popupOverLay]
  });
  map.on("click", function (evt) {
    const feature = map.forEachFeatureAtPixel(
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
      popupOverLay.setPosition(evt.coordinate);
      infoPopup.style.display = "block";
    } else {
      infoPopup.style.display = "none";
    }
  });
};

const getFeatureImageUrl = (item: TrackData): string => {
  let seconds =
    (new Date().getTime() - new Date(item.gnssTime).getTime()) / 1000;
  if (seconds < 180) {
    if (item.speed > 0) {
      return run;
    } else if (item.speed == 0) {
      return stop;
    } else {
      return nogps;
    }
  } else {
    return off;
  }
};
let carFeatureMap = new Map();

const addFeature = (trackDataList: TrackDataProfile[]) => {
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
      }),
      text: new Text({
        font: "14px sans-serif",
        rotation: (Math.PI / 180) * trackData.heading,
        offsetX: 0,
        offsetY: -20,
        text: trackData.plateNo
      })
    });
    carFeature.setStyle(iconStyle);
    carFeature.set("extData", trackData);
    carVectorSource.addFeature(carFeature);
    carFeatureMap.set(trackData.mac, carFeature);
  });
};
nextTick(() => {
  initMap();
});
//以此点为中心，移动地图
const moveToMapCenter = (coordinate: Coordinate) => {
  view.setCenter(coordinate);
};
//移动车辆图标
const moveCar = (trackData: TrackData) => {
  const currentFeature = carFeatureMap.get(trackData.mac) as Feature;
  currentFeature.setGeometry(
    new Point([trackData.longitude, trackData.latitude])
  );
  const extData = currentFeature.get("extData") as TrackDataProfile;
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
  currentFeature.setStyle(iconStyle);
};
defineExpose({ moveToMapCenter, addFeature, initMap, moveCar });
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
  min-width: 280px;
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
