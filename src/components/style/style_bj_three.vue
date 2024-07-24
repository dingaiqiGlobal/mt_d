<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl-layers";
import * as THREE from "three";
import { ThreeLayer } from "maptalks.three";

import { ColorIn } from "colorin";

export default {
  components: {},

  data() {
    return {
      map: null,
      threeLayer: null,
      groupLayer: null,
      vectorLayer: null, //为了添加边线跟标注

      height: 5000,
      color: "rgb(12,66,240)",
      lineColor: "#fff",
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.390880,39.911580],
      zoom: 9,
      pitch: 60,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        subdomains: ["a", "b", "c", "d"],
      }),
      layers: [],
    });
    /**
     * threeLayer
     */
    this.threeLayer = new ThreeLayer("three", {
      identifyCountOnEvent: 1,
      animation: true,
    });
    this.threeLayer.prepareToDraw = (gl, scene, camera) => {
      let light = new THREE.DirectionalLight(0xffffff); //灯光注意
      light.position.set(0, -10, 10).normalize();
      scene.add(light);
      scene.add(new THREE.AmbientLight("#fff", 0.3));
    };

    /**
     * groupLayer
     */
    //GroupGLLayer能实现抗锯齿等后处理，也能加入其他三维图层，让子图层都融合到同一个三维空间中
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true }, //抗锯齿
      },
    };
    this.groupLayer = new GroupGLLayer("group", [this.threeLayer], { sceneConfig });
    this.groupLayer.addTo(this.map);

    /**
     * VectorLayer-为了修改地形
     */
    this.vectorLayer = new maptalks.VectorLayer("vectorLayer", {
      geometryEvents: false, //几何事件
      collision: true, //碰撞检测
      collisionDelay: 250,
      collisionBufferSize: 6,
    });
    this.vectorLayer.addTo(this.map);

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
