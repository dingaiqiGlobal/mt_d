<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button type="" @click="addCloudArcLineMesh">添加云朵流光线</button>
      <button type="" @click="remove_CloudArcLineMesh">移除云朵流光线</button>
      <button type="" @click="add_RippleWall">添加幕墙</button>
      <button type="" @click="remove_RippleWall">移除幕墙</button>
      <button type="" @click="add_ArcLineMesh">添加弧线</button>
      <button type="" @click="remove_ArcLineMesh">移除弧线</button>
      <button type="" @click="menshGroup.clear()">清空</button>
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
      rippleWallMesh: [],
      arcLineMesh: [],
      cloudArcLineMesh: [],
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
     * 云朵流光线
     */

    async buildCloudArcLineMesh(url, threeLayer) {
      //整理数据
      const path = [];
      let data = await this.getJsonData(url);
      //添加边缘矢量图层
      const iconLayer = new PointLayer("iconLayer", {});
      for (let i = 0; i < data.length; i++) {
        const iconMarker = new maptalks.Marker(data[i], {
          symbol: {
            markerFile: require("@/assets/texture/building.png"),
            markerOpacity: 1,
            markerWidth: 35,
            markerHeight: 35,
          },
        }).addTo(iconLayer);
      }
      this.groupLayer.addLayer(iconLayer);

      //添加meshes
      let origin = [116.32297, 39.99418];
      let meshes = [];
      for (let i = 0; i < data.length; i++) {
        let linestring = new maptalks.LineString([origin, data[i]]);
        //texture-贴图信息
        const texture = new THREE.TextureLoader().load(
          require("@/assets/texture/lineTexture_white.png")
        );
        texture.anisotropy = 16;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const camera = threeLayer.getCamera();
        //THREE.MeshLine
        const material = new MeshLineMaterial({
          map: texture,
          useMap: true,
          lineWidth: 8,
          color: "#20bd7c",
          sizeAttenuation: false,
          transparent: true,
          near: camera.near,
          far: camera.far,
        });
        //maptalks.three.object
        meshes.push(
          new arcLine(
            linestring,
            { altitude: 0, height: 200, speed: 1 / 5 },
            material,
            threeLayer
          )
        );
      }
      return meshes;
    },
    async addCloudArcLineMesh() {
      if (!this.menshGroup.isMesh(this.cloudArcLineMesh)) {
        this.cloudArcLineMesh = await this.buildCloudArcLineMesh(
          "data/json/data_cloud_arcline_effect.json",
          this.threeLayer
        );
        this.menshGroup.addMesh(this.cloudArcLineMesh);
      }
      this.addCloudPoint();
    },
    addCloudPoint() {
      const cloudPointLayer = new PointLayer("cloudPoint", {});
      const cloudPointMarker = new maptalks.Marker([116.32297, 39.99418], {
        symbol: {
          markerFile: require("@/assets/texture/cloud.png"),
          markerOpacity: 1,
          markerWidth: 100,
          markerHeight: 100,
          markerDy: 50,
        },
      }).addTo(cloudPointLayer);
      this.groupLayer.addLayer(cloudPointLayer);
    },

    remove_CloudArcLineMesh() {
      let iconLayer = this.groupLayer.getLayer("iconLayer");
      let cloudPointLayer = this.groupLayer.getLayer("cloudPoint");
      if (iconLayer) {
        this.groupLayer.removeLayer(iconLayer);
      }
      if (cloudPointLayer) {
        this.groupLayer.removeLayer(cloudPointLayer);
      }
      this.menshGroup.removeMesh(this.cloudArcLineMesh);
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
          "data/json/data_building_effect.json",
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
          require("@/assets/texture/lineTexture.png")
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
          "data/json/data_arcline_effect.json",
          this.threeLayer
        );
        this.menshGroup.addMesh(this.arcLineMesh);
      }
    },
    remove_ArcLineMesh() {
      this.menshGroup.removeMesh(this.arcLineMesh);
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
