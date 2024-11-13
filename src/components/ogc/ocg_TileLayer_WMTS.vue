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
     * SpatialReference.loadWMTS = function (url, cb, options) {
     *       loadArcgis(url, cb, options);
     *       return this;
     * };
     *
     * url读取里面的json文件，从而读取空间参考
     * 添加参数&request=GetCapabilities&service=wmts
     */
    const url =
      "http://t0.tianditu.gov.cn/img_c/wmts?tk=21c1e34286caecc25fd94be94bfbe119&request=GetCapabilities&service=wmts";
    maptalks.SpatialReference.loadWMTS(url, (err, conf) => {
      if (err) {
        throw new Error(err);
      }
      //重新赋值获取的spatialReference
      const params = conf[0];
      params.urlTemplate += "&tk=6901643c38b65f1f9770196343cf72b2";
      console.log(params);
      let spatialReference = params.spatialReference;
      this.map = new maptalks.Map("map", {
        center: [116.39259, 39.90473],
        zoom: 12,
        pitch: 0,
        bearing: 0,
        spatialReference:spatialReference,
        baseLayer: new maptalks.TileLayer("tile", params),
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
