<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, Geo3DTilesLayer,SkylineAnalysis } from "@maptalks/gl-layers";

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
     * 3dtiles
     */
    const geo3DTilesLayer = new Geo3DTilesLayer("Geo3DTilesLayer", {
      geometryEvents: true,
      services: [
        {
          url: "data/3dtiles/bim/tileset.json",
          maximumScreenSpaceError: 16,
          ambientLight: [0.2, 0.2, 0.2],
          heightOffset: 8,
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
          coordOffset: [0, 0],
        },
      ],
    });
    geo3DTilesLayer.once("loadtileset", (e) => {
      const extent = geo3DTilesLayer.getExtent(e.index);
      this.map.fitExtent(extent, 0, {
        animation: false,
      });
    });
    /**
     * groupLayer
     */
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [geo3DTilesLayer], { sceneConfig });
    this.groupLayer.addTo(this.map);

    /**
     * 天际线
     */
    let skylineAnalysis = new SkylineAnalysis({
      lineColor: [234 / 12, 107 / 23, 72 / 255],
      lineWidth: 1,
    });
    skylineAnalysis.addTo(this.groupLayer);
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
