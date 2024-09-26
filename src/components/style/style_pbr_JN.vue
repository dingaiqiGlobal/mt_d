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
      center: [116.99066, 36.66511],
      zoom: 9.5,
      pitch: 70,
      bearing: 0,
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
      let light = new THREE.DirectionalLight(0xffffff);
      light.position.set(0, -10, 10).normalize();
      scene.add(light);
      scene.add(new THREE.AmbientLight("#fff", 0.3));
    };

    /**
     * groupLayer
     */
    const sceneConfig = {
      postProcess: {
        enable: true,
        bloom: {
          enable: true,
          factor: 0.1,
          threshold: 0,
          radius: 1.5,
        },
        antialias: { enable: true },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [this.threeLayer], {
      sceneConfig,
    });
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
        [1, "#36ccfc"],
        [2, "#00ff80"],
        [3, "#f71fb7"],
        [4, "#1763fc"],
        [5, "#1763fc"],
        [6, "#a9ff00"],
        [7, "#f71fb7"],
        [8, "#1763fc"],
        [9, "#a9ff00"],
        [10, "#36ccfc"],
        [11, "#36ccfc"],
        [12, "#dcff1e"],
      ];
      const ci = new ColorIn(colors);

      //挤出高度
      const height = 4000;
      fetch("data/json/jn/jnqx.json")
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
              new THREE.MeshPhongMaterial({
                color,
                transparent: true, // 启用透明效果
                opacity: 0.8, // 不透明度为0.5
              })
            );
            extrudePolygon.on("mouseover mouseout", this.mouseEventFunc); //事件绑定
            return extrudePolygon;
          });
          this.threeLayer.addMesh(extrudePolygons);
          this.addOutLines(polygons);
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
        const { NAME } = polygon.getProperties();
        polygon.setSymbol({
          polygonOpacity: 0,
          lineWidth: 2,
          lineColor: "#ffffff",
          lineBloom: true,
          textName: NAME,
          textFaceName: "system-ui",
          textFill: "#ffffff",
          textHaloFill: "#000000",
          textHaloRadius: 0.2,
        });
      });
      this.vectorLayer.addGeometry(polygons);
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
