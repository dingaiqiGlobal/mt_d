<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import * as dat from "dat.gui";
import { ColorIn } from "colorin";
import MenshGroup from "@/sceneEffect/MenshGroup";

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
      menshGroup: null,
      vectorLayer: null, //为了修改地形
      //数据
      lines: [],
      terrains: [], //为了gui改变颜色高度
      altitude: -90, //为了不让低海拔的地形显示出来
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
      
      this.addDemLines();
      this.addTerrainTile(); //必须放在这调用（其他可以）
      this.animation(); //layer动画支持跳过帧-可选（感觉跟下一行用法一样）
      //this.threeLayer.config("animation", true);
      this.iniGui();
    };

    /**
     * menshGroup
     */
    this.menshGroup = new MenshGroup(this.threeLayer);

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
        //为了突显山的效果
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
     * VectorLayer-为了修改地形
     */
    this.vectorLayer = new maptalks.VectorLayer("test", {
      enableAltitude: true,
      altitude: this.altitude,
    });
    this.vectorLayer.addTo(this.map);
  },

  methods: {
    addTerrainTile() {
      //计算地址tile数组
      const minx = 13471,
        maxx = 13490,
        miny = 6191,
        maxy = 6210;
      const tiles = [];
      for (let col = minx; col <= maxx; col++) {
        for (let row = miny; row <= maxy; row++) {
          tiles.push([col, row, 14]);
        }
      }
      //遍历
      tiles.forEach((tile) => {
        const [x, y, z] = tile;
        const tilebelt = require("@mapbox/tilebelt"); //第三方，见REANME
        const bbox = tilebelt.tileToBBOX(tile);
        const texture = `data/terrain/tiles_img/${z}/${x}/${y}.jpg`;
        const image = `data/terrain/tiles_dem/${z}/${x}/${y}.png`;
        const terrain = this.threeLayer.toTerrain(
          bbox,
          {
            flaserBoundary: false, //是否压扁地形裙边
            bufferPixel: 0.2,
            image: image,
            texture: texture,
            imageWidth: 256,
            imageHeight: 256,
            altitude: this.altitude,
          },
          new THREE.MeshPhongMaterial({ color: this.terrainColor })
        );
        //hide texture-隐藏贴图-可选
        terrain.on("textureload", () => {
          terrain._map = terrain.getObject3d().material.map;
          terrain.getObject3d().material.map = null;
          terrain.getObject3d().material.needsUpdate = true;
        });
        //update normal-改变法线-可选
        terrain.on("dataload", () => {
          const geometry = terrain.getObject3d().geometry;
          const index = geometry.index.array;
          const position = geometry.attributes.position.array;
          const normal = this.generateNormal(index, position);
          geometry.setAttribute("normal", new THREE.BufferAttribute(normal, 3));
        });
        this.menshGroup.addMesh(terrain);
        this.terrains.push(terrain); //Gui控制
      });
    },
    //改变法线-可选
    generateNormal(indices, position) {
      function v3Sub(out, v1, v2) {
        out[0] = v1[0] - v2[0];
        out[1] = v1[1] - v2[1];
        out[2] = v1[2] - v2[2];
        return out;
      }

      function v3Normalize(out, v) {
        const x = v[0];
        const y = v[1];
        const z = v[2];
        const d = Math.sqrt(x * x + y * y + z * z) || 1;
        out[0] = x / d;
        out[1] = y / d;
        out[2] = z / d;
        return out;
      }

      function v3Cross(out, v1, v2) {
        const ax = v1[0],
          ay = v1[1],
          az = v1[2],
          bx = v2[0],
          by = v2[1],
          bz = v2[2];

        out[0] = ay * bz - az * by;
        out[1] = az * bx - ax * bz;
        out[2] = ax * by - ay * bx;
        return out;
      }

      function v3Set(p, a, b, c) {
        p[0] = a;
        p[1] = b;
        p[2] = c;
      }

      const p1 = [];
      const p2 = [];
      const p3 = [];

      const v21 = [];
      const v32 = [];

      const n = [];

      const len = indices.length;
      const normals = new Float32Array(position.length);
      let f = 0;
      while (f < len) {
        // const i1 = indices[f++] * 3;
        // const i2 = indices[f++] * 3;
        // const i3 = indices[f++] * 3;
        // const i1 = indices[f];
        // const i2 = indices[f + 1];
        // const i3 = indices[f + 2];
        const a = indices[f],
          b = indices[f + 1],
          c = indices[f + 2];
        const i1 = a * 3,
          i2 = b * 3,
          i3 = c * 3;

        v3Set(p1, position[i1], position[i1 + 1], position[i1 + 2]);
        v3Set(p2, position[i2], position[i2 + 1], position[i2 + 2]);
        v3Set(p3, position[i3], position[i3 + 1], position[i3 + 2]);

        v3Sub(v32, p3, p2);
        v3Sub(v21, p1, p2);
        v3Cross(n, v32, v21);
        // Already be weighted by the triangle area
        for (let i = 0; i < 3; i++) {
          normals[i1 + i] += n[i];
          normals[i2 + i] += n[i];
          normals[i3 + i] += n[i];
        }
        f += 3;
      }

      let i = 0;
      const l = normals.length;
      while (i < l) {
        v3Set(n, normals[i], normals[i + 1], normals[i + 2]);
        v3Normalize(n, n);
        normals[i] = n[0] || 0;
        normals[i + 1] = n[1] || 0;
        normals[i + 2] = n[2] || 0;
        i += 3;
      }

      return normals;
    },
    addDemLines() {
      const colors = [
        [0, "white"],
        [100, "green"],
        [200, "blue"],
        [300, "yellow"],
        [400, "red"],
      ];
      const ci = new ColorIn(colors); //第三方，见REANME
      const lineMaterialMap = {};
      //Materila
      function getLineMaterila(height) {
        //const [r, g, b, a] = ci.getColor(11);
        const [r, g, b] = ci.getColor(height); //通过高度获取颜色
        const color = `rgb(${r},${g},${b})`;
        if (lineMaterialMap[color]) {
          return lineMaterialMap[color];
        }
        lineMaterialMap[color] = new THREE.LineBasicMaterial({
          linewidth: 1,
          color,
          opacity: 0.6,
          transparent: true,
        });
        return lineMaterialMap[color];
      }
      fetch("data/terrain/hd_contour_line.json")
        .then((response) => response.json())
        .then((json) => {
          let evadata = json.features.map((feature) => {
            const { CONTOUR, ...otherProperties } = feature.properties;
            return {
              CONTOUR: CONTOUR,
              coordinates: feature.geometry.coordinates,
            };
          });
          //添加线
          this.lines = evadata.map((element) => {
            let coordinates = element.coordinates;
            if (coordinates) {
              const elevation = element.CONTOUR;
              const height = elevation + 45; //预防贴地形
              coordinates.forEach((c) => {
                c[2] = height;
              });
              const line = this.threeLayer.toLine(
                new maptalks.LineString(coordinates),
                { altitude: this.altitude },
                getLineMaterila(height)
              );
              return line;
            }
          });
          this.menshGroup.addMesh(this.lines);
        });
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
      gui
        .add(params, "altitude", -1000, 1000)
        .name("海拔")
        .onChange(() => {
          this.terrains.concat(this.lines).forEach((baseObject) => {
            baseObject.setAltitude(params.altitude);
          });
          this.vectorLayer.options.altitude = params.altitude;
        });
      gui
        .addColor(params, "terrainColor")
        .name("地形颜色")
        .onChange(() => {
          this.terrains.forEach((terrain) => {
            terrain.getObject3d().material.color.setStyle(params.terrainColor);
          });
        });
      gui
        .add(params, "texture")
        .name("地形纹理")
        .onChange(() => {
          this.terrains.forEach((terrain) => {
            const object3d = terrain.getObject3d();
            object3d.material.map = params.texture ? terrain._map : null;
            object3d.material.needsUpdate = true;
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
