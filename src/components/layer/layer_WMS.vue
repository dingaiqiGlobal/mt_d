<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
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
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
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

    this.addWMSLayer();
  },

  methods: {
    addWMSLayer() {
      const wmsTileLayer = new maptalks.WMSTileLayer("wms", {
        tileSystem: [1, -1, -180, 90],
        urlTemplate: "http://192.168.201.162:8088/geoserver/wms",
        crs: "EPSG:3857",
        layers: "zhjy:HDJD",
        styles: "",
        version: "1.3.0",
        format: "image/png",
        transparent: true,
        uppercase: true,
      });
      /**
       * 瓦片请求是简单的image get请求，
       * 因为浏览器缓存策略的问题，
       * 如果瓦片地址一样，会触发浏览器缓存策略,
       * 导致前端并没有真实的再次去请求后台的瓦片,
       * 导致显示的瓦片还是上一次的请求的结果，
       * 这时就需要我们手动的绕过 浏览器缓存策略
       */
      wmsTileLayer.getTileUrl = function (x, y, z) {
        let url = maptalks.WMSTileLayer.prototype.getTileUrl.call(this, x, y, z);
        url += `&t=${new Date().getTime()}`;
        return url;
      };
      /**
       * 由于业务的需要WMSTileLayer的数据可能是动态，
       * 业务里期望隔一段时间就去更新WMSTileLayerr的内容,
       * 这时就需要去强制刷新WMSTileLayer
       */
      //wmsLayer.forceReload();
      this.map.addLayer(wmsTileLayer);
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
