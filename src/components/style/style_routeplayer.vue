<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button>Play</button>
      <button>Pause</button>
      <button>Cancel</button>
      <button>Finish</button>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl-layers";
import { RoutePlayer, formatRouteData } from "maptalks.routeplayer";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      vectorLayer: null,
      player: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.31929, 39.9908],
      zoom: 14,
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

    this.vectorLayer = new maptalks.VectorLayer("vectorLayer").addTo(this.map);
    this.loadData();
  },

  methods: {
    loadData() {
      fetch("data/json/data_routeplayer.json")
        .then((res) => res.json())
        .then((json) => {
          this.addLines(json);
          this.addRouterLine(json);
        });
    },
    //路况线
    //maptalks体系内不支持对一条线进行分段着色的,如果你需要做这种路况效果需要你自己拆分线路,将其拆成一段段的,且携带自己的 业务信息
    addLines(json) {
      let featuresArr = json.features;
      featuresArr.map((item) => {
        const line = new maptalks.LineString(item.geometry.coordinates, {
          symbol: {
            lineColor: item.properties.color,
            lineWidth: 4,
          },
        });
        this.vectorLayer.addGeometry(line);
      });
    },
    //轨迹回放
    addRouterLine(json) {
      const data = formatRouteData(this.buildData(json), {
        duration: 1000 * 60 * 10,//持续时间
      });
      this.player = new RoutePlayer(data, {
        unitTime: 1, //单位时间
        speed: 7, //速度
        debug: true, //调试
        autoPlay: true, //是否自动播放
        repeat: false, //是否重复播放
      });
      /**
       * 待完善
       */
    },
    buildData(json) {
      let route = [];
      let features = json.features;
      for (let i = 0; i < features.length; i++) {
        route.push(features[i].geometry.coordinates);
      }
      const seen = new Set();
      const route2 = [];
      route.forEach((subarray) => {
        subarray.forEach((coord) => {
          const key = `${coord[0]},${coord[1]}`;
          if (!seen.has(key)) {
            seen.add(key);
            route2.push(coord);
          }
        });
      });
      const route3 = route2.map((coord) => ({
        coordinate: coord,
      }));
      return route3;
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
