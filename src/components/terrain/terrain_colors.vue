<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl-layers";
import * as THREE from "three";
import { ThreeLayer } from "maptalks.three";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      }),
      layers: [],
    });
    /**
     * groupLayer
     */
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: {
          enable: true,
        },
      },
    };

    const colors4 = [
      [0, "#F0F9E9"],
      [200, "#D7EFD1"],
      [400, "#A6DCB6"],
      [650, "#8FD4BD"],
      [880, "#67C1CB"],
      [1100, "#3C9FC8"],
      [1300, "#1171B1"],
      [1450, "#085799"],
      [1600, "#084586"],
    ];
    /**
     * 新版本的maptalks-gl里添加了地形着色的支持
     * https://mdpress.glicon.design/p/5enoiCkUaADcSh76yCKjp/DETU/dexing.html
     * 版本问题没出来
     */
    const terrain = {
      type: "mapbox",
      tileSize: 256,
      maxAvailableZoom: 14,
      requireSkuToken: false,
      urlTemplate: "data/terrain/tiles_dem/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c", "d"],
      colors: colors4,
      exaggeration: 14, //夸张
    };
    this.groupLayer = new GroupGLLayer("group", [], {
      terrain,
    });
    this.groupLayer.addTo(this.map);
  },

  methods: {},
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
