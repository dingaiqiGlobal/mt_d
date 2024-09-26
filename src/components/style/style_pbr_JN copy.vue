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
      GeoJSONLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.99066, 36.66511],
      zoom: 9.5,
      pitch: 70,
      bearing: 0,
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
    this.GeoJSONLayer = new GeoJSONVectorTileLayer("VT", {
      data: "data/json/jn/jnqx.json",
    });
    /**
     * groupLayer
     */
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true },
        bloom: {
          enable: true, 
          factor: 0.1, 
          threshold: 0, 
          radius: 1.5, 
        },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [this.GeoJSONLayer], { sceneConfig });
    this.groupLayer.addTo(this.map);
    /**
     * 添加样式
     */
    this.setStyle();
  },

  methods: {
    /**
     *ExtrudePolygonLayer的作用是用来管理图形，方便的图形的批量显示，隐藏，添加等操作，所以其具有的特性是：、
     *看不见摸不着
     *没有click等这些事件的*****所以只能做展示用，业务上不推荐
     *继承了OverlayLayer的图层他们的用法都是一样的，仅仅是不同的图层管理的数据类别不同和渲染的形态不同罢了
     */
    setStyle() {
      let styleType1 = [
        {
          filter: true,
          renderPlugin: {
            type: "lit",
            dataConfig: {
              type: "3d-extrusion",
              altitudeProperty: null,
              minHeightProperty: null,
              altitudeScale: 1,
              defaultAltitude: 4000,
              topThickness: 0,
              top: true,
              side: false,
            },
            // sceneConfig: {
            //   animation: "swing",
            //   animationDuration: 1404,
            // },
          },
          symbol: {
            visible: true,
            bloom: false,
            ssr: false,
            polygonOpacity: 0.8,
            polygonFill: {
              type: "categorical",
              property: "NAME",
              stops: [
                ["钢城区", "#36ccfc"],
                ["槐荫区", "#00ff80"],
                ["济阳区", "#f71fb7"],
                ["莱芜区", "#1763fc"],
                ["历城区", "#1763fc"],
                ["历下区", "#a9ff00"],
                ["平阴县", "#f71fb7"],
                ["商河县", "#1763fc"],
                ["天桥区", "#a9ff00"],
                ["章丘区", "#36ccfc"],
                ["长清区", "#36ccfc"],
                ["市中区", "#dcff1e"],
              ],
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
              altitudeProperty: null,
              minHeightProperty: null,
              altitudeScale: 1,
              defaultAltitude: 4000,
              topThickness: 0,
              top: false,
              side: true,
            },
            // sceneConfig: {
            //   animation: "swing",
            //   animationDuration: 1404,
            // },
          },
          symbol: {
            bloom: false,
            ssr: false,
            polygonOpacity: 1,
            material: {
              baseColorTexture: "images/building/city/side_mode.jpg",
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
              uvScale: [0.015, 0.015], //uv坐标缩放比例
              uvOffset: [0, 0], //uv偏移量
              uvRotation: 0.8028514559173915,
              emissiveTexture: "images/building/city/side_mode.jpg", //自发光纹理路径
              emissiveFactor: [0, 0, 0], //自发光颜色值
              emitColorFactor: 1, //自发光颜色强度因子
              emitMultiplicative: 0, //自发光与原颜色是否是相乘，0表示相加，1表示相乘。
              albedoPBRFactor: 1,
              outputLinear: 0,
              clearCoatF0: 0.04,
              emitColor: [0, 0, 0],
            },
          },
        },
      ];
      const style = {
        style: [...styleType1, ...styleType2],
      };
      this.GeoJSONLayer.setStyle(style);
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
