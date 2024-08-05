<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";

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
      spatialReference: {
        projection: "EPSG:3857",
      },
    });
    /**
     * 每一个TileLayer实例都会拥有一个webgl上下文,
     * 浏览器里webgl的上下文数量是有限的,页面里创建了大量的 
     * TileLayer导致超出浏览器的上限，所以才会导致这个错误,
     * 解决方式时将 TileLayer放到GroupTileLayer里，
     * 让所有的TileLayer公用一个webgl上下文
     */
    const baseLayerGroup = new maptalks.GroupTileLayer("base", [
      new maptalks.TileLayer("tile", {
        // tileSystem: [1, -1, -180, 90],
        urlTemplate:
          "http://t0.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=21c1e34286caecc25fd94be94bfbe119",
        spatialReference: {
          projection: "EPSG:3857",
        },
      }),
      new maptalks.TileLayer("boudaries", {
        urlTemplate:
          "http://t0.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=21c1e34286caecc25fd94be94bfbe119",
        spatialReference: {
          projection: "EPSG:3857",
        },
      }),
    ]).addTo(this.map);
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
