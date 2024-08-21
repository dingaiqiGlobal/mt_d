<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button @click="measureDistance">距离3D</button>
      <button @click="measureArea">面积3D</button>
      <button @click="measureHeight">高度3D</button>
      <hr />
      <button @click="clear">清除</button>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import {
  GroupGLLayer,
  Geo3DTilesLayer,
  Distance3DTool,
  Area3DTool,
  Height3DTool,
} from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      measureTool: null,
      toolOptions: {
        once: false,
        symbol: {
          lineColor: "#e8542b",
          lineWidth: 2,
          polygonFill: "#eee",
          polygonOpacity: 0.5,
        },
        vertexSymbol: {
          markerType: "ellipse",
          markerFill: "#e8542b",
          markerLineColor: "#fff",
          markerLineWidth: 2,
          markerWidth: 10,
          markerHeight: 10,
          markerDy: 0,
        },
        labelSymbol: {
          boxStyle: {
            padding: [15, 6],
            verticalAlignment: "top",
            horizontalAlignment: "left",
            minWidth: 150,
            minHeight: 30,
            symbol: {
              markerType: "square",
              markerFill: "rgb(60, 60, 60)",
              markerFillOpacity: 0.8,
              markerLineColor: "#fff",
              markerLineWidth: 1,
              textDx: -110,
            },
          },
          textSymbol: {
            textFill: "#fff",
            textSize: 16,
            textVerticalAlignment: "center",
          },
        },
      },
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 16,
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
     * 3dtiles
     */
    const geo3DTilesLayer = new Geo3DTilesLayer("Geo3DTilesLayer", {
      geometryEvents: true, //考虑到性能问题Geo3DTilesLayer的事件交互(geometryEvents)默认是关闭的
      services: [
        {
          url: "data/3dtiles/bim/tileset.json",
          maximumScreenSpaceError: 16, //该值越小，渲染精度越高，项目允许的情况下，该值越大性能越好
          ambientLight: [0.2, 0.2, 0.2],
          heightOffset: 8,
          scale: [1, 1, 1], //3dtile整体的缩放参数
          rotation: [0, 0, 0], //3dtile整体的旋转参数
          coordOffset: [0, 0], //3dtile整体偏移量参数
        },
      ],
    });
    geo3DTilesLayer.once("loadtileset", (e) => {
      const extent = geo3DTilesLayer.getExtent(e.index);
      this.map.fitExtent(extent, 0, {
        animation: false,
      });
    });
    /**
     * groupLayer
     */
    const sceneConfig = {
      environment: {
        enable: true,
        mode: 1,
        level: 0,
        brightness: 0.915,
      },
    };
    this.groupLayer = new GroupGLLayer("group", [geo3DTilesLayer], { sceneConfig });
    this.groupLayer.addTo(this.map);
  },

  methods: {
    measureDistance() {
      if (this.measureTool) {
        this.measureTool.remove();
      }
      this.measureTool = new Distance3DTool().addTo(this.map);
    },
    measureArea() {
      if (this.measureTool) {
        this.measureTool.remove();
      }
      console.log(new Area3DTool(this.toolOptions));
      this.measureTool = new Area3DTool(this.toolOptions).addTo(this.map);
    },
    measureHeight() {
      if (this.measureTool) {
        this.measureTool.remove();
      }
      this.measureTool = new Height3DTool(this.toolOptions).addTo(this.map);
    },
    clear() {
      if (this.measureTool) {
        this.measureTool.remove();
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
