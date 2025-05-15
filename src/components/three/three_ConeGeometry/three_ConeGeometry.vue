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
import { GroupGLLayer, Geo3DTilesLayer, ColorMask } from "@maptalks/gl-layers";
import * as THREE from "three";
import { ThreeLayer } from "maptalks.three";
import Cone from "./Cone";
export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      geo3DTilesLayer: null,
      threeLayer: null,
      cone: null, //视椎体
      //UI
      altitude: 80,
      coordinate: [108.95941, 34.22218],
      xyz: [0, 0, 0],
      baseWidth: 60,
      baseHeight: 80,
      height: 200,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [108.95941, 34.21978],
      zoom: 15,
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
     this.geo3DTilesLayer = new Geo3DTilesLayer("Geo3DTilesLayer", {
      geometryEvents: true,
      services: [
        {
          url: "data/3dtiles/dayanta/tileset.json",
          maximumScreenSpaceError: 1,
          ambientLight: [0.2, 0.2, 0.2],
          heightOffset: -400,
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
          coordOffset: [0, 0.00002],
        },
      ],
    });
    this.geo3DTilesLayer.once("loadtileset", (e) => {
      const extent = this.geo3DTilesLayer.getExtent(e.index);
      this.map.fitExtent(extent, 0, {
        animation: false,
      });
    });
    /**
     * threeLayer
     */
    this.threeLayer = new ThreeLayer("three", {
      identifyCountOnEvent: 1,
      animation: true,
    });
    this.threeLayer.prepareToDraw = (gl, scene, camera) => {
      var light = new THREE.DirectionalLight(0xffffff);
      light.position.set(0, -10, 10).normalize();
      scene.add(light);
      scene.add(new THREE.AmbientLight("#fff", 0.3));
      this.addCone();
    };
    /**
     * groupLayer
     */
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [this.threeLayer,this.geo3DTilesLayer], {
      sceneConfig,
    });
    this.groupLayer.addTo(this.map);

    /**
     * GUI
     */
    this.iniGui();
  },

  methods: {
    addCone() {
      const coordinate = this.coordinate;
      const material = new THREE.LineBasicMaterial({ color: 0xff0000 }); // 红色线框
      this.cone = new Cone(
        coordinate,
        {
          altitude: this.altitude,
          baseWidth: this.baseWidth,
          baseHeight: this.baseHeight,
          height: this.height,
        },
        material,
        this.threeLayer
      );
      this.threeLayer.addMesh(this.cone);
    },
    iniGui() {
      let params = {
        coordinate: this.coordinate.toString(),
        xyz: this.xyz.toString(),
        altitude: this.altitude,
        size: "1,1,1",
      };
      let gui = new dat.GUI();
      gui.domElement.style = "position:absolute;top:10px;left:10px";
      gui
        .add(params, "altitude", 0, 8000)
        .name("视椎体海拔")
        .onChange(() => {
          this.cone.setAltitude(params.altitude);
        });
      gui
        .add(params, "coordinate")
        .name("位置")
        .onChange(() => {
          this.cone.setPosition(params.coordinate);
        });
      gui
        .add(params, "xyz")
        .name("HeadingPitchRoll")
        .onChange(() => {
          this.cone.setQuaternion(params.xyz);
        });
      gui
        .add(params, "size")
        .name("体积变化")
        .onChange(() => {
          this.cone.setSize(params.size);
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
