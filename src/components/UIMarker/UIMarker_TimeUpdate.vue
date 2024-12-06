<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import Vue from "vue/dist/vue.esm.js"; //特殊引用
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      Profile: null, //UI
      markers: [],
      components: [],
      time: Date.now(),
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

    /**
     * 初始化UIMarker
     */
    this.Profile = Vue.extend({
      template: `  <div class="markerDiv">
            <div class="markerName">{{name}}</div>
            <div class="markerBody">
                <div class="markerRow">{{wendu}}</div>
                <div class="markerRow">{{yali}}</div>
                <div class="markerRow">{{liu}}</div>
            </div>
        </div>`,
      props: ["name", "wendu", "yali", "liu"],
      data: function () {
        return {
          lastName: "White",
          alias: "Heisenberg",
        };
      },
    });
    //绑定
    this.randomCoordinates().forEach((c, index) => {
      const props = this.getMarkerData();
      const profile = new this.Profile({ propsData: props }).$mount();
      var marker = new maptalks.ui.UIMarker(c, {
        content: profile.$el,
        collision: true, //碰撞检查
        collisionBufferSize: 2,
        collisionWeight: 1,
        collisionFadeIn: true,
        verticalAlignment: "top",
        horizontalAlignment: "middle",
        altitude: 0,
        animation: "fade",
      });
      marker.addTo(this.map);
      //全局赋值
      this.markers.push(marker);
      this.components.push(profile);
      console.log(this.time);
    });
    //动画
    this.animation()
  },

  methods: {
    randomCoordinates() {
      const coordinates = [];
      const { x, y } = this.map.getCenter();
      while (coordinates.length < 100) {
        const cx = Math.random() - 0.5 + x;
        const cy = Math.random() - 0.5 + y;
        coordinates.push([cx, cy]);
      }
      return coordinates;
    },
    getMarkerData() {
      const name = `hello${Math.ceil(Math.random() * 10000)}`;
      const wendu = ` 供回温:${(Math.random() * 200).toFixed(2)}/${(
        Math.random() * 200
      ).toFixed(2)}℃`;
      const yali = ` 供回压:${(Math.random() * 100).toFixed(2)}/${(
        Math.random() * 100
      ).toFixed(2)} MPa`;
      const liu = `流量:${(Math.random() * 100).toFixed(2)} t/h`;
      return {
        name,
        wendu,
        yali,
        liu,
      };
    },
    animation() {
      const currentTime = Date.now();
      if (currentTime - this.time > 500) {//速度
        this.markers.forEach((marker, index) => {
          const uiDom = marker.getDOM();//特别注意-未API****
          if (uiDom.style.visibility !== "visible") {
            return;
          }
          const { name, wendu, yali, liu } = this.getMarkerData();
          const component = this.components[index];
          component.$props.name = name;
          component.$props.wendu = wendu;
          component.$props.yali = yali;
          component.$props.liu = liu;
        });
        this.time = currentTime;
      }
      requestAnimationFrame(this.animation);
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
.markerDiv {
  /* // width:10vw; */
  min-width: 180px;
  min-height: 100px;
  background: beige;
  padding-bottom: 1vh;
  margin-bottom: 4vh;
  width: 200px;
  height: 100px;
}

.markerBody {
  margin: 1vh 0;
}

.markerName {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  background: darkblue;
  color: white;
}
</style>
