<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button @click="_copy">拷贝</button>
    </div>
  </div>
</template>

<script>
import * as maptalks from "maptalks";
import { GroupGLLayer, GLTFMarker, GLTFLayer } from "@maptalks/gl-layers";
export default {
  components: {},

  data() {
    return {
      map: null,
      gltfLayer: null,
      gltfMarker: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 15,
      pitch: 60,
      centerCross: false,
      doubleClickZoom: false,
      baseLayer: new maptalks.TileLayer("tile", {
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
     * maptalks webgl 图层的汇总包;
     * 包含的插件
     * @maptalks/gl
     * @maptalks/analysis
     * @maptalks/vt
     * @maptalks/gltf-layer
     * @maptalks/3dtiles
     * @maptalks/video-layer@maptalks/transform-control
     * @maptalks/msd-json-loader
     */
    addGLTFLayer() {
      const symbol = {
        url: "data/model/Fox/Fox.gltf",
        modelHeight: 240, //模型高度
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        rotationZ: 180,
      };

      this.gltfLayer = new GLTFLayer("gltf",{
        attribution:null,//属性
        minZoom:null,
        maxZoom:null,
        visible:true,
        opacity:1,
        hitDetect:true,//是否开启图层绘制检测（动态鼠标样式），关闭可以提高性能
        collisionScope:"layer",//碰撞检测索引的适用范围： map或者layer
      }).addTo(this.map);

      this.gltfMarker = new GLTFMarker(this.map.getCenter(), {
        fitSize:100,//模型加到地图上的初始尺寸，单位像素
        symbol,
        id:null,
        visible:true,
        interactive:true,//是否能够交互
        editable:true,//是否允许编辑
        cursor:null,//鼠标样式
        draggable:false,//是否允许拖拽
        dragOnAxis:null,//是否沿x轴或者y轴拖拽，可选的值为"x"或者"y
        zIndex:null
      });
      this.gltfLayer.addGeometry(this.gltfMarker);
    },
    _copy() {
      const copyOne = this.gltfMarker.copy().addTo(this.gltfLayer);
      copyOne.setCoordinates([116.3998, 39.9127, 800]);
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
