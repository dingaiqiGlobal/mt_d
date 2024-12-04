<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-button type="primary" @click="shape">绘制</el-button>
      <el-button type="primary" @click="clear">清除图形</el-button>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, GLTFLayer, GLTFLineString } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      vecLayer: null,
      gltfLayer: null,
      model: null,
      drawTool: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 18,
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
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true },
        bloom: {
          enable: true,
          threshold: 0,
          factor: 1,
          radius: 0.02,
        },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [], { sceneConfig });
    this.groupLayer.addTo(this.map);

    /**
     * vectorLayer
     */
    this.vecLayer = new maptalks.VectorLayer("layer").addTo(this.map);
    this.vecLayer.setZIndex(-1);
    /**
     * gltfLayer
     */
    this.gltfLayer = new GLTFLayer("gltf");
    this.groupLayer.addLayer(this.gltfLayer);
    this.model = new GLTFLineString(null, {
      direction: 2,
      symbol: {
        url: "data/gltf/fence/fence.glb",
        modelHeight: 80,
        rotationZ: 90,
      },
    });
    this.model.addTo(this.gltfLayer);
    /**
     * 绘制工具
     *
     */
    this.drawTool = new maptalks.DrawTool({
      mode: "LineString",
      once: true,
    }).addTo(this.map);
    this.drawTool.on("drawstart", (param) => {
      this.updateGeometrySymbol(param.tempGeometry);
    });
    this.drawTool.on("mousemove", (param) => {
      const geo = param.geometry;
      const coordinates = geo.getCoordinates();
      this.model.setCoordinates(coordinates);
    });
    this.drawTool.on("drawend", (param) => {
      const geo = param.geometry;
      this.vecLayer.addGeometry(geo);
      const coordinates = geo.getCoordinates();
      this.model.setCoordinates(coordinates);
    });
  },

  methods: {
    shape() {
      this.drawTool.setMode("LineString").enable();
    },
    clear() {
      this.vecLayer.clear();
      this.gltfLayer.clear();
    },

    updateGeometrySymbol(geometry) {
      const mode = this.drawTool.getMode();
      if (mode === "linestring") {
        geometry.setSymbol({
          lineColor: "red",
          markerType: "ellipse",
          markerWidth: 10,
          markerHeight: 10,
          markerPlacement: "vertex",
        });
      }
      if (mode === "polygon") {
        geometry.setSymbol({
          polygonFill: "white",
          polygonOpacity: 0.7,
          lineColor: "blue",
          lineWidth: 2,
          markerType: "ellipse",
          markerWidth: 10,
          markerHeight: 10,
          markerFill: "red",
          markerPlacement: "vertex",
        });
      }
      if (mode === "point") {
        geometry.setSymbol({
          markerType: "ellipse",
          markerWidth: 10,
          markerHeight: 10,
          markerFill: "red",
        });
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
