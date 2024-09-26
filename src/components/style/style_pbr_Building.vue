<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, GeoJSONVectorTileLayer } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      GeoJSONLayer1: null,
      GeoJSONLayer2: null,
      GeoJSONLayer3: null,
      GeoJSONLayer4: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.30449, 39.97972],
      zoom: 16.5,
      pitch: 90,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      }),
      lights: {
        directional: {
          direction: [-1, 0, -1],
          color: [1, 1, 1],
        },
        ambient: {
          exposure: 1,
          hsv: [0, 0, 0.404],
          orientation: 130.213,
        },
      },
      layers: [],
    });
    /**
     * GeojsonVtLayer
     */
    this.GeoJSONLayer1 = new GeoJSONVectorTileLayer("VT1", {
      data: "data/json/bj/beijing_ZGC_Building1.json",
    });
    this.GeoJSONLayer2 = new GeoJSONVectorTileLayer("VT2", {
      data: "data/json/bj/beijing_ZGC_Building2.json",
    });
    this.GeoJSONLayer3 = new GeoJSONVectorTileLayer("VT3", {
      data: "data/json/bj/beijing_ZGC_Building3.json",
    });
    this.GeoJSONLayer4 = new GeoJSONVectorTileLayer("VT4", {
      data: "data/json/bj/beijing_ZGC_Building4.json",
    });
    /**
     * groupLayer
     */
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true },
      },
    };
    this.groupLayer = new GroupGLLayer(
      "group",
      [this.GeoJSONLayer1, this.GeoJSONLayer2, this.GeoJSONLayer3, this.GeoJSONLayer4],
      { sceneConfig }
    );
    this.groupLayer.addTo(this.map);
    /**
     * 添加样式
     */
    this.setStyle1();
    this.setStyle2();
    this.setStyle3();
    this.setStyle4();
  },

  methods: {
    /**
     * 顶面和侧面设置不同的纹理
     */
    setStyle1() {
      let styleType1 = [
        {
          //filter: ["all", ["==", "$layer", "VT"], ["==", "$type", "type1"]], //过滤图层
          renderPlugin: {
            type: "lit",
            dataConfig: {
              type: "3d-extrusion",
              altitudeProperty: "HEIGHT",
              minHeightProperty: null,
              altitudeScale: 1,
              defaultAltitude: 10,
              topThickness: 0,
              top: true,
              side: false,
            },
            sceneConfig: {
              animation: null,
              animationDuration: 800,
            },
          },
          filter: true,
          symbol: {
            visible: true,
            bloom: false,
            ssr: false,
            polygonOpacity: 0.6,
            //顶部材质说明
            material: {
              baseColorTexture: "images/building/city/webp8.jpg",
              baseColorFactor: [
                0.3137254901960784,
                0.30980392156862746,
                0.3137254901960784,
                1,
              ], //基础色四位归一化数组
              hsv: [-0.022, -0.511, -0.362], //色相，饱和度和明度，0-1
              baseColorIntensity: 0.84, //颜色强度
              contrast: 3.564, //颜色对比度
              outputSRGB: 1,
              roughnessFactor: 0.11, //粗糙度
              metallicFactor: 0.67, //金属度
              uvScale: [0.05, 0.05], //uv坐标缩放比例
              uvOffset: [0.2, 0.35], //uv偏移量
              uvRotation: 0.8028514559173915,
              emissiveTexture: "images/building/city/webp6.jpg", //自发光纹理路径
              emissiveFactor: [0, 0, 0], //自发光颜色值
              emitColorFactor: 0.27, //自发光颜色强度因子
              emitMultiplicative: 0, //自发光与原颜色是否是相乘，0表示相加，1表示相乘。
              albedoPBRFactor: 1,
              outputLinear: 0,
              clearCoatF0: 0.04,
              emitColor: [0, 0, 0],
            },
          },
        },
      ];
      let styleType2 = [
        {
          filter: true,
          renderPlugin: {
            type: "lit",
            dataConfig: {
              type: "3d-extrusion",
              altitudeProperty: "HEIGHT",
              altitudeScale: 1,
              defaultAltitude: 10,
              topThickness: 2,
              top: false,
              side: true,
            },
          },
          symbol: {
            bloom: false,
            ssr: false,
            polygonOpacity: 1,
            material: {
              baseColorTexture: "images/building/city/Facades_06_basecolor.jpg",
              baseColorFactor: [1, 1, 1, 1],
              hsv: [0, 0.446, -0.158],
              baseColorIntensity: 1.318,
              contrast: 1.414,
              outputSRGB: 1,
              metallicRoughnessTexture: "images/building/city/Facades_06_roughness.jpg", //金属度粗糙度的路径
              roughnessFactor: 0.7,
              metallicFactor: 1,
              normalTexture: "images/building/city/Facades_06_normalogl.jpg", //法线纹理
              uvScale: [0.86, 0.86],
              uvOffset: [0.35, 0],
              normalMapFactor: 0.69, //法线纹理的强度因子
              normalMapFlipY: 0,
              bumpTexture: "images/building/city/Facades_06_height.jpg", //凹凸纹理
              occlusionTexture: "images/building/city/Facades_06_ambientocclusion.jpg", //闭合纹理
            },
          },
        },
      ];
      const style = {
        style: [...styleType1, ...styleType2],
      };
      this.GeoJSONLayer1.setStyle(style);
    },
    /**
     * 垂直渐变色
     */
    setStyle2() {
      let styleType1 = [
        {
          filter: true,
          renderPlugin: {
            type: "lit",
            dataConfig: {
              type: "3d-extrusion",
              altitudeProperty: "HEIGHT",
              altitudeScale: 1,
              defaultAltitude: 10,
            },
            sceneConfig: {
              animation: null,
              animationDuration: 800,
            },
          },
          symbol: {
            bloom: false,
            ssr: false,
            topPolygonFill: "#6190e8", //顶部颜色
            bottomPolygonFill: "#a7bfe8", //底部颜色
            polygonOpacity: 1,
            material: {
              hsv: [0, 0, -0.021],
              baseColorIntensity: 1.585,
              contrast: 1.117,
              outputSRGB: 1,
              roughnessFactor: 1,
              metallicFactor: 0,
            },
          },
        },
      ];
      const style = {
        style: [...styleType1],
      };
      this.GeoJSONLayer2.setStyle(style);
    },
    /**
     * 顶部设置颜色，侧面设置纹理
     */
    setStyle3() {
      let styleType1 = [
        {
          filter: true,
          renderPlugin: {
            type: "lit",
            dataConfig: {
              type: "3d-extrusion",
              altitudeProperty: "HEIGHT",
              altitudeScale: 1,
              defaultAltitude: 10,
              topThickness: 2,
              top: true,
              side: false,
            },
          },
          sceneConfig: {
            animation: null,
            animationDuration: 800,
          },
          symbol: {
            material: {
              baseColorFactor: [0.5, 0.1, 0.5, 1],
              roughnessFactor: 1,
              metallicFactor: 0,
            },
          },
        },
        {
          filter: true,
          renderPlugin: {
            type: "lit",
            dataConfig: {
              type: "3d-extrusion",
              altitudeProperty: "HEIGHT",
              altitudeScale: 1,
              defaultAltitude: 10,
              topThickness: 2,
              top: false,
              side: true,
            },
          },
          sceneConfig: {
            animation: null,
            animationDuration: 800,
          },
          symbol: {
            material: {
              baseColorTexture: "images/building/city/side_mode.jpg",
              outputSRGB: 1,
              roughnessFactor: 0.69,
              metallicFactor: 0.16,
              uvScale: [0.84, 0.84],
            },
          },
        },
      ];
      const style = {
        style: [...styleType1],
      };
      this.GeoJSONLayer3.setStyle(style);
    },
    /**
     * 进场动画
     */
    setStyle4() {
      let styleType1 = [
        {
          filter: true,
          renderPlugin: {
            type: "lit",
            dataConfig: {
              type: "3d-extrusion",
              altitudeProperty: "HEIGHT",
              altitudeScale: 1,
              defaultAltitude: 10,
              topThickness: 2,
              top: true,
              side: true,
            },
            sceneConfig: {
              animation: "swing",
              animationDuration: 1404,
            },
          },
          symbol: {
            material: {
              baseColorFactor: [1, 1, 1, 1],
              roughnessFactor: 1,
              metallicFactor: 1,
            },
          },
        },
      ];
      const style = {
        style: [...styleType1],
      };
      this.GeoJSONLayer4.setStyle(style);
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
