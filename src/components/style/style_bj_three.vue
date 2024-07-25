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
import * as dat from "dat.gui";

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
      planeMaterial:null,
      WallMaterial:null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39088, 39.91158],
      zoom: 9,
      pitch: 60,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        altitude: this.height,
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
      this.addAreaPlane();
      this.addPolygons();
      this.initGui();
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

  methods: {
    /**
     * ①一个小工具 GeoJSON生成纹理图片工具
     * https://www.glicon.design/geojsontexture.html
     */
    addAreaPlane() {
      this.planeMaterial = new THREE.MeshLambertMaterial({
        color: this.color,
        transparent: true,
        opacity: 0.8,
        side: 0,
      });
      fetch("data/json/bj/beijing.geojson")
        .then((res) => res.json())
        .then((geojson) => {
          //geojson计算bbox的库geojson-bbox---没用上
          // const extent = bbox(geojson);
          // const plane = new AreaPlane(extent, { altitude: 100 }, planeMaterial, threeLayer);
          const extrudePolygons = geojson.features.map((feature) => {
            return this.threeLayer.toExtrudePolygon(
              feature,
              { height: 1 },
              this.planeMaterial
            );
          });
          this.resetTopUV(extrudePolygons);
          const texture = new THREE.TextureLoader().load(
            "data/json/bj/bjFromGeojson.png",
            (texture) => {
              this.planeMaterial.map = texture;
              this.planeMaterial.needsUpdate = true;
              this.threeLayer.addMesh(extrudePolygons);
              // threeLayer.addMesh(plane);
            }
          );
          texture.needsUpdate = true; //使用贴图时进行更新
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(1, 1);
        });
    },
    /**
     * 重置拔高面的UV
     * 默认情况下行政区拔高的构造的几何体(Geometry)的纹理坐标值(UV),不是按照这种简单的按照行政区面积比列分布的，
     * 所以需要我们对Geometry的顶面的纹理坐标值进行重计算
     * ①求出所有行政区的边界的包围盒
     * ②计算每个子区域的坐标点的值换算成在这个包围盒内的占比即可(就是求UV的值,也是对整个纹理图片的划分过程)
     * ③更新每个子区域的Geometry的uv值
     */
    resetTopUV(extrudePolygons) {
      // console.log(geometries);
      //计算所有区域的总的包围盒
      let minx = Infinity,
        miny = Infinity,
        maxx = -Infinity,
        maxy = -Infinity,
        maxZ = -Infinity;
      extrudePolygons.forEach((extrudePolygon) => {
        const geometry = extrudePolygon.getObject3d().geometry;
        const center = extrudePolygon.getObject3d().position;
        const px = center.x,
          py = center.y;
        const position = geometry.attributes.position.array;
        for (let i = 0, len = position.length; i < len; i += 3) {
          const x = position[i] + px,
            y = position[i + 1] + py,
            z = position[i + 2];
          minx = Math.min(minx, x);
          miny = Math.min(miny, y);
          maxx = Math.max(maxx, x);
          maxy = Math.max(maxy, y);
          maxZ = Math.max(maxZ, z);
        }
      });
      console.log(minx, miny, maxx, maxy);
      //计算每个子区域的每个轮廓坐标点的在这个包围盒的百分比
      const dx = maxx - minx,
        dy = maxy - miny;
      extrudePolygons.forEach((extrudePolygon) => {
        const geometry = extrudePolygon.getObject3d().geometry;
        const position = geometry.attributes.position.array;
        const center = extrudePolygon.getObject3d().position;
        const px = center.x,
          py = center.y;
        const uv = geometry.attributes.uv.array;
        let idx = 0;
        for (let i = 0, len = position.length; i < len; i += 3) {
          const x = position[i] + px,
            y = position[i + 1] + py,
            z = position[i + 2];
          if (z === maxZ) {
            const u = (x - minx) / dx;
            const v = (y - miny) / dy;
            const index = idx * 2;
            uv[index] = u;
            uv[index + 1] = v;
          }
          idx++;
        }
      });
    },

    /**
     * 侧边竖直面
     */
    addPolygons() {
      this.wallMmaterial = new THREE.MeshLambertMaterial({
        color: this.color,
        transparent: true,
        opacity: 0.8,
      });
      fetch("data/json/bj/beijing.geojson")
        .then((res) => res.json())
        .then((geojson) => {
          const geojsonLine = this.Polygon2Lines(geojson);
          const lines = maptalks.GeoJSON.toGeometry(geojsonLine);
          lines.forEach((line) => {
            const extrudeLine = this.threeLayer.toExtrudeLine(
              line,
              { height: this.height, altitude: -this.height, topColor: "#fff" },
              this.wallMmaterial
            );
            this.threeLayer.addMesh(extrudeLine);
          });
          this.addOutLines();
        });
    },
    Polygon2Lines(geojson) {
      const results = {
        type: "FeatureCollection",
        features: [],
      };
      geojson.features.forEach((f) => {
        const { geometry, properties } = f;
        const { coordinates, type } = geometry;
        let polygons = [];
        if (type.includes("Multi")) {
          polygons = coordinates;
        } else {
          polygons.push(coordinates);
        }
        polygons.forEach((p) => {
          results.features.push({
            type: "Feature",
            geometry: {
              type: "MultiLineString",
              coordinates: p,
            },
            properties,
          });
        });
      });
      return results;
    },
    addOutLines() {
      fetch("data/json/bj/beijingarea.json")
        .then((res) => res.json())
        .then((geojson) => {
          const polygons = maptalks.GeoJSON.toGeometry(geojson);
          polygons.forEach((polygon) => {
            polygon.setSymbol({
              polygonOpacity: 0,
              lineWidth: 1,
              lineColor: this.lineColor,
            });
          });
          this.vectorLayer.addGeometry(polygons);
        });
    },
    initGui() {
      let params = {
        color: this.planeMaterial.color.getStyle(),
        opacity: this.planeMaterial.opacity,
        lineColor:this.lineColor,
      };
      let gui = new dat.GUI();
      gui.domElement.style = "position:absolute;top:10px;left:10px";

      gui
        .addColor(params, "color")
        .name("color")
        .onChange(()=> {
          this.planeMaterial.color.set(params.color);
          this.wallMmaterial.color.set(params.color);
        });
      gui.add(params, "opacity", 0, 1).onChange(()=> {
        this.planeMaterial.opacity = params.opacity;
        this.wallMmaterial.opacity = params.opacity;
      });
      gui.addColor(params, "lineColor").onChange(()=> {
        this.vectorLayer.getGeometries().forEach((p) => {
          p.updateSymbol({
            lineColor: params.lineColor,
          });
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
