<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
export default {
  components: {},

  data() {
    return {
      map: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [105.08052356963802, 36.04231948670001],
      zoom: 5,
      minZoom: 1,
      maxZoom: 19,
      spatialReference: {
        projection: "baidu",
      },
      baseLayer: new maptalks.TileLayer("base", {
        opacity: 0.6, //一、瓦片透明度
        cssFilter: "sepia(100%) invert(90%)", //二、滤镜
        urlTemplate:
          "https://gss{s}.bdstatic.com/8bo_dTSlRsgBo1vgoIiO_jowehsv/tile/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20170927",
        subdomains: [0, 1, 2, 3],
        attribution: '&copy; <a target="_blank" href="http://map.baidu.com">Baidu</a>',
      }),
    });

    //三、Mask-指定范围内的瓦片
    const boundary = [
      [
        [70.3094807167617, 54.5777701473745],
        [142.264381533681, 54.5777701473745],
        [142.264381533681, 17.3154107957716],
        [70.3094807167617, 17.3154107957716],
        [70.3094807167617, 54.5777701473745],
      ],
    ];
    const mask = new maptalks.Polygon(boundary, {
      symbol: [
        {
          lineColor: "#ccc",
          lineWidth: 8,
          polygonFillOpacity: 0,
        },
        {
          lineColor: "#404040",
          lineWidth: 6,
          polygonFillOpacity: 0,
        },
      ],
    });
    const baseLayer = this.map.getBaseLayer();
    baseLayer.setMask(mask);
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
