<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-button @click="play">播放</el-button>
      <el-button @click="pause">暂停</el-button>
      <hr />
      <el-checkbox v-model="audioFlag" @change="audio">声音</el-checkbox>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, VideoLayer, VideoSurface } from "@maptalks/gl-layers";
export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      videoSurface: null, //相当于geometry
      audioFlag: false, //声音标识
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39143, 39.9031],
      zoom: 19,
      pitch: 90,
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

    this.addVideoLayerLayer();
  },

  methods: {
    addVideoLayerLayer() {
      const ratio = (48 / 27) * 0.01; //比例比率
      const videoLayer = new VideoLayer("video", {
        doubleSide: false, //双面
      });
      this.groupLayer.addLayer(videoLayer);
      this.videoSurface = new VideoSurface(
        [
          [116.39158, 39.90479, 35], //右上坐标-逆时针
          [116.39105, 39.90474, 35], //左上坐标
          [116.39105, 39.90474, 0], //左下坐标
          [116.39158, 39.90479, 0], //右下坐标
        ],
        {
          url: require("@/assets/texture/flag.mp4"),
          opacity: 1,
        }
      );
      this.videoSurface.addTo(videoLayer);
    },
    play() {
      this.videoSurface.play();
    },
    pause() {
      this.videoSurface.pause();
    },
    audio() {
      if (this.audioFlag) {
        this.videoSurface.setAudio(true);
      } else {
        this.videoSurface.setAudio(false);
      }
      this.audioFlag = !this.audioFlag;
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
