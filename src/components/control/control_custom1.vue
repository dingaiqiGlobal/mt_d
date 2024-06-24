<template>
  <div>
    <div id="map" class="container"></div>
    <div id="json"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import { Map, TileLayer, Marker, control } from "maptalks";
import { GroupGLLayer, PointLayer } from "@maptalks/gl-layers";
import Vue from "vue";
export default {
  components: {},
  data() {
    return {
      map: null,
    };
  },

  computed: {},

  mounted() {
    //Control如果是定义在map的options里是可以toJSON存储的，但如果是自己创建的是不行
    this.map = new Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new TileLayer("基础底图1", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", //dark_all
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
      attribution: false,
      // zoomControl: {
      //   position: { bottom: "230", right: "10" },
      //   slider: true,
      //   zoomLevel: false,
      // },
    });

    /**
     * 添加到map上
     */
    let controlList = {
      scale: {
        position: [116.37405, 39.93185],
        bgColor: "#fff",
        bgImg: "images/icon/icon_Red.png",
      },
      legend: {
        position: [116.37405, 39.93185],
        bgColor: "#fff",
        bgImg: "images/icon/icon_Red.png",
      },
      search: {
        position: [116.37405, 39.93185],
        bgColor: "#fff",
        bgImg: "images/icon/icon_Red.png",
      },
      tools: {
        position: [116.37405, 39.93185],
        bgColor: "#fff",
        bgImg: "images/icon/icon_Red.png",
      },
    };
    this.map.setOptions(controlList);
    /**
     * toJSON
     */
    setTimeout(() => {
      this.toJson();
    }, 3000);

    const mapJSON = this.map.toJSON();
    if (mapJSON?.options?.scale) {
      //动态创建uiMarker
    }
  },

  methods: {
    toJson() {
      const mapJSON = this.map.toJSON();
      document.getElementById("json").innerHTML = JSON.stringify(mapJSON);
    },
  },
};
</script>
<style lang="less" scope>
#json {
  position: fixed;
  background-color: rgba(13, 13, 13, 0.5);
  padding: 10px 10px 10px 10px;
  font: 13px bold sans-serif;
  color: #fff;
  left: 0px;
  top: 0px;
  width: 900px;
  height: 185px;
  overflow: auto;
}
</style>
