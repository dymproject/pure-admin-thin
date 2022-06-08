<script setup lang="ts">
import { reactive, nextTick } from "vue";
import "ol/ol.css";
import XYZ from "ol/source/XYZ";
import { Map, Overlay, View } from "ol";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import { Icon, Style, Text } from "ol/style";
import { Vector as VectorLayer, Tile as TileLayer } from "ol/layer";

import { mapCarItem } from "../type";
import runpng from "/@/assets/car/run.png";

const props = defineProps<{
  mapCarItems: Array<mapCarItem>;
}>();

const $pageOption = reactive({
  map: null,
  carFeatures: [],
  carItemPopup: {
    plateNo: "123456"
  }
});

const initMap = () => {
  //车辆数据
  props.mapCarItems.forEach(mapCarItem => {
    const iconFeature = new Feature({
      geometry: new Point([mapCarItem.longitude, mapCarItem.latitude]),
      name: mapCarItem.plateNo,
      population: 4000,
      rainfall: 500
    });

    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        rotation: 45, //方向
        src: runpng
      }),
      text: new Text({
        font: "15px sans-serif",
        rotation: 45,
        offsetX: 0,
        offsetY: -16,
        text: mapCarItem.plateNo
      })
    });
    iconFeature.setStyle(iconStyle);
    iconFeature.set("extData", mapCarItem);
    $pageOption.carFeatures.push(iconFeature);
  });
  //地图
  $pageOption.map = new Map({
    layers: [
      new VectorLayer({
        source: new VectorSource({
          features: $pageOption.carFeatures
        }),
        zIndex: 999
      }),
      new TileLayer({
        source: new XYZ({
          url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}"
        })
      })
    ],
    target: "map",
    view: new View({
      center: [116.405668, 39.90607],
      zoom: 12,
      projection: "EPSG:4326"
    })
  });
  const element = document.getElementById("popup");

  const popup = new Overlay({
    element: element,
    positioning: "bottom-center",
    stopEvent: false
  });
  $pageOption.map.addOverlay(popup);
  $pageOption.map.on("click", function (evt) {
    const feature = $pageOption.map.forEachFeatureAtPixel(
      evt.pixel,
      function (feature: Feature) {
        return feature;
      }
    );
    if (feature) {
      var extData = feature.get("extData") as mapCarItem;
      $pageOption.carItemPopup.plateNo = extData.plateNo;
      popup.setPosition(evt.coordinate);
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  });
};
nextTick(() => {
  initMap();
});
</script>

<template>
  <div id="map" :mapCarItems="mapCarItems" class="map" />
  <div id="popup" class="ol-popup">
    <div id="popup-content">{{ $pageOption.carItemPopup.plateNo }}</div>
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
