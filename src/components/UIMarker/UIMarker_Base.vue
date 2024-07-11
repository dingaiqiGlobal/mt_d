<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import Vue from "vue/dist/vue.esm.js"; //特殊引用
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, GeoJSONVectorTileLayer } from "@maptalks/gl-layers";

import Util from "@/utils/Util";
import UIMarkerLayer from "./UIMarkerLayer";
import "./UIMarkerLayer.css";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      uiMarkerLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.91788, 40.47202],
      zoom: 11,
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
    /**
     * groupLayer
     */
    this.groupLayer = new GroupGLLayer("group", [], {
      antialias: false, //是否开启WebGL原生抗锯齿
      geometryEvents: true, //是否允许子图层上的Geometry响应事件
      extensions: [], //必须开启的webgl扩展
      optionalExtensions: [], //可以选择开启的webgl扩展
      onlyWebGL1: false, //是否强制用WebGL 1渲染，用以解决少数webgl2环境存在问题的设备
      attribution: null, //图层版权声明
      minZoom: null,
      maxZoom: null,
      visible: true,
      opacity: 1,
      hitDetect: true, //是否开启图层绘制检测（动态鼠标样式），关闭可以提高性能
      collisionScope: "layer", //碰撞检测索引的适用范围:map或者layer
      //全局效果配置
      sceneConfig: {
        environment: {
          enable: true, // 是否开启环境天空盒绘制
          mode: 1, // 天空盒模式： 0: 氛围模式， 1: 实景模式
          level: 0, // 实景模式下的模糊级别，0-3
          brightness: 1, // 天空盒的明亮度，-1 - 1， 默认为0
        },
        shadow: {
          type: "esm", // 阴影模式，固定为esm
          enable: true, // 是否开启
          quality: "high", // 阴影质量，可选的值：high, medium, low
          opacity: 1, // 阴影的透明度，0 - 1
          color: [0, 0, 0], // 阴影的颜色，归一化三位rgb颜色值
          blurOffset: 1, // 阴影模糊偏移量，值越高阴影越模糊
        },
        postProcess: {
          enable: true, // 是否开启后处理
          antialias: {
            enable: true, // 是否开启FXAA后处理
            taa: true, // 是否开启taa后处理
          },
          ssr: {
            enable: true, // 是否开启屏幕空间反射
          },
          ssao: {
            enable: true, // 是否开启屏幕空间环境光遮蔽
            bias: 0.03, // 阴影偏移值，越大，阴影就越清晰，0.05 - 1
            radius: 0.08, // 遮蔽半径，越大，阴影就越清晰， 0.05 - 1
            intensity: 1.5, // 强度因子， 0.1 - 5
          },
          sharpen: {
            enable: false, // 是否开启锐化
            factor: 0.2, // 强度因子，0 - 1
          },
          bloom: {
            enable: true, // 是否开启泛光
            factor: 1, // 强度因子 0.1 - 5
            threshold: 0, // 最小阈值（亮度低于阈值的区域不发光） 0 - 1
            radius: 1, // 泛光半径 0.1 - 4
          },
          outline: {
            enable: true, // 是否开启高亮后处理
          },
        },
      },
    });
    this.groupLayer.addTo(this.map);

    //添加数据
    this.loadData("data/json/data_MiYun_Point_lit.json");
    /**
     * 单击事件
     */
    this.map.on("click", (e) => {
      const identifyData = e.coordinate
        ? this.groupLayer.identify(e.coordinate, {
            layers: [], //指定的子图层
            orderByCamera: true, //是否按照相机距离排序，更近的在前面
          })[0]
        : this.groupLayer.identifyAtPoint(e.containerPoint, {
            layers: [],
            orderByCamera: true,
          })[0];
      const target = identifyData && identifyData.data; //geojsonvt特殊可以获取到feature
      if (target) {
        const feature = target.feature;
        this._uiMarker(e.coordinate, "测试", feature);
      }
    });
  },

  methods: {
    loadData(url) {
      let id = Util.generateUUID();
      let GeoJSONLayer = new GeoJSONVectorTileLayer(id, {
        data: url,
        minZoom: 1,
        maxZoom: 22,
      });
      this.groupLayer.addLayer(GeoJSONLayer);
    },
    _uiMarker(coordinate, title, feature) {
      let that = this;
      if (!feature) return;
      let Profile = Vue.extend({
        template: `<div class="profile">
            <div class="title-box">{{title}}<span class="close-btn" @click="closeUiMarker">X</span></div>
            <div class="content-box">
              <div class="content-group">
                <div class="content-item" v-for="item in dataList" :key="item.id">
                  <span>{{item}}</span>
                </div>
              </div>
            </div>
            </div>`,
        data() {
          return {
            title: title,
            data: feature.properties,
          };
        },
        computed: {
          dataList: function () {
            return [...Object.values(this.data)];
          },
        },
        methods: {
          closeUiMarker() {
            // 销毁当前组件实例
            this.$destroy();
            // 可选：从DOM中移除组件的挂载点
            const element = this.$el;
            element.parentNode.removeChild(element);
          },
        },
      });
      const profile = new Profile().$mount();
      this.uiMarkerLayer = new UIMarkerLayer().addTo(this.map);
      let uiMarker = new maptalks.ui.UIMarker(coordinate, {
        containerClass: "UIMarkerLayer", //css类名
        single: true, //false为全局单个标记
        content: profile.$el,
        verticalAlignment: "top",
        eventsPropagation: false, //是否停止所有事件的传播（事件冒泡）
      });
      this.uiMarkerLayer.addMarker(uiMarker);
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
