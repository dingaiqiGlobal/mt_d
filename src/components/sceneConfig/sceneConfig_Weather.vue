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

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 17.1,
      bearing: 171,
      pitch: 80,
      spatialReference: {
        projection: "EPSG:3857",
      },
      /**
       * 晴天(天空盒)
       * 1.必须结合--GroupGLLayer
       * 2.sceneConfig开启environment环境属性
       */
      lights: {
        directional: {
          //方相光
          direction: [0.5, 0, -1],
          color: [1, 1, 1],
        },
        //环境光
        ambient: {
          //配置天空盒的资源
          resource: {
            url: {
              front: require("@/assets/hdr/446/front.jpg"),
              back: require("@/assets/hdr/446/back.jpg"),
              left: require("@/assets/hdr/446/left.jpg"),
              right: require("@/assets/hdr/446/right.jpg"),
              top: require("@/assets/hdr/446/top.jpg"),
              bottom: require("@/assets/hdr/446/bottom.jpg"),
            },
            prefilterCubeSize: 1024,
          },
          exposure: 0.787, //灯光强度
          hsv: [0, 0, 0],
          orientation: 0, //定向
        },
      },
    });
    /**
     * groupLayer
     * 1.底图必须加载GroupGLLayer中
     * 2.底图必须抬高至少0.4
     */
    let baseLayer = new maptalks.TileLayer("tile", {
      bufferPixel: 0, //瓦片之间有缝隙
      altitude: 1, //设置TileLayer的整体海拔
      urlTemplate:
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    });
    const sceneConfig = {
      //环境
      environment: {
        enable: true,
        mode: 1,
        level: 0,
        brightness: 0.489,
      },
      //后期处理
      postProcess: {
        enable: true,
      },
      /**
       * 天气
       * 1.必须开启后期处理
       */
      //   weather: {
      //     enable: true,
      //     fog: {
      //       enable: true,
      //       start: 0.1,
      //       end: 26,
      //       color: [0.9, 0.9, 0.9],
      //     },
      //   },
      //天气-雪
      weather: {
        enable: true,
        snow: {
          enable: true,
          snowGroundTexture: require("@/assets/hdr/perlin.png"),
        },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [baseLayer], { sceneConfig });
    this.groupLayer.addTo(this.map);
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
