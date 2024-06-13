<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
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
      overviewControl: true, // add overview control
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
     * 图层控制
     */
    let layerSwitcher = new control.LayerSwitcher({
      position: "top-right",
      baseTitle: "底图图层集合",
      overlayTitle: "其他图层集合",
      excludeLayers: [], //排除图层
      containerClass: "maptalks-layer-switcher", //css样式
    });
    this.map.addControl(layerSwitcher);

    /**
     * 添加图层
     */
    this.groupLayer = new GroupGLLayer("GL组", [], {
      sceneConfig: {
        environment: {
          enable: true,
          mode: 1,
          level: 0,
          brightness: 0,
        },
      },
    }).addTo(this.map);
    this.add_GroupGL_PointLayer();

    /**
     * 动态添加组件
     */
    this.add_Scale();

    /**
     * toJSON
     */
    setTimeout(() => {
      this.toJson();
    }, 3000);
  },

  methods: {
    add_GroupGL_PointLayer() {
      const pointLayer = new PointLayer("点");
      const marker = new Marker([116.39225, 39.90605], {
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
    toJson() {
      const mapJSON = this.map.toJSON();
      document.getElementById("json").innerHTML = JSON.stringify(mapJSON);
    },

    add_Scale() {
      // const x = options.position.top || 230;
      // const y = options.position.left || 10;
      let scale = new control.Scale({
        position: { top: "500", left: "50" },
        containerClass: "scaleCss",
      });
      this.map.addControl(scale);
    },
  },
};
</script>
<style>
.scaleCss {
  border: 2px solid #000000;
  border-top: none;
  line-height: 1.1;
  padding: 0px;
  color: #000000;
  font-size: 11px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
  background-image: url('../../../public/images/icon/icon_Red.png'); /* 设置图片路径 */
  background-size: cover; /* 背景图片覆盖整个元素 */
  background-repeat: no-repeat; /* 背景图片不重复 */
  background-position: center; /* 背景图片居中 */
}
.control {
  position: absolute;
  z-index: 999;
  left: 10px;
  top: 10px;
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
