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
/**
 * npm i poly-extrude --save
 * import {extrudePolygons,extrudePolylines,cylinder,expandPaths} from 'poly-extrude';
 * 挤出面、线、圆柱、路径
 * API
 *   import {extrudePolygons,extrudePolylines,cylinder,expandPaths} from 'poly-extrude';

  const polygons = [
      //polygon
      [
          //outring
          [
              [x, y],
              [x, y], ...........
          ],
          //holes
          [
              [x, y],
              [x, y], ...........
          ],
          ........

      ],
      //other polygons
      ......
  ]
  const result = extrudePolygons(polygons, {
      depth: 2
  });
  const {positon,normal,uv,indices} = result;
  //do something



  const polylines = [
      // polyline
      [
          [x, y],
          [x, y], ...........
      ],
      //polyline
      [
          [x, y],
          [x, y], ...........
      ],
  ];
  const result = extrudePolylines(polylines, {
      depth: 2,
      lineWidth: 2
  });
  const {positon,normal,uv,indices} = result;
  //do something



  const center = [0, 0];
  const result = cylinder(center, {
      radius: 1,
      height: 2,
      radialSegments: 6
  });
  const {positon,normal,uv,indices} = result;
  //do something
  


  const polylines = [
      // polyline
      [
          [x, y],
          [x, y], ...........
      ],
      //polyline
      [
          [x, y],
          [x, y], ...........
      ],
  ];
  const result = expandPaths(polylines, {
      cornerRadius: 0.5,
      lineWidth: 2
  });
  const {positon,normal,uv,indices} = result;
  //do something
 * 
 * 
 */
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl-layers";
import * as THREE from "three";
import { ThreeLayer } from "maptalks.three";
import { extrudePolylines } from "poly-extrude";
import { ClampToEdgeWrapping } from "three";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      threeLayer: null,
      vecLayer: null,
      drawTool: null,
      material: null,
      material1: null,
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
     * three
     */
    this.material = new THREE.MeshPhongMaterial({ color: "#fff" });
    this.material1 = new THREE.MeshPhongMaterial({ color: "#fff" });

    this.threeLayer = new ThreeLayer("t", {
      identifyCountOnEvent: 1,
    });
    let _this = this;
    this.threeLayer.prepareToDraw = function (gl, scene, camera) {
      var light = new THREE.DirectionalLight(0xffffff);
      light.position.set(0, -10, 10).normalize();
      scene.add(light);
      scene.add(new THREE.AmbientLight("#fff", 0.3));
      _this.loadTexture(); //加载贴图
      _this.animation(); //实时重绘
    };
    this.threeLayer.addTo(this.groupLayer);

    /**
     * vectorLayer
     */
    this.vecLayer = new maptalks.VectorLayer("layer").addTo(this.map);
    this.vecLayer.setZIndex(-1);

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
    this.drawTool.on("drawend", (param) => {
      this.vecLayer.addGeometry(param.geometry);
      this.createWall(param.geometry);
    });
  },

  methods: {
    shape() {
      this.drawTool.setMode("LineString").enable();
    },
    clear() {
      this.vecLayer.clear();
      this.threeLayer.clear();
    },
    loadTexture() {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load("images/wall/wall.jpg", (texture) => {
        texture.needsUpdate = true; //使用贴图时进行更新
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set(0.002, 0.002);
        texture.repeat.set(1, 1);
        this.material.map = texture;
        this.material.needsUpdate = true;
      });

      textureLoader.load("images/wall/wall-vertex.jfif", (texture) => {
        texture.needsUpdate = true; //使用贴图时进行更新
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set(0.002, 0.002);
        texture.repeat.set(6, 3);
        this.material1.map = texture;
        this.material1.needsUpdate = true;
      });
    },
    animation() {
      this.threeLayer._needsUpdate = !this.threeLayer._needsUpdate;
      if (this.threeLayer._needsUpdate) {
        this.threeLayer.redraw();
      }
      requestAnimationFrame(this.animation);
    },
    createWall(lineString) {
      const height = 100;
      const wall = this.threeLayer.toExtrudeLine(
        lineString,
        { height, width: 6 },
        this.material
      );
      this.threeLayer.addMesh(wall);
      const coordinates = lineString.getCoordinates();
      console.log(this.material);
      const bars = coordinates.map((c) => {
        return this.threeLayer.toBar(
          c,
          { height: height + 5, radius: 10, radialSegments: 40 },
          this.material
        );
      });
      this.threeLayer.addMesh(bars);
      const top = this.threeLayer.toExtrudeLine(
        lineString,
        { width: 30, height: 6, altitude: height },
        this.material1
      );
      this.threeLayer.addMesh(top);
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
