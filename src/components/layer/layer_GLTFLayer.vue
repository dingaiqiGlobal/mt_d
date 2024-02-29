<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import { Map, TileLayer } from "maptalks";
import {
  GroupGLLayer,
  GLTFLayer,
  GLTFMarker,
  MultiGLTFMarker,
} from "@maptalks/gl-layers";
export default {
  components: {},

  data() {
    return {
      map: null,
      gltfLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new Map("map", {
      center: [116.39259, 39.90473],
      zoom: 15,
      pitch: 60,
      centerCross: false,
      doubleClickZoom: false,
      baseLayer: new TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
    });

    this.addGLTFLayer();
  },

  methods: {
    /**
     * GLTF图层包含
     * GLTFLayer
     * GLTFMarker
     * MultiGLTFMarker
     */
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
      const gltfMarker = new GLTFMarker(this.map.getCenter(), {
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
            coordinates: [116.39002, 39.89861], //经纬度
            translation: [0, 0, 0], //模型本地坐标系的偏移量，三位数组
            rotation: [0, 0, 0], //模型本地坐标系的旋转角度，单位度，三位数组
            scale: [1, 1, 1], //模型本地坐标系的缩放系数，三位数组
            color: [1, 0, 0, 1], //模型的基础色，四位归一化数组，颜色会与模型本身颜色相乘后绘制
          },
          {
            coordinates: [116.39358, 39.89874],
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

      //GroupLayer
      const groupLayer = new GroupGLLayer("group", [this.gltfLayer], {});
      groupLayer.addTo(this.map);
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
