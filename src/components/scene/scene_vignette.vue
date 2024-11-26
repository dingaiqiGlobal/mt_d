<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-checkbox v-model="checked" @change="this.changeChecked"
        >暗角</el-checkbox
      >
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, VectorTileLayer } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      checked: false,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 18,
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
    const vtLayer = new VectorTileLayer("vt", {
      urlTemplate:
        "http://tile.maptalks.com/test/planet-single/{z}/{x}/{y}.mvt",
      style: "data/json/maptalks/road.json",
    });
    const sceneConfig = {};
    this.groupLayer = new GroupGLLayer("group", [vtLayer], {
      sceneConfig,
    });
    this.groupLayer.addTo(this.map);
  },

  methods: {
    changeChecked(value) {
      const postProcess = {
        enable: true,
        antialias: { enable: true },
        vignette: { enable: value },
      };
      this.map.setPostProcessConfig(postProcess); //API未暴露
    },
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
