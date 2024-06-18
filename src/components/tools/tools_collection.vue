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
      <button @click="roamScene">场景漫游</button>
      <button @click="roamClear">漫游清除</button>
      <br />
      <el-form>
        <el-radio-group v-model="optionValue" @change="onChange">
          <el-radio
            v-for="item in plainOptions"
            :key="item.value"
            :label="item.value"
            :label-class="item.labelClass"
            :disabled="item.disabled"
          >
            {{ item.label }}
          </el-radio>
        </el-radio-group>

        <div v-if="optionValue === 'decimalSystem'">
          <el-form-item label="经度">
            <el-input v-model="coordValueGroup.group1.longitude"></el-input>
          </el-form-item>
          <el-form-item label="纬度">
            <el-input v-model="coordValueGroup.group1.latitude"></el-input>
          </el-form-item>
          <el-form-item label="高度">
            <el-input v-model="coordValueGroup.group1.altitude"></el-input>
          </el-form-item>
        </div>
        <div v-if="optionValue === 'MinutesSeconds'">
          <el-row :gutter="24" style="margin: 0">
            <el-form-item label="经度">
              <el-col :span="7">
                <el-input
                  v-model="coordValueGroup.group2.longitude.degree"
                  style="width: 80px"
                />
                <span>度</span>
              </el-col>
              <el-col :span="7">
                <el-input
                  v-model="coordValueGroup.group2.longitude.minute"
                  style="width: 80px"
                />
                <span>分</span>
              </el-col>
              <el-col :span="7">
                <el-input
                  v-model="coordValueGroup.group2.longitude.second"
                  style="width: 80px"
                />
                <span>秒</span>
              </el-col>
            </el-form-item>
          </el-row>
          <el-row :gutter="24" style="margin: 0">
            <el-form-item label="纬度">
              <el-col :span="7">
                <el-input
                  v-model="coordValueGroup.group2.latitude.degree"
                  style="width: 80px"
                />
                <span>度</span>
              </el-col>
              <el-col :span="7">
                <el-input
                  v-model="coordValueGroup.group2.latitude.minute"
                  style="width: 80px"
                />
                <span>分</span>
              </el-col>
              <el-col :span="7">
                <el-input
                  v-model="coordValueGroup.group2.latitude.second"
                  style="width: 80px"
                />
                <span>秒</span>
              </el-col>
            </el-form-item>
          </el-row>
          <el-row :gutter="24" style="margin: 0px 20px 0 3px">
            <el-form-item label="高程">
              <el-input v-model="coordValueGroup.group2.altitude" />
            </el-form-item>
          </el-row>
        </div>
        <el-form-item>
          <el-button type="primary" @click="pickup">图上拾取</el-button>
          <el-button type="primary" @click="location">坐标定位</el-button>
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
import Roam from "./Tools/Roam/Roam";
export default {
  components: {},

  data() {
    return {
      map: null,
      measure: null,
      //UI
      optionValue: "decimalSystem",
      plainOptions: [
        { label: "十进制", value: "decimalSystem" },
        { label: "度分秒", value: "MinutesSeconds" },
      ],
      coordValueGroup: {
        group1: {
          longitude: 116.400175,
          latitude: 39.914497,
          altitude: 0,
        },
        group2: {
          longitude: {
            degree: "",
            minute: "",
            second: "",
          },
          latitude: {
            degree: "",
            minute: "",
            second: "",
          },
          altitude: "",
        },
      },
    };
  },

  computed: {},

  mounted() {
    this.map = new Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
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
    this.roam = new Roam(this.map);
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
     * 场景漫游
     */
    roamScene() {
      this.roam.init();
    },
    roamClear() {
      this.roam.clear();
    },
    /**
     * 坐标
     */
    onChange(e) {
      this.optionValue = e;
    },
    pickup() {
      this.coordPosition.pick(this.setCoordValue);
    },
    location() {
      if (this.optionValue != "decimalSystem") this.formatConversion(2);
      let val = this.coordValueGroup.group1;
      if (val.longitude && val.latitude) {
        let coord = {
          longitude: this.coordValueGroup.group1.longitude,
          latitude: this.coordValueGroup.group1.latitude,
        };
        this.coordPosition.flyTo(coord);
      } else {
        this.$message.error("坐标值无效，无法定位");
      }
    },
    setCoordValue(position) {
      this.coordValueGroup.group1.longitude = position.x;
      this.coordValueGroup.group1.latitude = position.y;
      this.coordValueGroup.group1.altitude = 0;
      this.formatConversion(1);
    },
    formatConversion(flag) {
      if (flag == 1) {
        let coordValueGroup1 = this.coordValueGroup.group1;
        let lon = this.coordPosition.DDDToDMS(coordValueGroup1.longitude);
        let lat = this.coordPosition.DDDToDMS(coordValueGroup1.latitude);
        let alt = coordValueGroup1.altitude;
        this.coordValueGroup.group2 = {
          longitude: {
            degree: lon[0],
            minute: lon[1],
            second: lon[2],
          },
          latitude: {
            degree: lat[0],
            minute: lat[1], 
            second: lat[2],
          },
          altitude: alt,
        };
      } else if (flag == 2) {
        let coordValueGroup2 = this.coordValueGroup.group2;
        let lon = this.coordPosition.DMSToDDD([
          coordValueGroup2.longitude.degree,
          coordValueGroup2.longitude.minute,
          coordValueGroup2.longitude.second,
        ]);
        let lat = this.coordPosition.DMSToDDD([
          coordValueGroup2.latitude.degree,
          coordValueGroup2.latitude.minute,
          coordValueGroup2.latitude.second,
        ]);
        let alt = coordValueGroup2.altitude;
        this.coordValueGroup.group1 = {
          longitude: lon,
          latitude: lat,
          altitude: alt,
        };
      }
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
