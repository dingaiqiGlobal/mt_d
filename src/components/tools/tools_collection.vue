<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button @click="measureDistance">测量距离</button>
      <button @click="measureArea">测量面</button>
      <button @click="measureClear">清除测量</button>
      <br />
      <button @click="plotPoint">标绘点</button>
      <button @click="plotLineString">标绘线</button>
      <button @click="plotPolygon">标绘面</button>
      <button @click="plotClear">清空数据</button>
    </div>
  </div>
</template>

<script>
import { Map, TileLayer } from "maptalks";
import Measure from "./Tools/Measure/Measure";
import Plot from "./Tools/Plot/Plot";
export default {
  components: {},

  data() {
    return {
      map: null,
      measure: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", //dark_all
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });

    this.measure = new Measure(this.map);
    this.plot = new Plot(this.map);
  },

  methods: {
    measureDistance() {
      this.measure.measureEnable("spatialDistance");
    },
    measureArea() {
      this.measure.measureEnable("spatialArea");
    },
    measureClear() {
      this.measure.measureClear();
    },
    plotPoint() {
      this.plot.plotEnable("Point");
    },
    plotLineString() {
      this.plot.plotEnable("LineString");
    },
    plotPolygon() {
      this.plot.plotEnable("Polygon");
    },
    plotClear() {
      this.plot.clear();
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
