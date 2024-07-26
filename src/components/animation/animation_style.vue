<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, LineStringLayer } from "@maptalks/gl-layers";
import axios from "axios";

export default {
  components: {},

  data() {
    return {
      map: null,
      lineStringLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", //dark_all
      }),
      layers: [],
    });
    /**
     * 必须是LineStringLayer（样式属性才有linePatternAnimSpeed）
     */
    this.lineStringLayer = new LineStringLayer("vector", {
      enableAltitude: true,
      enableBloom: true,
    });
    /**
     * groupLayer
     */
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true },
        bloom: {
          //开启泛光
          enable: true,
          threshold: 0,
          factor: 1,
          radius: 0.02,
        },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [this.lineStringLayer], {
      sceneConfig,
    });
    this.groupLayer.addTo(this.map);
    this.getJsonData();
  },

  methods: {
    getJsonData() {
      fetch("data/json/bj/beijing_point.json")
        .then((res) => res.json())
        .then((geojson) => {
          const startPoint = geojson.features.find(
            (feature) => feature.properties.NAME === "起始点"
          ).geometry.coordinates;
          const paths = geojson.features
            .filter((feature) => feature.properties.NAME !== "起始点") // 排除起始点
            .map((feature) => ({
              from: feature.properties.NAME,
              to: "起始点",
              coordinates: [feature.geometry.coordinates, startPoint],
            }));
          console.log(paths, "***坐标格式***");
          this.addLines(paths);
        });
    },
    addLines(data) {
      const lines = data.map((d) => {
        const [c1, c2] = d.coordinates;
        const line = new maptalks.LineString(this.arcLinePoints(c1, c2), {
          symbol: {
            //Patter(图案)
            linePatternFile: "data/json/bj/path_yellow.png",
            //linePatternGap: 1,//填充图片之间的间隔宽度
            linePatternAnimSpeed: -0.5, //线流动：动画速度，取值范围-5到5，为负数时，动画方向会变为反向的
            lineWidth: 8,
          },
        });
        return line;
      });
      this.lineStringLayer.addGeometry(lines);
    },
    //在两个点之间线性的插入一定的数量点
    arcLinePoints(c1, c2, pointNumbers = 100) {
      if (!(c1 instanceof maptalks.Coordinate)) {
        c1 = new maptalks.Coordinate(c1);
      }
      if (!(c2 instanceof maptalks.Coordinate)) {
        c2 = new maptalks.Coordinate(c2);
      }
      const distance = this.map.computeLength(c1, c2);
      const x1 = c1.x,
        y1 = c1.y,
        x2 = c2.x,
        y2 = c2.y;
      const dx = x2 - x1,
        dy = y2 - y1;
      const coordinates = [];
      for (let i = 0; i <= pointNumbers; i++) {
        const x = (dx / pointNumbers) * i + x1;
        const y = (dy / pointNumbers) * i + y1;
        const height = (Math.sin((Math.PI * i) / pointNumbers) * distance) / 4;
        coordinates.push([x, y, height]);
      }
      return coordinates;
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
