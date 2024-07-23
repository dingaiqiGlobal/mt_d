<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import * as dat from "dat.gui";
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, LineStringLayer } from "@maptalks/gl-layers";
import * as THREE from "three";
import { ThreeLayer } from "maptalks.three";

export default {
  components: {},

  data() {
    return {
      map: null,
      baseLayer: null,
      threeLayer: null,
      groupLayer: null,
      lineLayer: null,
      //数据
      lines: [],
      terrains: [],
      altitude: -90,
      terrainColor: "#0a6142",
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.12274, 40.03235],
      zoom: 12,
      pitch: 90,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
    });
    /**
     *baseLayer
     */
    this.baseLayer = new maptalks.TileLayer("tile", {
      //debug: true,
      urlTemplate:
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      subdomains: ["a", "b", "c", "d"], //子域
    });
    /**
     * threeLayer
     */
    this.threeLayer = new ThreeLayer("effectBuilding", {
      forceRenderOnMoving: true,
      forceRenderOnRotating: true,
      forceRenderOnZooming: true,
      animation: true,
    });
    this.threeLayer.prepareToDraw = (gl, scene, camera) => {
      let light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(0, -10, 10);
      scene.add(light);
      //this.threeLayer.config("animation", true);
      this.animation(); //layer动画支持跳过帧
    };
    /**
     * groupLayer
     */
    this.lineLayer = new LineStringLayer("LineStringLayer");
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true }, //抗锯齿
      },
      ground: {
        enable: true,
        renderPlugin: {
          type: "lit",
        },
        symbol: {
          polygonOpacity: 1,
          material: {
            baseColorFactor: [0.48235, 0.48235, 0.48235, 1], //基本颜色因子
            hsv: [0, 0, -0.532],
            roughnessFactor: 0.22, //粗糙度系数
            metallicFactor: 0.58, //金属因子
          },
        },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [this.threeLayer, this.lineLayer], {
      sceneConfig,
    });
    this.groupLayer.addTo(this.map);
    /**
     * 添加
     */
    this.iniGui();
  },

  methods: {
    addDemLines() {
      const colors = [
        [0, "white"],
        [100, "blue"],
        [300, "yellow"],
        [400, "red"],
      ];
    },
    animation() {
      this.threeLayer._needsUpdate = !this.threeLayer._needsUpdate;
      if (this.threeLayer._needsUpdate && !this.threeLayer.isRendering()) {
        this.threeLayer.redraw();
      }
      requestAnimationFrame(() => this.animation());
    },
    iniGui() {
      let params = {
        baseLayer: false,
        altitude: this.altitude,
        terrainColor: this.terrainColor,
        texture: false,
      };
      let gui = new dat.GUI();
      gui.domElement.style = "position:absolute;top:10px;left:10px";
      gui
        .add(params, "baseLayer")
        .name("底图控制")
        .onChange(() => {
          if (params.baseLayer) {
            this.groupLayer.addLayer(this.baseLayer);
          } else {
            this.groupLayer.removeLayer(this.baseLayer);
          }
        });
      gui.add(params, "altitude", -1000, 1000).name("海拔");
      gui.addColor(params, "terrainColor").name("地形颜色");
      gui.add(params, "texture").name("地形纹理");
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
