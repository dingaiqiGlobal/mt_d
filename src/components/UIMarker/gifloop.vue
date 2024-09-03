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
      groupLayer:null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
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
  },

  methods: {
    /**
     * cnpm i gifloop --save    "gifloop": "^0.5.0",
     * 
     * API
     * 1.构造
     * import {GIF} from 'gifloop';
     * const gif = new GIF({
     *  loopTime: 70,  //循环时间，默认70 {Number}
     *  url: './people.gif'
     * });
     * gif.on('frame', function(frame) {
     * 
     * });
     * 
     * 2.方法
     * ①config(options)          修改设置，例子gif.config({loopTime: 100});
     * ②on(event, handler)       添加事件监听gif.on('frame', function(frame) {});
     * ③off(event, handler)      移除事件监听
     * ④play()
     * ⑤pause()
     * ⑥isplay()                 if (gif.isPlay()) {gif.pause();} else {gif.play();}
     * ⑦dispose()                处置
     */
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
