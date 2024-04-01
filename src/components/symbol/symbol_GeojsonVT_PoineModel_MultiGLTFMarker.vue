<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import * as dat from "dat.gui";
import { Map, TileLayer, GeoJSON } from "maptalks";
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
      groupLayer: null,
      data:null
    };
  },

  computed: {},

  mounted() {
    this.initGui();
    this.map = new Map("map", {
      center: [116.93573, 40.53259],
      zoom: 14,
      pitch: 80,
      bearing: 0,
      spatialReference: {
        projection: "EPSG:3857",
      },
      lights: {
        directional: {
          direction: [1, 0, -1],
          color: [1, 1, 1],
        },
        ambient: {
          resource: {
            prefilterCubeSize: 1024,
          },
          hsv: [0, 0.34, 0],
          orientation: 0,
        },
      },
      baseLayer: new TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });
    this.groupLayer = new GroupGLLayer("group", [], {
      sceneConfig: {
        environment: {
          enable: true,
          mode: 1,
          level: 0,
          brightness: 0,
        },
        postProcess: {
          enable: true,
          bloom: {
            enable: true,
            threshold: 0,
            factor: 0.6,
            radius: 1,
          },
        },
      },
    });
    this.groupLayer.addTo(this.map);
    //添加图层
    this.getData();
  },

  methods: {
    addGltfLayer(data) {
      let gltfLayer = new GLTFLayer("gltfLayer");
      let symbol = {
        url: "data/model/Fox/Fox.gltf",
        modelHeight: 400,
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
        shadow: false, //是否开启阴影
        bloom: false, //是否开启泛光
        shader: "pbr", //模型绘制的shader，可选值：pbr, phong, wireframe
        uniforms: {
          polygonOpacity: 1,
          polygonFill: [1, 1, 1, 1],
          metallicFactor: 0,
          roughnessFactor: 0.4,
        },
      };
      const multiGLTFMarker = new MultiGLTFMarker(data, {
        fitSize: 100, //模型加到地图上的初始尺寸，单位像素
        id: null,
        zIndex: null,
        symbol: symbol,
      }).addTo(gltfLayer);
      this.groupLayer.addLayer(gltfLayer, "gltfLayer");
    },
    getData() {
      fetch(`data/json/data_MiYun_Point.json`)
        .then((response) => response.json())
        .then((json) => {
          GeoJSON.toGeometryAsync(json).then((geos) => {
            let data=geos.map((p) => {
              let coordinate = p.getCoordinates();
              return {coordinates:[coordinate.x, coordinate.y]};
            });
            this.addGltfLayer(data);
          });
        });
    },
    initGui() {
      /**
       * GUI
       */
      this.gui = new dat.GUI();
      this.gui.domElement.style = "position:absolute;top:10px;left:10px";
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
