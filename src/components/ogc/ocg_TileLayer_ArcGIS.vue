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
    };
  },

  computed: {},

  mounted() {
    console.log(maptalks.SpatialReference, "API未暴露");
    /**
     * SpatialReference.loadArcgis = function (url, cb, options) {
     *       loadArcgis(url, cb, options);
     *       return this;
     * };
     * 
     * url读取里面的json文件，从而读取空间参考
     */
    const arcUrl =
      "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer";
    maptalks.SpatialReference.loadArcgis(`${arcUrl}?f=pjson`, (err, conf) =>{
      if (err) {
        throw new Error(err);
      }
      //重新赋值获取的spatialReference
      const ref = conf.spatialReference;
      ref.projection = "EPSG:3857";
      ref.fullExtent = null;
      this.map = new maptalks.Map("map", {
        center: [116.39259, 39.90473],
        zoom: 3,
        pitch: 0,
        bearing: 0,
        spatialReference: ref,
        baseLayer: new maptalks.TileLayer("tile", {
          tileSystem: conf.tileSystem,
          tileSize: conf.tileSize,
          urlTemplate: arcUrl + "/tile/{z}/{y}/{x}",
        }),
        layers: [],
      });
    });
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
