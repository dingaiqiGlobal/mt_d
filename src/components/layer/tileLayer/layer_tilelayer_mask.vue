<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
    };
  },

  computed: {},

  mounted() {
    /**
     * 1.altitude: -1000,//设置TileLayer的整体海拔-一般设置为负的值。
     * 注意把TileLayer的海拔高度设置为负的目的是不要抬高海平面，方便其他的业务图层数据加到地图，
     * 否则会要求其他图层也要设置海拔数据，导致业务逻辑变复杂了，这个样子最简单和不容易出错
     * 2.maxAvailableZoom: 18,//最大可用缩放
     * 3.setMask()设置蒙皮;
     * 4.seamlessZoom: false,//关闭地图的无极缩放// //地图默认是开启无极缩放的(seamlessZoom),即地图的缩放层级可以到小数,比如10.4这样,这时加载的瓦片还是 10层级的瓦片，所以就会导致瓦片被缩放一定的倍数导致模糊
     */
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 9,
      spatialReference: {
        projection: "EPSG:3857",
      },
     
      seamlessZoom: false,//关闭地图的无极缩放
      baseLayer: new maptalks.TileLayer("tile", {
        bufferPixel: 0,//瓦片之间有缝隙
        altitude: -1000,//设置TileLayer的整体海拔
        urlTemplate:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        maxAvailableZoom: 18,//最大可用缩放
      }),
      layers: [],
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
    this.groupLayer = new GroupGLLayer("group", [], { sceneConfig });
    this.groupLayer.addTo(this.map);

    /**
     * 设置蒙皮
     */
    fetch("data/json/bj/beijing.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        const polygons = maptalks.GeoJSON.toGeometry(geojson);
        this.map.getBaseLayer().setMask(polygons[0]);
      });
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
