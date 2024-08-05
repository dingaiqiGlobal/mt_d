<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import gcoord from "gcoord";
/**
 * cnpm  i gcoord --save
 * import gcoord from "gcoord";
 * gcoord(geographic coordinates)是一个处理地理坐标系的JS库，
 * 用来修正百度地图、高德地图及其它互联网地图坐标系不统一的问题
 * 使用：
 * var result = gcoord.transform(
 * [116.403988, 39.914266],    // 经纬度坐标
 * gcoord.WGS84,               // 当前坐标系
 * gcoord.BD09                 // 目标坐标系
 * );
 */

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      vectorLayer: null,
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
      //高德地图纠偏
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
        offset: function (z) {
          const map = this.getMap();
          const center = map.getCenter();
          const c = gcoord.transform(center.toArray(), gcoord.AMap, gcoord.WGS84);
          const offset = map
            .coordToPoint(center, z)
            .sub(map.coordToPoint(new maptalks.Coordinate(c), z));
          return offset._round().toArray();
        },
      }),
      layers: [],
    });
    this.vectorLayer = new maptalks.VectorLayer("vectorLayer")
      .addTo(this.map)
      .setZIndex(2);
    this.addGeometry();
  },

  methods: {
    addGeometry() {
      fetch("data/json/bj/beijing_2huan.json")
        .then((res) => res.json())
        .then((geojson) => {
          maptalks.GeoJSON.toGeometryAsync(geojson).then((geos) => {
            geos.map((item) => {
              item.setSymbol({
                lineColor: "red",
              });
            });
            this.vectorLayer.addGeometry(geos);
          });
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
