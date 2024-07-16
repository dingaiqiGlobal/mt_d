<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button type="" @click="add_Ocean">添加海面</button>
      <button type="" @click="remove_Ocean">移除海面</button>
      <br />
      <button type="" @click="add_RippleWall">添加幕墙</button>
      <button type="" @click="remove_RippleWall">移除幕墙</button>
      <br />
      <button type="" @click="add_ArcLineMesh">添加弧线</button>
      <button type="" @click="remove_ArcLineMesh">移除弧线</button>
      <br />
      <!-- <button type="" @click="">添加</button>
      <button type="" @click="">移除</button>
      <br /> -->
      <hr />
      <button type="" @click="clear">清空</button>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, PointLayer } from "@maptalks/gl-layers";
import axios from "axios";

//three
import * as THREE from "three";
import { ThreeLayer } from "maptalks.three";
import MenshGroup from "@/sceneEffect/MenshGroup";
// //安装npm install gsap --save
// import { gsap } from "gsap";

/**
 * 场景特效
 * ①安装loader
 * cnpm install raw - loader--save
 * ②配置webpack
 * module.exports = {
 *     configureWebpack: {
 *         module: {
 *             rules: [
 *                 {
 *                     test: /\.(frag|vert|glsl)$/i,
 *                     use: 'raw-loader',
 *                 },
 *             ],
 *         },
 *     },
 * }
 * ③限定three版本
 * cnpm i three @0.116.1 --save
 * ④注意事项
 * meshline使用离线版本，不适用npm包的形式
 * （cnpm i three.meshline@1.2.0 --save）
 */
//海面
import Ocean from "@/sceneEffect/maptalks.three.objects/ocean"; //ocean大海
//流光墙
import rippleWall from "@/sceneEffect/maptalks.three.objects/rippleWall";
import { getRippleWall, getMeteorMaterial } from "@/sceneEffect/shader/shader";
//弧线
import arcLine from "@/sceneEffect/maptalks.three.objects/arcLine";
import { MeshLineMaterial } from "@/sceneEffect/lib/THREE.MeshLine";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      threeLayer: null,
      menshGroup: null,
      //数据要求不一样
      oceanMesh:[],//海面
      rippleWallMesh: [], //幕墙
      arcLineMesh: [], //弧线
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.33092, 40.00056],
      zoom: 15,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", //dark_all
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });

    this.groupLayer = new GroupGLLayer("group", [], {
      sceneConfig: {
        environment: {
          enable: true,
          mode: 1,
          level: 0,
          brightness: 0,
        },
        shadow: {
          type: "esm",
          enable: true,
          quality: "high",
          opacity: 0.11,
          color: [0, 0, 0],
          blurOffset: 1,
        },
        postProcess: {
          enable: true,
          antialias: {
            enable: true,
            taa: true,
            jitterRatio: 0.25,
          },
          ssr: {
            enable: true,
          },
          bloom: {
            enable: true,
            threshold: 0,
            factor: 0.2,
            radius: 0.105,
          },
          ssao: {
            enable: true,
            bias: 0.08,
            radius: 0.08,
            intensity: 1.5,
          },
          sharpen: {
            enable: true,
            factor: 0.2,
          },
        },
      },
    });
    this.groupLayer.addTo(this.map);

    this.threeLayer = new ThreeLayer("effectBuilding", {
      forceRenderOnMoving: true,
      forceRenderOnRotating: true,
      forceRenderOnZooming: true,
      animation: true,
    });
    this.threeLayer.prepareToDraw = (gl, scene, camera) => {
      //平行光
      let light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(0, -10, 10);
      scene.add(light);
      this.threeLayer.config("animation", true);
    };
    this.threeLayer.addTo(this.map);
    this.menshGroup = new MenshGroup(this.threeLayer);
  },

  methods: {
    /**
     * 海面
     */
    async getWaterMesh(url, threeLayer) {
      const result = await axios.get(url);
      let features = result.data.features;
      let waters = [];
      features.forEach((g) => {
        if (g.geometry.type == "Polygon") {
          let mesh = new Ocean(
            maptalks.GeoJSON.toGeometry(g),
            {
              speed: 1 / 500,
              //sunColor: "#f00",
              waterColor: "#3399FF",
              alpha: 1,
              waterNormals: require("@/assets/effect/lineTexture.png"),
            },
            threeLayer
          );
          waters.push(mesh);
        }
      });
      return waters;
    },
    async add_Ocean() {
      this.oceanMesh=await this.getWaterMesh("data/json/data_effect_water.json",this.threeLayer);  
      this.menshGroup.addMesh(this.oceanMesh)//效果不如maptalks
    },
    remove_Ocean(){
      this.menshGroup.removeMesh(this.oceanMesh)
    },
    /**
     * 坐标Function
     */
    async getJsonData(url) {
      const result = await axios.get(url);
      let features = result.data.features;
      let coordinates = [];
      for (let i = 0; i < features.length; i++) {
        coordinates.push(features[i].geometry.coordinates);
      }
      return coordinates;
    },
    /**
     * 幕墙
     */
    async build_RippleWall_Menshs(url, threeLayer) {
      let data = await this.getJsonData(url);
      let meshes = [];
      for (let i = 0; i < data.length; i++) {
        if (i % 2 === 0) {
          meshes.push(this.getRippleWallMesh(data[i][0], threeLayer));
        } else {
          meshes.push(this.getMeteorMesh(data[i][0], threeLayer));
        }
      }
      return meshes;
    },
    async add_RippleWall() {
      if (!this.menshGroup.isMesh(this.rippleWallMesh)) {
        this.rippleWallMesh = await this.build_RippleWall_Menshs(
          "data/json/data_effect_building.json",
          this.threeLayer
        );
        this.menshGroup.addMesh(this.rippleWallMesh);
      }
    },
    remove_RippleWall() {
      this.menshGroup.removeMesh(this.rippleWallMesh);
    },
    getMeteorMesh(coord, threeLayer) {
      let material = getMeteorMaterial(); //shader 黄色
      let mesh = new rippleWall(coord, { height: 250 }, material, threeLayer);
      mesh.getObject3d().renderOrder = 11;
      return [mesh];
    },
    getRippleWallMesh(coord, threeLayer) {
      let material = getRippleWall(); //shader  蓝色
      let mesh = new rippleWall(coord, { height: 250 }, material, threeLayer); //maptalks.three
      mesh.getObject3d().renderOrder = 11;
      return [mesh];
    },

    /**
     * 弧线
     */
    async buildArcLineMesh(url, threeLayer) {
      //整理数据
      const path = [];
      let data = await this.getJsonData(url);
      for (let i = 0; i < data.length - 1; i++) {
        const result = [data[i], data[i + 1]];
        path.push(result); // 将新数组添加到结果数组中
      }
      //添加meshes
      let meshes = [];
      for (let i = 0; i < path.length; i++) {
        let linestring = new maptalks.LineString(path[i]);
        //texture-贴图信息
        const texture = new THREE.TextureLoader().load(
          require("@/assets/effect/lineTexture.png")
        );
        texture.anisotropy = 16;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const camera = threeLayer.getCamera();
        //THREE.MeshLine
        const material = new MeshLineMaterial({
          map: texture,
          useMap: true,
          lineWidth: 13,
          sizeAttenuation: false,
          transparent: true,
          near: camera.near,
          far: camera.far,
        });
        //maptalks.three.object
        meshes.push(
          new arcLine(
            linestring,
            { altitude: 0, height: 400, speed: 1 / 5 },
            material,
            threeLayer
          )
        );
      }
      return meshes;
    },
    async add_ArcLineMesh() {
      if (!this.menshGroup.isMesh(this.arcLineMesh)) {
        this.arcLineMesh = await this.buildArcLineMesh(
          "data/json/data_effect_arcline.json",
          this.threeLayer
        );
        this.menshGroup.addMesh(this.arcLineMesh);
      }
    },
    remove_ArcLineMesh() {
      this.menshGroup.removeMesh(this.arcLineMesh);
    },
    /**
     * 清空
     */
    clear() {
      this.menshGroup.clear(); //three组
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
