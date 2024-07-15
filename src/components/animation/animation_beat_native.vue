<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button @click="play">play</button>
      <button @click="pause">pause</button>
      <button @click="cancel">cancel</button>
      <button @click="finish">finish</button>
    </div>
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
      player: null,
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
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", //dark_all
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });
    this.addLayer();
  },

  methods: {
    addLayer() {
      let layer = new maptalks.VectorLayer("vector").addTo(this.map);
      let marker = new maptalks.Marker([116.39079, 39.91033], {
        symbol: {
          markerType: "ellipse",
          markerWidth: 50,
          markerHeight: 50,
          markerFill: "rgb(216,115,149)",
          markerFillOpacity: 0.8,
          markerLineColor: "#fff",
          markerLineWidth: 3,
          markerDy: 0,
          markerDx: 0,
        },
      }).addTo(layer);
      //定义跳动样式
      let targetStyles = {
        symbol: {
          markerDy: -50,
          markerDx: 0,
        },
      };
      this.player = maptalks.animation.Animation.animate(
        targetStyles,
        {
          duration: 1000,
          easing: "upAndDown",//动画随时间变化的速率
          repeat: "true",
        },
        // callback of each frame
        function step(frame) {
          if (frame.state.playState === "running") {
            marker.updateSymbol(frame.styles.symbol);
          }
        }
      );
    },
    play() {
      this.player.play();
    },
    pause() {
      this.player.pause();
    },
    cancel() {
      this.player.cancel();
    },
    finish() {
      this.player.finish();
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
