<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
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
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.414390,39.916710],
      zoom: 15,
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
      // postProcess: {
      //   enable: true,
      //   antialias: { enable: true },
      // },
    };
    this.groupLayer = new GroupGLLayer("group", [], {
      sceneConfig,
    });
    this.groupLayer.addTo(this.map);
    this.addMapBoxLayer()
  },

  methods: {
    /**
     * 矢量切片服务-tileserver
     * 样式-MapTalks Designer制作（与mapbox不是一套）
     */
    addMapBoxLayer() {
      const vt = new VectorTileLayer("vt", {
        urlTemplate:`http://192.168.201.166:8081/data/dongcheng/{z}/{x}/{y}.pbf`,
        style: "data/json/mapbox-light/style_mapbox_dongcheng.json",
      });
      this.groupLayer.addLayer(vt)
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
