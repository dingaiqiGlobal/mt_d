<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
    </div>
  </div>
</template>

<script>
import { Map, TileLayer, GeoJSON, VectorLayer } from "maptalks";
export default {
  components: {},

  data() {
    return {
      map: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new Map("map", {
      center: [116.39259, 39.90473],
      zoom: 8.5,
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
    this.addLayer();
  },

  methods: {
    addLayer() {
      const layer = new VectorLayer("layer", {}).addTo(this.map);
      fetch("data/json/data_Polygon_BJ.json")
        .then((res) => res.json())
        .then((geojson) => {
          const polygons = GeoJSON.toGeometry(geojson);
          polygons.forEach((polygon) => {
            polygon.options.enableSimplify = false; //启用简化
            polygon.setSymbol({
              polygonFill: {
                //color-interpolate 颜色差值(新增)
                //"identity"（恒等）：把输入的property值直接作为输出值，必须定义property。
                //"exponential"（指数）：通过stops和base，插值计算出结果，要求输入值必须为数值类型
                //"interval"（间隔）：用stops把输入值划分为几个区间来定义各自的输出值，即落在某个区间的输入值都输出同一个输出值。
                //"categorical"（绝对）：输入值必须等于stops中某个值时，则输出相应的输出值。
                type: "categorical",
                property: "NAME",
                stops: [
                  ["延庆区", "red"],
                  ["门头沟区", "#FCEC35"],
                  ["石景山区", "#F9AB58"],
                  ["怀柔区", "#70A800"],
                  ["平谷区", "#4DA6A2"],
                  ["密云区", "#304A00"],
                  ["东城区", "#007C33"],
                  ["西城区", "#C8EBB1"],
                  ["房山区", "#FF7F7E"],
                  ["顺义区", "#FA774D"],
                  ["通州区", "#4C82B6"],
                  ["大兴区", "#5DAD4C"],
                  ["丰台区", "#E2C7FA"],
                  ["昌平区", "#FCA673"],
                  ["海淀区", "#61D2F2"],
                  ["朝阳区", "#CA6634"],
                ],
              },
              // polygonFill: "lightskyblue",
              polygonOpacity: 1,
              lineWidth: 1,
              lineColor: "#444",
            });
          });
          layer.addGeometry(polygons);
        });
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
