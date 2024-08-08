<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button @click="modeTMS">tms方式</button>
      <button @click="modeWMTS">WMTS方式</button>
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
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.41439, 39.91671],
      zoom: 10,
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
    const sceneConfig = {};
    this.groupLayer = new GroupGLLayer("group", [], {
      sceneConfig,
    });
    this.groupLayer.addTo(this.map);
  },

  methods: {
    modeTMS() {
      const vt = new VectorTileLayer("tms", {
        urlTemplate: `http://192.168.201.162:8088/geoserver/gwc/service/tms/1.0.0/zhjy%3Adongchenggroup@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`,
        tms: true, //这个参数必须设置
        style: "data/json/mapbox-light/style_mapbox_dongcheng.json",
      });
      this.groupLayer.addLayer(vt);
    },
    modeWMTS() {
      const url = `
                http://192.168.201.162:8088/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=zhjy:dongchenggroup&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}
                `;
      const vt = new VectorTileLayer("wmts", {
        urlTemplate: url,
        //style: "data/json/mapbox-light/style_mapbox_dongcheng.json",
      });
      this.groupLayer.addLayer(vt);
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
