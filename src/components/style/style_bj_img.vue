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
import { LineMaterial } from "./thirdParty/LineMaterial";

export default {
  components: {},

  data() {
    return {
      map: null,
      threeLayer: null,
      groupLayer: null,
      vectorLayer: null,

      linematerial: null,
      material: null,
      height: 10000,
      offset: 100,
      polygonLinkLine: new Map(), //键值对
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
      var light = new THREE.DirectionalLight(0xffffff);
      light.position.set(0, -10, 10).normalize();
      scene.add(light);
      scene.add(new THREE.AmbientLight("#fff", 0.3));
      this.loadTexture();
    };
    this.threeLayer.addTo(this.map); //特别注意---这种贴图的方式不能添加到groupLayer中，webgl会频闪

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
    loadTexture() {
      this.material = new THREE.MeshPhongMaterial({ color: "#fff" });
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load("data/json/bj/beijing-texture.png", (texture) => {
        texture.needsUpdate = true; //使用贴图时进行更新
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        this.material.map = texture;
        this.material.needsUpdate = true;
        this.addAreas();
      });
    },
    addAreas() {
      this.linematerial = new LineMaterial({
        color: 0xf2f2f2,
        linewidth: 4,
      });
      fetch("data/json/bj/beijingarea.json")
        .then((res) => res.json())
        .then((geojson) => {
          const polygons = maptalks.GeoJSON.toGeometry(geojson);
          const geojsonLines = this.polygonToLine(geojson);
          //粗线-fatlines
          const lines = maptalks.GeoJSON.toGeometry(geojsonLines);
          const fatlines = lines.map((line) => {
            return this.threeLayer.toFatLine(
              line,
              { altitude: this.height + this.offset, bloom: true },
              this.linematerial
            );
          });
          //挤出面-extrudePolygons
          const extrudePolygons = polygons.map((p, index) => {
            const id = maptalks.Util.GUID();
            const extrudePolygon = this.threeLayer.toExtrudePolygon(
              p,
              { height: this.height, topColor: "#fff", asynchronous: true },
              this.material
            );
            //事件绑定
            extrudePolygon.on("mouseover", this.polygonUp);
            extrudePolygon.on("mouseout", this.polygonDown);
            extrudePolygon.setId(id);
            this.polygonLinkLine.set(id, fatlines[index]); //键值对
            return extrudePolygon;
          });
          //重置拔高面的UV
          let idx = 0;
          extrudePolygons.forEach((extrudePolygon) => {
            extrudePolygon.on("workerload", (e) => {
              idx++;
              if (idx === extrudePolygons.length) {
                this.resetTopUV(extrudePolygons);
              }
            });
          });
          this.threeLayer.addMesh(fatlines);
          this.threeLayer.addMesh(extrudePolygons);
        });
    },
    polygonToLine(geojson) {
      return geojson.features.map((f) => {
        const { type, coordinates } = f.geometry;
        if (type === "MultiPolygon") {
          return {
            type: "Feature",
            geometry: {
              type: "MultiLineString",
              coordinates: coordinates.map((c) => {
                return c[0];
              }),
            },
          };
        }
        return {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coordinates[0],
          },
        };
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
    polygonUp(e) {
      const polygon = e.target;
      if (polygon._showPlayer) {
        polygon._showPlayer.cancel();
      }
      const player = (polygon._showPlayer = maptalks.animation.Animation.animate(
        {
          altitude: 8000,
        },
        {
          duration: 1000,
          easing: "out",
        },
        (frame) => {
          const altitude = frame.styles.altitude;
          if (altitude > 0) {
            polygon.setAltitude(altitude); //面海拔
            this.syncAltitude(polygon.getId(), altitude); //连接线海拔同步
          }
        }
      ));
      player.play();
    },
    polygonDown(e) {
      const polygon = e.target;
      if (polygon._showPlayer) {
        polygon._showPlayer.cancel();
      }
      polygon.setAltitude(0);
      this.syncAltitude(polygon.getId(), 0);
    },
    syncAltitude(id, altitude) {
      const line = this.polygonLinkLine.get(id);
      line.setAltitude(altitude + this.height + this.offset);
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
