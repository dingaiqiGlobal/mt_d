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
      <br />
      <el-form>
        <el-form-item label="坐标格式">
          <el-radio-group v-model="coordinateFormat">
            <el-radio label="decimal">十进制</el-radio>
            <el-radio label="dms">度分秒</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="经度">
          <el-input v-model="longitude"></el-input>
        </el-form-item>
        <el-form-item label="纬度">
          <el-input v-model="latitude"></el-input>
        </el-form-item>
        <el-form-item label="高度">
          <el-input v-model="altitude"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handlePickOnMap">图上拾取</el-button>
          <el-button type="primary" @click="handleLocateCoordinates">坐标定位</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { Map, TileLayer } from "maptalks";
import Measure from "./Tools/Measure/Measure";
import Plot from "./Tools/Plot/Plot";
import CoordPosition from "./Tools/CoordPosition/CoordPosition";
export default {
  components: {},

  data() {
    return {
      map: null,
      measure: null,
      //UI
      coordinateFormat: "decimal", // 默认选择十进制
      longitude: 116,
      latitude: 39,
      altitude: 0,
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
    this.coordPosition = new CoordPosition(this.map);
  },

  methods: {
    /**
     * 测量
     */
    measureDistance() {
      this.measure.measureEnable("spatialDistance");
    },
    measureArea() {
      this.measure.measureEnable("spatialArea");
    },
    measureClear() {
      this.measure.measureClear();
    },
    /**
     *标绘
     */
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
    /**
     * 坐标
     */
    handlePickOnMap() {
      this.coordPosition.pick(this.setCoordValue);
    },
    handleLocateCoordinates() {
      let coord = {
        longitude: this.longitude,
        latitude: this.latitude,
      };
      this.coordPosition.flyTo(coord);
    },
    setCoordValue(position) {
      this.longitude = position.x;
      this.latitude = position.y;
      this.altitude = 0;
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
