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
//包裹
import rippleWall from "@/utils/maptalks.three.objects/rippleWall";
import { getRippleWall, getMeteorMaterial } from "@/utils/shader/shader";
import { rippleWallCoord, rippleWallCoord2, ringCoord } from "@/utils/config/index";
//弧线

import { MeshLineMaterial } from "@/utils/lib/THREE.MeshLine";
//可以采用npm方式
//cnpm i three.meshline@1.2.0 --save
//cnpm install three@0.116.1 --save  //three版本固定
//import { MeshLineMaterial,} from 'three.meshline';
import arcLine from "@/utils/maptalks.three.objects/arcLine";

export default {
  components: {},

  data() {
    return {
      map: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [121.4943311876787, 31.244199],
      zoom: 17,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", //dark_all
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });
    this.initLayer();
  },

  methods: {
    initLayer() {
      let threeLayer = new ThreeLayer("t", {
        forceRenderOnMoving: true,
        forceRenderOnRotating: true,
        forceRenderOnZooming: true,
        animation: true,
      });
      let meshs = [];
      //准备绘图
      threeLayer.prepareToDraw = (gl, scene, camera) => {
        //平行光
        // let light = new THREE.DirectionalLight(0xffffff, 2);
        // light.position.set(0, -10, 10);
        // scene.add(light);

        //添加飞线
        this.addArcLine(threeLayer);

        //墙体mesh实例化
        let RippleWallMesh = this.getRippleWallMesh(threeLayer);
        let MeteorMesh = this.getMeteorMesh(threeLayer);

        //添加网格
        threeLayer.addMesh(meshs.concat(RippleWallMesh, MeteorMesh));
        threeLayer.config("animation", true);
      };
      threeLayer.addTo(this.map);
    },
    //黄色包裹
    getMeteorMesh(threeLayer) {
      let material = getMeteorMaterial(); //shader
      let mesh = new rippleWall(rippleWallCoord, { height: 250 }, material, threeLayer);
      mesh.getObject3d().renderOrder = 11;
      return [mesh];
    },
    //蓝色包裹
    getRippleWallMesh(threeLayer) {
      let material = getRippleWall(); //shader
      let mesh = new rippleWall(rippleWallCoord2, { height: 250 }, material, threeLayer); //maptalks.three
      mesh.getObject3d().renderOrder = 11;
      return [mesh];
    },
    //弧线
    addArcLine(threeLayer) {
      ringCoord.forEach((item) => {
        let path = [
          [121.50696853557473, 31.24378441172011],
          [item.x, item.y],
        ];
        let linestring = new maptalks.LineString(path);
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
        let arcline = new arcLine(
          linestring,
          { altitude: 0, height: 400, speed: 1 / 5 },
          material,
          threeLayer
        );
        threeLayer.addMesh(arcline);
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
