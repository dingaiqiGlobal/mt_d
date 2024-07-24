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
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [114.18365, 22.30434],
      zoom: 11,
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
      // forceRenderOnMoving: true,
      // forceRenderOnRotating: true,
      // forceRenderOnZooming: true,
      identifyCountOnEvent: 1,
      animation: true,
    });
    this.threeLayer.prepareToDraw = (gl, scene, camera) => {
      let light = new THREE.DirectionalLight(0xffffff);//灯光注意
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
     * VectorLayer-为了添加边线跟标注
     */
    this.vectorLayer = new maptalks.VectorLayer("vectorLayer", {
      geometryEvents: false, //几何事件
      collision: true, //碰撞检测
      collisionDelay: 250,
      collisionBufferSize: 6,
    });
    this.vectorLayer.addTo(this.map);

    this.addPolygons();
  },

  methods: {
    addPolygons() {
      //颜色
      const colors = [
        [2000, "lightskyblue"],
        [12000, "yellow"],
        [30000, "orangered"],
      ];
      const ci = new ColorIn(colors);
      //挤出高度
      const height = 1000;
      fetch("data/json/hk/hk.json")
        .then((res) => res.json())
        .then((geojson) => {
          const polygons = maptalks.GeoJSON.toGeometry(geojson);
          const extrudePolygons = polygons.map((p) => {
            const { value } = p.getProperties();
            const [r, g, b] = ci.getColor(value);
            const color = `rgb(${r},${g},${b})`;
            const extrudePolygon = this.threeLayer.toExtrudePolygon(
              p,
              { height, altitude: -height, topColor: "#fff" },
              new THREE.MeshPhongMaterial({ color })
            );
            extrudePolygon.on("mouseover mouseout", this.mouseEventFunc); //事件绑定
            return extrudePolygon;
          });
          this.threeLayer.addMesh(extrudePolygons);
          this.addOutLines(polygons);
          this.addLabels();
        });
    },
    mouseEventFunc(e) {
      const highMaterial = new THREE.MeshPhongMaterial({
        color: "#fff",
        vertexColors: 2,
      });
      const polygon = e.target;
      if (e.type === "mouseover") {
        if (!polygon._oldSymbol) {
          //可以给polygon添加一个._oldSymbol
          polygon._oldSymbol = polygon.getObject3d().material;
        }
        polygon.getObject3d().material = highMaterial;
      } else if (e.type === "mouseout") {
        if (polygon._oldSymbol) {
          polygon.getObject3d().material = polygon._oldSymbol;
        }
      }
    },
    addOutLines(polygons) {
      polygons.forEach((polygon) => {
        polygon.setSymbol({
          polygonOpacity: 0,
          lineWidth: 0.6,
          lineColor: "#444",
        });
      });
      this.vectorLayer.addGeometry(polygons);
    },
    addLabels() {
      fetch("data/json/hk/hklabel.geojson")
        .then((res) => res.json())
        .then((geojson) => {
          const points = maptalks.GeoJSON.toGeometry(geojson);
          points.forEach((point) => {
            const { name } = point.getProperties();
            point.setSymbol({
              textName: name,
              textHaloRadius: 0.2,
              textHaloFill: "#fff",
            });
          });
          this.vectorLayer.addGeometry(points);
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
