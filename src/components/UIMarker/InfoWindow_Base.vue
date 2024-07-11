//maptalks里UI里的dom容器是maptalks自动生成的, 所以要想关闭UI,
//请调用UI的hide或者remove方法, 用户传入的dom只是UI的内容而已,
//内容作为dom容器的子节点了, //所以仅仅对你传入的dom节点进行隐藏等是不能关闭UI元素的
//point.closeInfoWindow(); //or point.removeInfoWindow();
//orpoint.getInfoWindow().hide(); //or infowindow.hide(); //point.setInfoWindow
//point.openInfoWindow();

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
import {
  GroupGLLayer,
  GeoJSONVectorTileLayer,
  PointLayer,
  GLTFLayer,
  GLTFMarker,
  MultiGLTFMarker,
} from "@maptalks/gl-layers";
import Util from "@/utils/Util";
import "./InfoWindow.css";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      gltfLayer: null,
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
    });
    this.groupLayer.addTo(this.map);

    //添加数据
    this.add_GroupGL_PointLayer();
    this.addGLTFLayer();

    /**
     * 单击事件
     * 矢量图层
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
      const target = identifyData;
      
      if (target?.geometry instanceof maptalks.Marker) {
        let marker = target.geometry;
        marker.setInfoWindow({
          content: this._infoWindow(marker, "标题", ["属性1", "属性2"]).content,
        });
        marker.openInfoWindow();
      }
      //gltf
      if (target?.data instanceof GLTFMarker) {
        let gltf=target.data
        gltf.setInfoWindow({
          content: this._infoWindow(gltf, "gltf", ["gltf属性1", "gltf属性2"]).content,
        });
        gltf.openInfoWindow();
      }
    });
  },

  methods: {
    _infoWindow(target, boxTitle, boxContent) {
      let Profile = Vue.extend({
        template: `<div class="infoWindow">
            <div class="title-box">{{title}}<span class="close-btn" @click="close">X</span></div>
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
            title: boxTitle,
            dataList: boxContent,
          };
        },
        methods: {
          close() {
            if (!target) return;
            target.closeInfoWindow();
          },
        },
      });
      const profile = new Profile().$mount();
      return {
        content: profile.$el,
      };
    },
    add_GroupGL_PointLayer() {
      const pointLayer = new PointLayer("GroupGL_Point");
      const marker = new maptalks.Marker([116.95221, 40.51171], {
        cursor: "pointer",
        symbol: {
          markerFile: "images/icon/icon_Red.png",
          markerOpacity: 1,
          markerWidth: 28,
          markerHeight: 40,
          textName: "GroupGL矢量点",
        },
      }).addTo(pointLayer);
      this.groupLayer.addLayer(pointLayer);
    },
    addGLTFLayer() {
      const symbol = {
        //变种写法
        // url: "data/model/Fox/Fox.gltf",
        // modelHeight: 240, //模型高度
        // scaleX: 1,
        // scaleY: 1,
        // scaleZ: 1,
        // rotationZ: 180,

        //标准写法
        url: "data/model/Fox/Fox.gltf",
        modelHeight: 500, //模型高度
        visible: true, //模型是否可见
        translation: [0, 0, 0], //模型在本地坐标系xyz轴上的偏移量
        rotation: [0, 0, 0], //模型在本地坐标系xyz轴上的旋转角度，单位角度
        scale: [1, 1, 24], //模型在本地坐标系xyz轴上的缩放倍数
        animation: true, //是否开启动画
        animationName: "Run", //动画序列名称
        loop: true, //是否开启动画循环
        speed: 1, //动画速度倍数
        fixSizeOnZoom: -1, //在给定级别上固定模型大小，不再随地图缩放而改变，设置为-1时取消
        anchorZ: "bottom", //模型在z轴上的锚点或对齐点，可选的值： top， bottom
        shadow: true, //是否开启阴影
        bloom: true, //是否开启泛光
        shader: "pbr", //模型绘制的shader，可选值：pbr, phong, wireframe
        uniforms: null, //选择的shader的材质参数Object。
      };

      this.gltfLayer = new GLTFLayer("gltf", {
        attribution: null, //属性
        minZoom: null,
        maxZoom: null,
        visible: true,
        opacity: 1,
        hitDetect: true, //是否开启图层绘制检测（动态鼠标样式），关闭可以提高性能
        collisionScope: "layer", //碰撞检测索引的适用范围： map或者layer
      });

      /**
       * gltfMarker
       */
      const gltfMarker = new GLTFMarker([116.915130,40.533630], {
        fitSize: 100, //模型加到地图上的初始尺寸，单位像素
        symbol,
        id: null,
        visible: true,
        interactive: true, //是否能够交互
        editable: true, //是否允许编辑
        cursor: null, //鼠标样式
        draggable: false, //是否允许拖拽
        dragOnAxis: null, //是否沿x轴或者y轴拖拽，可选的值为"x"或者"y
        zIndex: null,
      });
      this.gltfLayer.addGeometry(gltfMarker);

      /**
       * MultiGLTFMarker
       */
      const multiGLTFMarker = new MultiGLTFMarker(
        //Marker数据，数组[](在数据中设置偏移，旋转，缩放也可在symbol中设置)
        [
          {
            coordinates: [116.952210,40.475160  ], //经纬度
            translation: [0, 0, 0], //模型本地坐标系的偏移量，三位数组
            rotation: [0, 0, 0], //模型本地坐标系的旋转角度，单位度，三位数组
            scale: [1, 1, 1], //模型本地坐标系的缩放系数，三位数组
            color: [1, 0, 0, 1], //模型的基础色，四位归一化数组，颜色会与模型本身颜色相乘后绘制
          },
          {
            coordinates: [116.954960,40.454260],
            translation: [0, 2, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            color: [1, 1, 0, 1],
          },
        ],
        //options
        {
          fitSize: 100, //模型加到地图上的初始尺寸，单位像素
          id: null,
          visible: true,
          interactive: true, //是否能够交互
          editable: true, //是否允许编辑
          cursor: null, //鼠标样式
          draggable: false, //是否允许拖拽
          dragOnAxis: null, //是否沿x轴或者y轴拖拽，可选的值为"x"或者"y"
          zIndex: null,
          symbol: {
            url: "data/model/Fox/Fox.gltf",
            modelHeight: 500, //模型高度
            visible: true, //模型是否可见
            translation: [0, 0, 0], //模型在本地坐标系xyz轴上的偏移量
            rotation: [0, 0, 0], //模型在本地坐标系xyz轴上的旋转角度，单位角度
            scale: [1, 1, 1], //模型在本地坐标系xyz轴上的缩放倍数
            animation: true, //是否开启动画
            animationName: "Survey", //动画序列名称
            loop: true, //是否开启动画循环
            speed: 1, //动画速度倍数
            fixSizeOnZoom: -1, //在给定级别上固定模型大小，不再随地图缩放而改变，设置为-1时取消
            anchorZ: "bottom", //模型在z轴上的锚点或对齐点，可选的值： top， bottom
            shadow: true, //是否开启阴影
            bloom: true, //是否开启泛光
            shader: "pbr", //模型绘制的shader，可选值：pbr, phong, wireframe
            uniforms: null, //选择的shader的材质参数Object。
          },
        }
      ).addTo(this.gltfLayer);

      this.groupLayer.addLayer(this.gltfLayer);
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
