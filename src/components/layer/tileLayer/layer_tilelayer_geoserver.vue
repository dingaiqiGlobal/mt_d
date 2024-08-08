<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button @click="addWMSLayer">WMS</button>
      <button @click="addWMTSLayer">WMTS</button>
    </div>
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
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
      spatialReference: {
        projection: "EPSG:3857",
      },
    });
  },

  methods: {
    addWMSLayer() {
      const wmsTileLayer = new maptalks.WMSTileLayer("wms", {
        service: "WMS",
        layers: "zhjy:HDJD",
        styles: "",
        format: "image/png",
        version: "1.3.0",
        crs: "EPSG:3857",
        urlTemplate: "http://192.168.201.162:8088/geoserver/wms",
      }).addTo(this.map);
    },
    //WMTS GetTile方法
    addWMTSLayer() {
      const url = `
                http://192.168.201.162:8088/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=zhjy:n110101_quxianjie_wp&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=image/png&TILECOL={x}&TILEROW={y}
                `;
      const tileLayer = new maptalks.TileLayer("tileLayer", {
        urlTemplate: url,
      }).addTo(this.map);
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
