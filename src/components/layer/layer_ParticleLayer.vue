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
     * ParticleLayer-只有点的方法
     */
    const particles = new maptalks.ParticleLayer("c", {
      forceRenderOnMoving: true, //地图移动时强制渲染图层
    });
    const center = this.map.getCenter();
    const radius = 1000; //半径
    //接口方法获取粒子在时间 t 的位置
    particles.getParticles = function (t) {
      const point = this.map.coordinateToContainerPoint(center);
      const angle = (((t / 16) % 360) * Math.PI) / 180;
      const pxLen = this.map.distanceToPixel(radius, radius); //将米距离转换为像素长度
      const r = pxLen.width;
      // caculate pixel offset from circle's center
      const x = r * Math.cos(angle); //计算像素与圆心的偏移量
      const y = r * Math.sin(angle);
      //重点---
      return [
        {
          point: point.add(x, y),
          r: 10,
          color: "#fd2f06",
        },
      ];
    };

    this.map.addLayer(particles);
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
