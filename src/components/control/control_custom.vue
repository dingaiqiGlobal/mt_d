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

export default {
  components: {},

  data() {
    return {
      map: null,
      //搜索
      inputValue: "",
      contentshow: false,
      contentList: [],
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
      attribution: true,
      zoomControl: {
        position: { bottom: "230", right: "10" },
        slider: true,
        zoomLevel: false,
      }, // add zoom control
      //scaleControl: true, // add scale control
      //overviewControl: true, // add overview control
    });

    /**
     * 可以这么存储样式信息
     */
    // let options2 = {
    //   panel: {
    //     position: { bottom: "230", right: "10" },
    //     draggable: true, //拖拽
    //     custom: false, //定制
    //     closeButton: true,
    //   },
    // };
    // this.map.setOptions(options2);




    /**
     * 动态添加组件
     */
    let panel = new control.Panel({
      position: { bottom: "220", right: "0" },
      draggable: true, //拖拽
      custom: false, //定制
      closeButton: true,
      content: "<div>自定义面板</div>", // 面板的内容，可以是 HTML 代码
    });
    this.map.addControl(panel);

    /**
     * toJSON
     */
    setTimeout(() => {
      this.toJson();
    }, 3000);
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
