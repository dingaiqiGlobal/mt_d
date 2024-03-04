<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import { Map, TileLayer, Marker, LineString, Polygon, GeoJSON } from "maptalks";
import {
  GroupGLLayer,
  PointLayer,
  LineStringLayer,
  PolygonLayer,
  ExtrudePolygonLayer,
} from "@maptalks/gl-layers";
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
      center: [116.39083, 39.91714],
      zoom: 16,
      pitch: 30,
      bearing: -25,
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

    /**
     * LineStringLayer
     * 仅支持添加LineString 和 MultiLineString，添加其他数据时会报错
     * 它是maptalks.OverlayLayer的子类，继承了 OverlayerLayer 上所有的方法
     * 还继承Layer上的所有方法
     *
     * LineStringLayer支持Symbol样式中的所有marker，text和line样式
     * marker和text样式主要用于在线端点或线段中段指定位置绘制图标或沿线文字
     */

    const lineLayer = new LineStringLayer("line0", {
      picking: true, //是否允许图层用identify或identifyAtPoint方法查询数据
      textGamma: 1, //文字的Gamma值，可以用于调整文字清晰度
      geometryEvents: true, //是否允许Geometry响应事件
      styleScale: 1, //图层图标和文字的整体放大系数
      attribution: null, //图层版权声明
      minZoom: null,
      maxZoom: null,
      visible: true,
      opacity: 1,
      hitDetect: true,
      collisionScope: "layer",
    });
    const line = new LineString(
      [
        [116.38251, 39.91606],
        [116.40028, 39.91685],
      ],
      {
        arrowStyle: null,
        arrowPlacement: "vertex-last",
        visible: true,
        editable: true,
        cursor: null,
        shadowBlur: 0,
        shadowColor: "black",
        draggable: false,
        dragShadow: false,
        drawOnAxis: null,
        symbol: {
          lineColor: "#1bbc9b",
          lineWidth: 3,
        },
      }
    ).addTo(lineLayer);

    /**
     * PolygonLayer
     * 仅支持添加Polygon 和 MultiPolygon，添加其他数据时会报错s
     *
     * 它是maptalks.OverlayLayer的子类，继承了 OverlayerLayer 上所有的方法
     * 还继承Layer上的所有方法
     */
    const polyLayer = new PolygonLayer("polygon0", {
      picking: true, //是否允许图层用identify或identifyAtPoint方法查询数据
      textGamma: 1, //文字的Gamma值，可以用于调整文字清晰度
      geometryEvents: true, //是否允许Geometry响应事件
      styleScale: 1, //图层图标和文字的整体放大系数
      attribution: null, //图层版权声明
      minZoom: null,
      maxZoom: null,
      visible: true,
      opacity: 1,
      hitDetect: true,
      collisionScope: "layer",
    });

    const polygon = new Polygon(
      [
        [
          [116.3856, 39.92122, 10],
          [116.3859, 39.91148, 10],
          [116.39628, 39.91178, 10],
          [116.39577, 39.92168, 10],
          [116.3856, 39.92122, 10],
        ],
      ],
      {
        visible: true,
        editable: true,
        cursor: "pointer",
        shadowBlur: 0,
        shadowColor: "black",
        draggable: false,
        dragShadow: false,
        drawOnAxis: null,
        symbol: {
          lineColor: "#34495e",
          lineWidth: 2,
          polygonFill: "rgb(135,196,240)",
          polygonOpacity: 1,
        },
      }
    ).addTo(polyLayer);

    /**
     * GroupGLLayer
     */
    const groupLayer = new GroupGLLayer("group", [lineLayer, polyLayer], {
      sceneConfig: {
        environment: {
          enable: true,
          mode: 1,
          level: 0,
          brightness: 0,
        },
      },
    });
    groupLayer.addTo(this.map);
  },

  methods: {},
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
