<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, Geo3DTilesLayer, ColorMask } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      geo3DTilesLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [108.95941, 34.21978],
      zoom: 12,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      }),
      layers: [],
    });
    /**
     * 3dtiles
     */
    this.geo3DTilesLayer = new Geo3DTilesLayer("Geo3DTilesLayer", {
      geometryEvents: true, //考虑到性能问题Geo3DTilesLayer的事件交互(geometryEvents)默认是关闭的
      services: [
        {
          url: "data/3dtiles/dayanta/tileset.json",
          maximumScreenSpaceError: 1, //该值越小，渲染精度越高，项目允许的情况下，该值越大性能越好
          ambientLight: [0.2, 0.2, 0.2],
          heightOffset: -420,
          scale: [1, 1, 1], //3dtile整体的缩放参数
          rotation: [0, 0, 0], //3dtile整体的旋转参数
          coordOffset: [0, 0.00002], //3dtile整体偏移量参数
        },
      ],
    });
    this.geo3DTilesLayer.once("loadtileset", (e) => {
      const extent = this.geo3DTilesLayer.getExtent(e.index);
      this.map.fitExtent(extent, 0, {
        animation: false,
      });
      this.loadEntities();
    });
    /**
     * groupLayer
     */
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [this.geo3DTilesLayer], { sceneConfig });
    this.groupLayer.addTo(this.map);
  },

  methods: {
    /**
     * ColorMask-特殊api-颜色遮罩
     */
    loadEntities() {
      let _this = this;
      fetch("data/json/XiAn/monomer.json")
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          const masks = []; //遮罩
          for (let i = 0; i < data.length; i++) {
            const mask = new ColorMask(data[i].geometry.coordinates, {
              symbol: {
                polygonFill: "#ea6b48",
                polygonOpacity: 0.6,
              },
              properties: data[i].properties,
            });
            _this.setEventAndInfowindow(mask); //为每一个遮罩图层绑定事件
            masks.push(mask);
          }
          _this.geo3DTilesLayer.setMask(masks); //设置遮罩
        });
    },
    setEventAndInfowindow(mask) {
      //移入移除事件
      mask.on("mouseover mouseout", (e) => {
        let polygonFill = "#ea6b48";
        if (e.type === "mouseover") {
          polygonFill = "#2e2";
        }
        e.target.updateSymbol({
          polygonFill,
        });
      });
      //单击事件
      const name = mask.getProperties().name;
      mask.setInfoWindow({
        title: name,
        content: `名称:${name}`,
      });
      mask.on("click", (e) => {
        const coordinate = this.getInfoWindowCoordinate(e);
        if (coordinate) {
          //show-显示UI组件，如果它是全局单个组件，它将关闭上一个组件
          e.target.getInfoWindow().show(coordinate);
        }
      });
    },
    getInfoWindowCoordinate(event) {
      const { target, coordinate } = event;
      const layer = target.getLayer(); //当前遮罩
      if (!layer || !layer.identify) {
        return;
      }
      const result = layer.identify(coordinate) || [];
      const len = result.length;
      if (!len) {
        return;
      }
      const coord = result[len - 1].coordinate;
      return new maptalks.Coordinate(coord);
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
