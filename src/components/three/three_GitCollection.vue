<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button type="" @click="addRingEffectMesh">添加环形效果</button>
      <button type="" @click="removeRingEffectMesh">移除环形效果</button>
      <br />
      <button type="" @click="addElectricShieldMesh">添加电子屏蔽</button>
      <button type="" @click="removeElectricShieldMesh">移除电子屏蔽</button>
      <br />
      <button type="" @click="addRingBuildMesh">添加扩散圆柱</button>
      <button type="" @click="removeRingBuildMesh">移除扩散圆柱</button>
      <br />
      <button type="" @click="add_Radar">添加雷达</button>
      <button type="" @click="remove_Radar">移除雷达</button>
      <br />
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
//环形效果
import { getRingEffectMaterial } from "@/sceneEffect/shader/shader"; //电子屏蔽材料

//电子屏蔽
import ElectricShield from "@/sceneEffect/maptalks.three.objects/electricShield"; //电子屏蔽
import RingTextureEffect from "@/sceneEffect/maptalks.three.objects/ringTextureEffect"; //环形纹理
import { getElectricShieldMaterial } from "@/sceneEffect/shader/shader"; //电子屏蔽材料
import { getDiffusionShieldMaterial } from "@/sceneEffect/shader/shader"; //扩散屏蔽材料
//扩散圆柱
//import rippleWall from "@/sceneEffect/maptalks.three.objects/rippleWall";//共用
import { getWallTextureMaterial } from "@/sceneEffect/shader/shader";

//雷达
import RingEffect from "@/sceneEffect/maptalks.three.objects/ringEffect"; //ring环形
import { getRadarMetarial } from "@/sceneEffect/shader/shader"; //雷达
import { FlabellumScanMaterial } from "@/sceneEffect/shader/shader"; //扫描

//海面
import Ocean from "@/sceneEffect/maptalks.three.objects/ocean"; //ocean大海
//流光墙
import rippleWall from "@/sceneEffect/maptalks.three.objects/rippleWall";
import { getRippleWall } from "@/sceneEffect/shader/shader"; //蓝色幕墙
import { getMeteorMaterial } from "@/sceneEffect/shader/shader"; //黄色幕墙
import { getBreathWallMaterial } from "@/sceneEffect/shader/shader"; //333
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
      ringEffectMesh: [], //环形效果
      electricShieldMesh: [], //电子屏蔽
      ringBuildMesh: [], //扩散圆柱
      radarMesh: [], //雷达
      oceanMesh: [], //海面
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
     * 环形效果
     */
    getRingMesh(coord, threeLayer, color, type) {
      let object = new RingEffect(
        coord,
        { radius: 50, speed: 0.0025 },
        getRingEffectMaterial(color, type),
        threeLayer
      );
      // let v = threeLayer.coordinateToVector3([c.x, c.y]);
      // //内部半径 外部半径 圆环的分段数(值越大，圆环就越圆) 最小值为1，默认值为8  起始角度(默认值为0) 圆心角，默认值为Math.PI * 2
      // let object = new THREE.Mesh(
      //   new THREE.RingBufferGeometry(0.001, 0.1, 20, 5, 0, Math.PI * 2),
      //   this.getRingEffectMaterial(c.color, c.type)
      // );
      // object.position.x = v.x;
      // object.position.y = v.y;
      // object.position.z = 0.1;
      object.renderOrder = 4;
      return object;
    },
    async build_RingEffect_Menshs(url, threeLayer) {
      let data = await this.getJsonData(url);
      let meshes = [];
      for (let i = 0; i < data.length; i++) {
        //两种效果
        if (i % 2 == 0) {
          meshes.push(this.getRingMesh(data[i], threeLayer, "#8ae20c", 0));
        } else {
          meshes.push(this.getRingMesh(data[i], threeLayer, "#cc5dff", 1));
        }
      }
      return meshes;
    },
    async addRingEffectMesh() {
      this.ringEffectMesh = await this.build_RingEffect_Menshs(
        "data/json/data_effect_point4.json",
        this.threeLayer
      );
      this.menshGroup.addMesh(this.ringEffectMesh);
    },
    removeRingEffectMesh() {
      this.menshGroup.removeMesh(this.ringEffectMesh);
    },

    /**
     * 电子屏蔽
     */
    getBallMesh(coord, threeLayer) {
      //ball1---有点问题，不加也可以
      // let ball1 = new ElectricShield(
      //   coord,
      //   { radius: 250 },
      //   getElectricShieldMaterial({
      //     color: "#32CD32",
      //     opacity: 1,
      //   }),
      //   threeLayer
      // );
      //ball1.getObject3d().renderOrder = 6;

      //ball2
      let ball2 = new ElectricShield(
        coord,
        { radius: 250, speed: 0.015 },
        getDiffusionShieldMaterial({
          color: "#9999FF",
          num: 3,
          opacity: 1,
        }),
        threeLayer
      );
      ball2.getObject3d().renderOrder = 6;
      //底面
      const texture = new THREE.TextureLoader().load(require("@/assets/effect/ring.png"));
      texture.needsUpdate = true; //使用贴图时进行更新
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        transparent: true,
        color: "#fff",
        side: THREE.DoubleSide,
      });
      let object = new RingTextureEffect(
        coord,
        { radius: 100, speed: 2 },
        material,
        threeLayer
      );
      //return [ball1, ball2, object];
      return [ball2, object];
    },
    async build_ElectricShield_Menshs(url, threeLayer) {
      let data = await this.getJsonData(url);
      let meshes = [];
      for (let i = 0; i < data.length; i++) {
        meshes.push(this.getBallMesh(data[i], threeLayer));
      }
      return meshes;
    },
    async addElectricShieldMesh() {
      this.electricShieldMesh = await this.build_ElectricShield_Menshs(
        "data/json/data_effect_point3.json",
        this.threeLayer
      );
      this.menshGroup.addMesh(this.electricShieldMesh);
    },
    removeElectricShieldMesh() {
      this.menshGroup.removeMesh(this.electricShieldMesh);
    },

    /**
     * 扩散圆柱
     */
    getringBuildMesh(coord, threeLayer) {
      let ringCircle = new maptalks.Circle(coord, 100);
      let material = getWallTextureMaterial({
        image: require("@/assets/effect/linear.png"),
        color: "#f00",
        opacity: 0.6,
      });
      //material二
      //let material = getRippleWall();

      //mesh添加方式一
      // let mesh = threeLayer.toExtrudePolygon(
      //   ringCircle,
      //   {
      //     height: 150,
      //     //topColor: "#fff",
      //     addTopBottom: false,
      //   },
      //   material
      // );
      //mesh添加方式二
      let mesh = new rippleWall(
        coord,
        { height: 250, isCircle: 1, radius: 100 },
        material,
        threeLayer
      );
      //动画
      let num = 0;
      animate();
      function animate() {
        num += 0.01;
        if (num > 4) num = 0;
        mesh.getObject3d().scale.set(num, num, 1);
        requestAnimationFrame(animate);
      }
      return [mesh];
    },
    async build_RingBuild_Menshs(url, threeLayer) {
      let data = await this.getJsonData(url);
      let meshes = [];
      for (let i = 0; i < data.length; i++) {
        meshes.push(this.getringBuildMesh(data[i], threeLayer));
      }
      return meshes;
    },
    async addRingBuildMesh() {
      this.ringBuildMesh = await this.build_RingBuild_Menshs(
        "data/json/data_effect_point2.json",
        this.threeLayer
      );
      this.menshGroup.addMesh(this.ringBuildMesh);
    },
    removeRingBuildMesh() {
      this.menshGroup.removeMesh(this.ringBuildMesh);
    },
    /**
     * 雷达
     */
    getRadarMesh(coord, threeLayer) {
      let object = new RingEffect(
        coord,
        { radius: 260, speed: 0.01 },
        getRadarMetarial({ color: "#CC3366", type: 2 }),
        threeLayer
      );
      return [object];
    },
    getScanRadarMesh(coord, threeLayer) {
      let v = threeLayer.coordinateToVector3(coord);
      const r = threeLayer.distanceToVector3(500, 500).x;
      let object = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(r, r, 2),
        FlabellumScanMaterial()
      );
      object.position.x = v.x;
      object.position.y = v.y;
      object.position.z = 0.1;
      object.renderOrder = 3;
      return [object];
    },
    async build_Radar_Menshs(url, threeLayer) {
      let data = await this.getJsonData(url);
      let meshes = [];
      for (let i = 0; i < data.length; i++) {
        meshes.push(this.getRadarMesh(data[i], threeLayer)); //转圈
        meshes.push(this.getScanRadarMesh(data[i], threeLayer)); //扫描
      }
      return meshes;
    },
    async add_Radar() {
      this.radarMesh = await this.build_Radar_Menshs(
        "data/json/data_effect_point1.json",
        this.threeLayer
      );
      this.menshGroup.addMesh(this.radarMesh);
    },
    remove_Radar() {
      this.menshGroup.removeMesh(this.radarMesh);
    },

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
      this.oceanMesh = await this.getWaterMesh(
        "data/json/data_effect_water.json",
        this.threeLayer
      );
      this.menshGroup.addMesh(this.oceanMesh); //效果不如maptalks
    },
    remove_Ocean() {
      this.menshGroup.removeMesh(this.oceanMesh);
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
        if (i == 1||i == 2||i == 3) {
          meshes.push(this.getRippleWallMesh(data[i][0], threeLayer));
        }
        if (i == 4||i == 5||i == 6) {
          meshes.push(this.getMeteorMesh(data[i][0], threeLayer));
        }
        if (i == 7||i == 8||i == 9) {
          meshes.push(this.getBreathWallMesh(data[i][0], threeLayer));
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
      let mesh = new rippleWall(coord, { height: 250 }, material, threeLayer);
      mesh.getObject3d().renderOrder = 11;
      return [mesh];
    },
    getBreathWallMesh(coord, threeLayer) {
      let material = getBreathWallMaterial();
      let mesh = new rippleWall(coord, { height: 250 }, material, threeLayer);
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
