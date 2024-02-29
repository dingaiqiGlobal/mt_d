<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import { Map, TileLayer } from "maptalks";
import { GroupGLLayer, Geo3DTilesLayer } from "@maptalks/gl-layers";
import "@maptalks/transcoders.draco";
// import "@maptalks/transcoders.crn";
// import "@maptalks/transcoders.ktx2";
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
      baseLayer: new TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });
    const geo3DTilesLayer = new Geo3DTilesLayer("Geo3DTilesLayer", {
      services: [
        {
          url: "data/3dtiles/bim/tileset.json",
          maximumScreenSpaceError: 16, //最大屏幕空间误差,清晰度可以接受的情况下，推荐把这个值设得越大越好，性能会越好
        //   heightOffset: -400,
        },
      ],
    });
    geo3DTilesLayer.once("loadtileset", (e) => {
      const extent = geo3DTilesLayer.getExtent(e.index);
      this.map.fitExtent(extent, 0, {
        animation: false,
      });
    });
    //groupLayer
    const groupLayer = new GroupGLLayer("group", [geo3DTilesLayer], {
      sceneConfig: {
        environment: {
          enable: true, // 是否开启环境天空盒绘制
          mode: 1, // 天空盒模式： 0: 氛围模式， 1: 实景模式
          level: 0, // 实景模式下的模糊级别，0-3
          brightness: 1, // 天空盒的明亮度，-1 - 1， 默认为0
        },
        postProcess: {
          enable: true, // 是否开启后处理
          antialias: {////开启抗锯齿后处理
                enable: true
            }
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
