<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button @click="addScale">增缩放</button>
      <button @click="addLegend">增图例</button>
      <button @click="remove('legend')">删</button>
      <button @click="update('legend', { bgColor: '#ding' })">改</button>
    </div>
    <div id="json"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import { Map, TileLayer, Marker, control } from "maptalks";
import { GroupGLLayer, PointLayer } from "@maptalks/gl-layers";
import ControlCustomSave from "./js/ControlCustomSave";
export default {
  components: {},
  data() {
    return {
      map: null,
      cl: null,
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

    this.cl = new ControlCustomSave(this.map);

    /**
     * 添加到map上
     */
    // let obj = {
    //   controlList: [
    //     {
    //       type: "scale",
    //       display: true,
    //       position: [116.37405, 39.93185],
    //       bgColor: "#fff",
    //       bgImg: "images/icon/icon_Red.png",
    //     },
    //     {
    //       type: "legend",
    //       display: true,
    //       position: [116.37405, 39.93185],
    //       bgColor: "#fff",
    //       bgImg: "images/icon/icon_Red.png",
    //     },
    //     {
    //       type: "search",
    //       display: true,
    //       position: [116.37405, 39.93185],
    //       bgColor: "#fff",
    //       bgImg: "images/icon/icon_Red.png",
    //     },
    //     {
    //       type: "tools",
    //       display: true,
    //       position: [116.37405, 39.93185],
    //       bgColor: "#fff",
    //       bgImg: "images/icon/icon_Red.png",
    //     },
    //   ],
    // };
    // this.map.setOptions(obj);
    /**
     * toJSON
     */
    setTimeout(() => {
      this.toJson();
    }, 3000);
  },

  methods: {
    toJson() {
      document.getElementById("json").innerHTML = "";
      const mapJSON = this.map.toJSON();
      document.getElementById("json").innerHTML = JSON.stringify(mapJSON);
    },
    addScale() {
      let scale = {
        type: "scale",
        display: true,
        alias:"缩放控件",
        position: [116.37405, 39.93185],
        bgColor: "#fff",
        bgImg: "images/icon/icon_Red.png",
      };
      this.cl.add(scale);
      this.toJson();
    },
    addLegend() {
      let legend = {
        type: "legend",
        display: true,
        alias:"图例控件",
        position: [116.37405, 39.93185],
        bgColor: "#fff",
        bgImg: "images/icon/icon_Red.png",
      };
      this.cl.add(legend);
      this.toJson();
    },
    remove(type) {
      this.cl.remove(type);
      this.toJson();
    },
    update(type, options) {
      this.cl.update(type, options);
      this.toJson();
    },
  },
};
</script>
<style lang="less" scope>
.control {
  position: absolute;
  z-index: 999;
  left: 10px;
  top: 190px;
}
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
