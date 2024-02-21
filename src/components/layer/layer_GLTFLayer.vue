<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import * as maptalks from "maptalks";
import {GroupGLLayer, VectorTileLayer,GLTFMarker,GLTFLayer,PolygonLayer,} from "@maptalks/gl-layers";
export default {
  components: {},

  data() {
    return {
      map: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 15,
      pitch: 60,
      centerCross: false,
      doubleClickZoom: false,
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
    });

    this.addGLTFLayer();
  },

  methods: {
    /**
     * maptalks webgl 图层的汇总包;
     * 包含的插件
     * @maptalks/gl
     * @maptalks/analysis
     * @maptalks/vt
     * @maptalks/gltf-layer
     * @maptalks/3dtiles
     * @maptalks/video-layer@maptalks/transform-control
     * @maptalks/msd-json-loader
     */
    addGLTFLayer() {
      const symbol = {
        url: "data/model/Cesium_Air.glb",
        modelHeight: 240,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        rotationZ: 180,
      };

      const gltfLayer = new GLTFLayer("gltf").addTo(this.map);
      const gltfMarker = new GLTFMarker(this.map.getCenter(), {
        symbol,
      });
      gltfLayer.addGeometry(gltfMarker);
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
