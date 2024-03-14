<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import * as dat from "dat.gui";
import { Map, TileLayer, GeoJSON } from "maptalks";
import { HeatLayer } from "maptalks.heatmap";
export default {
  components: {},

  data() {
    return {
      map: null,
      heatmapLayer: null,
      heatSymbol: {
        radius: 25, //点半径
        blur: 15, //模糊半径
        gradient: "style1",
        // gradient: { //样式选择
        //   0.4: "blue",
        //   0.6: "cyan",
        //   0.7: "lime",
        //   0.8: "yellow",
        //   1.0: "red",
        // },
      },
    };
  },

  computed: {},

  mounted() {
    this.map = new Map("map", {
      center: [116.96457, 40.5138],
      zoom: 8,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });
    this.initGui();
    this.getWfsData();
  },

  methods: {
    /**
     * cnpm i maptalks.heatmap --save
     * 是maptalks.Layer 的子类，继承了所有的方法
     * new HeatLayer(id, data, options)
     * 一、属性
     * id          String           图层id
     * data        Array[]          [[x, y, value], [x, y, value]..]
     * options     Object {}
     *      1-max               	Number		最大数据值（默认为1）
     *      2-radius           	    Number		点半径（默认为25）
     *      3-blur              	Number		模糊半径（默认为15）
     *      4-minOpacity  	        Number		最小点不透明度（默认为0.05）
     *      5-heatValueScale 	    Number		比例值（默认为1）
     *      6-gradient 		        Object		渐变色 {<stop>: '<color>'}, 默认 { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
     *      7-其他options同maptalks.Layer
     *
     * 二、config
     * 配置层的选项，并在必要时重新绘制层
     * heatLayer.config('max', 10);
     * heatLayer.config({
     *  'radius' : 80,
     *  'blur' : 30,
     *  'gradient' : {0.4: 'blue', 0.65: 'lime', 1: 'red'}
     * });
     *
     * 三、方法
     * 1-getData                Returns Array[]
     * 2-setData(data)          Array[]
     * 3-addPoint(point)        Array[] 例如[[x, y, value], [x, y, value]..]
     * 4-redraw()               重新绘制
     * 5-isEmpty()              Returns Boolean   是否空
     * 6-clear()
     * 7-toJSON(options)        例：仅导出地图当前范围中的点
     *                              heatLayer.toJSON({
     *                                  'clipExtent' : map.getExtent()
     *                              });
     */
    getWfsData() {
      fetch(`data/json/data_MiYun_Point.json`)
        .then((response) => response.json())
        .then((json) => {
          GeoJSON.toGeometryAsync(json).then((geos) => {
            let data = geos.map((p) => {
              let coordinate = p.getCoordinates();
              return [[coordinate.x, coordinate.y]];
            });
            let { radius, blur, gradient } = this.heatSymbol;
            gradient = {
              0.4: "blue",
              0.6: "cyan",
              0.7: "lime",
              0.8: "yellow",
              1.0: "red",
            };
            this.addHeatMapLayer({
              id: "heat_1",
              data,
              radius,
              blur,
              gradient,
            });
          });
        });
    },
    addHeatMapLayer(options) {
      let { id, data, radius, blur, gradient } = options;
      this.heatmapLayer = new HeatLayer(id, data, {
        radius,
        blur,
        gradient,
        heatValueScale: 0.7,
        forceRenderOnRotating: true,
        forceRenderOnMoving: true,
        forceRenderOnZooming: true,
      }).addTo(this.map);
    },
    initGui() {
      /**
       * GUI
       */
      this.gui = new dat.GUI();
      this.gui.domElement.style = "position:absolute;top:10px;left:10px";
      const HeatMapSymbol = this.gui.addFolder("热力图");
      HeatMapSymbol.add(this.heatSymbol, "radius")
        .min(0)
        .max(100)
        .step(1)
        .name("半径大小")
        .onChange((value) => {
          this.heatmapLayer.config({
            radius: value,
          });
        });
      HeatMapSymbol.add(this.heatSymbol, "blur")
        .min(0)
        .max(100)
        .step(1)
        .name("聚焦大小")
        .onChange((value) => {
          this.heatmapLayer.config({
            blur: value,
          });
        });
      HeatMapSymbol.add(this.heatSymbol, "gradient", ["style1", "style2"])
        .name("热度色带")
        .onChange((value) => {
          let gradient;
          if (value === "style1") {
            gradient = {
              0.2: "#3c1cc1",
              0.4: "#b74df4",
              0.6: "#ea89ed",
              0.8: "#fbb9b9",
              1.0: "#f5df3d",
            };
          }
          if (value === "style2") {
            gradient = {
              0.4: "#225220",
              0.6: "#7dad00",
              0.7: "#fff000",
              0.8: "#ffa101",
              1.0: "#fd2300",
            };
          }
          this.heatmapLayer.config({
            gradient,
          });
        });
      HeatMapSymbol.open();
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
