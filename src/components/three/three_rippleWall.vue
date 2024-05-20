<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
     <button type="" @click="addLayer">添加</button>
      <button type="" @click="removeLayer">移除</button>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl-layers";

import SceneEffect from "@/sceneEffect/SceneEffect"

export default {
  components: {},

  data() {
    return {
      map: null,
      sceneEffect:null
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.33092, 40.00056],
      zoom: 15,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", //dark_all
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });
    this.sceneEffect=new SceneEffect(this.map)
  },

  methods: {
    addLayer(){
     this.sceneEffect.addLayer()
    },
    removeLayer(){
      this.sceneEffect.removeLayer()
    }
  },
};
</script>
<style>
.control {
  position: absolute;
  z-index: 999;
  left: 10px;
  top: 10px;
}
</style>
