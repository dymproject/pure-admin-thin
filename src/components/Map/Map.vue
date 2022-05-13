<script setup lang="ts">
import "ol/ol.css";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Map, View } from "ol";
import { reactive, nextTick } from "vue";

const $pageOption = reactive({ map: null });

const initMap = () => {
  $pageOption.map = new Map({
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ],
    target: "map",
    view: new View({
      center: [0, 0],
      zoom: 2
    })
  });
};
nextTick(() => {
  initMap();
});
</script>

<template>
  <div>
    <div id="map" class="map" />
  </div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 800px;
}
</style>
