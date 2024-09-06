<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import * as maptalks from "maptalks";
import { Map, TileLayer } from "maptalks";
import { GroupGLLayer, Geo3DTilesLayer } from "@maptalks/gl-layers";
import "@maptalks/transcoders.draco";
// import "@maptalks/transcoders.crn";
// import "@maptalks/transcoders.ktx2";

import gcoord from "gcoord";

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

    const baseLayer = new TileLayer("base", {
      urlTemplate:
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      spatialReference: {
        projection: "EPSG:3857",
      },
    });
    /**
     * 3dtiles
     */
    //1.Geo3DTilesLayer也可以通过配置offset参数来对其进行坐标纠偏的,用法和TileLayer一样
    function offset(z) {
      //坐标转换的第三方库 https://github.com/hujiulong/gcoord
      const center = map.getCenter();
      const res = map.getGLRes();
      // 坐标由 WGS84 转为 GCJ02
      const c = gcoord.transform(center.toArray(), gcoord.WGS84, gcoord.AMap);
      const coord = map.coordToPointAtRes(new maptalks.Coordinate(c), res);
      const offset = map.coordToPointAtRes(center, res)._sub(coord);
      return offset.toArray();
    }
    //2.解决3dtils太大导致 idle调度 性能影响较大  加载点线面卡的问题
    maptalks.GlobalConfig.enableIdle = false;
    //3.具体设置
    const geo3DTilesLayer = new Geo3DTilesLayer("Geo3DTilesLayer", {
      geometryEvents: true, //考虑到性能问题Geo3DTilesLayer的事件交互(geometryEvents)默认是关闭的
      maxGPUMemory: 512, //最大缓存数，单位 M bytes
      loadingLimitOnInteracting: 1, //地图交互过程中切片请求的并发数
      loadingLimit: 0, //请求切片的并发数量,默认是没有限制，我们可以配置其为一个合适的值，避免单位时间内大面积的网络请求和数据回到导致卡顿
      //offset//坐标纠偏
      services: [
        {
          url: "data/3dtiles/BuildingBlue/tileset.json",
          // urlParams : '',//额外的模型url请求参数
          maximumScreenSpaceError: 16, //该值越小，渲染精度越高，项目允许的情况下，该值越大性能越好
          ambientLight: [0.2, 0.2, 0.2], //环境光照值，倾斜摄影可以设为[1.0, 1.0, 1.0]获得最清晰的效果，非倾斜摄影可以适当降低，例如设为 [0.2, 0.2, 0.2]（如果不设置，则采用地图上的默认光照值）
          heightOffset: 8, //模型海拔的偏移量量，有时加载的数据可能悬浮在半空,这是就可以调节这个参数来使其贴地等
          scale: [1, 1, 1], //3dtile整体的缩放参数
          rotation: [0, 0, 0], //3dtile整体的旋转参数
          coordOffset: [0, 0], //3dtile整体偏移量参数
        },
      ],
    });
    geo3DTilesLayer.once("loadtileset", (e) => {
      const extent = geo3DTilesLayer.getExtent(e.index);
      this.map.fitExtent(extent, 0, {
        animation: false,
      });
    });

    const groupLayer = new GroupGLLayer("group", [geo3DTilesLayer, baseLayer], {
      sceneConfig: {
        environment: {
          enable: true,
          mode: 1,
          level: 0,
          brightness: 1,
        },
        postProcess: {
          enable: true,
          antialias: {
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
