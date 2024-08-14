<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-select v-model="value" @change="changeSceneConfig">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
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
      options: [
        {
          value: "clear",
          label: "晴",
        },
        {
          value: "fog",
          label: "雾",
        },
        {
          value: "rain",
          label: "雨",
        },
        {
          value: "snow",
          label: "雪",
        },
      ],
      value: "雨",
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
       * 晴天(也就是天空盒)
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
    /**
     * 天气
     * 1.必须开启postProcess
     * 2.雾必须添加ground，否则看不见底图
     * 3.雾、雨、雪三种可叠加使用
     */
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
      //地面
      ground: {
        enable: true,
        renderPlugin: {
          type: "fill",
        },
        symbol: {
          polygonFill: [0.803921568627451, 0.803921568627451, 0.803921568627451, 1],
          polygonOpacity: 1,
        },
      },
      //天气
      weather: {
        enable: true,
        // fog: {
        //   enable: true,
        //   start: 0.1,
        //   end: 26,
        //   color: [0.9, 0.9, 0.9],
        // },
        rain: {
          enable: true,
          windDirectionX: 0, //沿 X 轴风向（度）
          windDirectionY: 0, //沿 Y轴风向（度）
          rippleRadius: 11, //雨滴落下的水花半径
          rainWidth: 1, //雨滴宽度
          rainHeight: 1, //雨滴高度
          speed: 1, //速度
          density: 2000, //雨滴密度
          rainTexture: require("@/assets/hdr/rain1.png"), //雨滴材质
        },
        // snow: {
        //   enable: true,
        //   snowGroundTexture: require("@/assets/hdr/perlin.png"), //雪花材质
        // },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [baseLayer], { sceneConfig });
    this.groupLayer.addTo(this.map);
  },

  methods: {
    changeSceneConfig(value) {
      console.log(value);
      let sceneConfig = this.groupLayer.getSceneConfig();
      if (value == "clear") {
        sceneConfig.weather = {};
      }
      if (value == "fog") {
        sceneConfig.weather = {
          enable: true,
          fog: {
            enable: true,
            start: 0.1,
            end: 26,
            color: [0.9, 0.9, 0.9],
          },
        };
        sceneConfig.ground = {
          enable: true,
          renderPlugin: {
            type: "fill",
          },
          symbol: {
            polygonFill: [0.803921568627451, 0.803921568627451, 0.803921568627451, 1],
            polygonOpacity: 1,
          },
        };
      }
      if (value == "rain") {
        sceneConfig.weather = {
          enable: true,
          rain: {
            enable: true,
            windDirectionX: 0,
            windDirectionY: 0,
            rippleRadius: 11,
            rainWidth: 1,
            rainHeight: 1,
            speed: 1,
            density: 2000,
            rainTexture: require("@/assets/hdr/rain1.png"),
          },
        };
      }
      if (value == "snow") {
        sceneConfig.weather = {
          enable: true,
          snow: {
            enable: true,
            snowGroundTexture: require("@/assets/hdr/perlin.png"),
          },
        };
      }
      this.groupLayer.setSceneConfig(sceneConfig);
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
