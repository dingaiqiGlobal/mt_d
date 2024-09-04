<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-button type="text" @click="changePlay">
        <img
          :src="imageSrc"
          alt="Switch"
          style="width: 30px; height: 30px; display: block"
        />
      </el-button>
      <div class="sliderLoopTime">
        <span>loopTime</span>
        <el-slider v-model="loopTime" :max="150" @change="changeLoopTime"></el-slider>
      </div>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GIF } from "gifloop";

export default {
  components: {},

  data() {
    return {
      map: null,
      vectorLayer: null,
      gifs: null,

      //UI
      playFlage: false,
      playUrl: require("@/assets/gif/play.png"),
      pauseUrl: require("@/assets/gif/pause.png"),
      imageSrc: "",
      loopTime: 70,
    };
  },

  computed: {},
  created() {
    this.imageSrc = this.playFlage ? this.playUrl : this.pauseUrl;
  },
  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.9577, 40.50753],
      zoom: 12,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      }),
      layers: [],
    });
    this.addGIFLayer();
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

    addGIFLayer() {
      let _this = this;
      this.vectorLayer = new maptalks.VectorLayer("vectorLayer", { debug: false }).addTo(
        this.map
      );
      fetch("data/json/data_MiYun_Point_lit.json")
        .then((res) => res.json())
        .then((geojson) => {
          const points = maptalks.GeoJSON.toGeometry(geojson);
          this.vectorLayer.addGeometry(points);
          points.forEach((point) => {
            point.hide();//先隐藏，用frame实施更新gif
            // point.setSymbol({
            //   markerFile: "images/icon/icon_Red.png",
            //   markerOpacity: 1,
            //   markerWidth: 28,
            //   markerHeight: 40,
            // });
          });
        });
      const people = require("@/assets/gif/people.gif");
      const monkey = require("@/assets/gif/monkey.gif");
      const mouse = require("@/assets/gif/mouse.gif");
      const lovely = require("@/assets/gif/lovely.gif");
      const files = [people, monkey, mouse, lovely];
      this.gifs = files.map((file, index) => {
        const gif = new GIF({
          loopTime: this.loopTime,
          url: file,
        });
        gif.on("frame", function (frame) {
          _this.update(frame, index);
        });
        return gif;
      });
    },
    update(frame, offset = 0) {
      let geometries = this.vectorLayer.getGeometries();
      geometries.forEach((point, index) => {
        if (index % this.gifs.length !== offset) {
          return;
        }
        if (!point.isVisible()) {
          point.show();
        }
        point.setSymbol({
          markerFile: frame.dataURL,
          markerWidth: frame.maxWidth / 3,
          markerHeight: frame.maxHeight / 3,
        });
      });
    },
    changePlay() {
      this.playFlage = !this.playFlage;
      this.imageSrc = this.playFlage ? this.playUrl : this.pauseUrl;
      this.gifs.forEach(function (gif) {
        if (gif.isPlay()) {
          gif.pause();
        } else {
          gif.play();
        }
      });
    },
    changeLoopTime(value) {
      this.gifs.forEach(function (gif) {
        gif.config({ loopTime:value });
      });
    },
  },
};
</script>
<style lang="less">
.control {
  position: absolute;
  z-index: 999;
  left: 10px;
  top: 10px;
}
.sliderLoopTime {
  color: #ffffff;
  width: 200px;
}
</style>
