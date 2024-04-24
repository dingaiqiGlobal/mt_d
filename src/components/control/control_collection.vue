<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
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
      zoomControl: true, // add zoom control
      scaleControl: true, // add scale control
      overviewControl: true, // add overview control
    });
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
     * 工具箱
     */
    let toolbar = new control.Toolbar({
      position: { bottom: "320", right: "0" },
      items: [
        {
          item: "按钮1",
          click: function () {
            alert("item1 clicked");
          },
        },
        {
          item: "按钮2",
          click: function () {
            alert("item2 clicked");
          },
        },
      ],
    });
    this.map.addControl(toolbar);

    /**
     * 自定义控制面板
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
     * 指南针(已经内置了)
     */
    // new Control: CompassControl, and add to map.
    let compass = new control.Compass({
      position: { bottom: "370", right: "0" }
    });
    this.map.addControl(compass);
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
