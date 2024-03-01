<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import { Map, TileLayer, Circle } from "maptalks";
import { GroupGLLayer, Geo3DTilesLayer, ClipOutsideMask } from "@maptalks/gl-layers";
import "@maptalks/transcoders.draco";
// import "@maptalks/transcoders.crn";
import "@maptalks/transcoders.ktx2";
export default {
  components: {},

  data() {
    return {
      map: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      layers: [],
      lights: {
        directional: {
          direction: [1, 0, -1],
          color: [1, 1, 1],
        },
        ambient: {
          resource: {
            url: {
              front: "images/skybox/gradient/front.png",
              back: "images/skybox/gradient/back.png",
              left: "images/skybox/gradient/left.png",
              right: "images/skybox/gradient/right.png",
              top: "images/skybox/gradient/top.png",
              bottom: "images/skybox/gradient/bottom.png",
            },
            prefilterCubeSize: 256,
          },
          exposure: 0.8,
          hsv: [0, 0.34, 0],
          orientation: 1,
        },
      },
    });
    /**
     * 底图
     */
    const baseLayer = new TileLayer("base", {
      urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c", "d"],
      attribution:
        '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      spatialReference: {
        projection: "EPSG:3857",
      },
    });
    /**
     * circle蒙皮（只裁剪3dtiles***）
     * circle.getShell()//获取圆边上的坐标集合***
     */
    let circleGeometry = new Circle([116.40134, 39.89874], 30, {
      id: "circle0",
      properties: {
        name: "circle0",
      },
    });
    const coordinates = circleGeometry.getShell();
    const mask = new ClipOutsideMask([coordinates]); //ClipOutsideMask 是Polygon的子类,使用方式和Polygon一样
    /**
     * 3dtiles
     */
    const geo3DTilesLayer = new Geo3DTilesLayer("Geo3DTilesLayer", {
      geometryEvents: true, //考虑到性能问题Geo3DTilesLayer的事件交互(geometryEvents)默认是关闭的
      services: [
        {
          url: "data/3dtiles/bim/tileset.json",
          maximumScreenSpaceError: 16, //该值越小，渲染精度越高，项目允许的情况下，该值越大性能越好
          ambientLight: [0.2, 0.2, 0.2],
          heightOffset: 8,
          scale: [1, 1, 1], //3dtile整体的缩放参数
          rotation: [0, 0, 0], //3dtile整体的旋转参数
          coordOffset: [0, 0], //3dtile整体偏移量参数
        },
      ],
    });
    geo3DTilesLayer.once("loadtileset", (e) => {
      geo3DTilesLayer.setMask(mask); //设置蒙皮
      const extent = geo3DTilesLayer.getExtent(e.index);
      this.map.fitExtent(extent, 0, {
        animation: false,
      });
    });

    /**
     * groupLayer
     */
    const groupLayer = new GroupGLLayer("group", [geo3DTilesLayer, baseLayer], {
      sceneConfig: {
        environment: {
          enable: true, // 是否开启环境天空盒绘制
          mode: 1, // 天空盒模式： 0: 氛围模式， 1: 实景模式
          level: 0, // 实景模式下的模糊级别，0-3
          brightness: 1, // 天空盒的明亮度，-1 - 1， 默认为0
        },
        postProcess: {
          enable: true, // 是否开启后处理
          antialias: {
            ////开启抗锯齿后处理
            enable: true,
          },
        },
      },
    });
    groupLayer.addTo(this.map);
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
