<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button @click="changeSR">4326/3857</button>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GeoJSONVectorTileLayer } from "@maptalks/gl-layers";

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
      center: [116.95015, 40.55659],
      zoom: 12,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
          //TileLayer可以有自己独立的投影
          /**
           * 注意maptalks体系内图层是有自己的坐标投影配置信息的
           * 图层的坐标系可以和地图不同
           * 当图层不设置投影坐标信息的时候会自动的去拿地图的投影信息作为自己的坐标投影配置
           * 所以代码层面最好为图层设置自己的坐标信息，尤其时当图层的投影信息和地图不同时，否则会导致一些未知错误，尤其是瓦片图层会导致瓦片加载错乱
           */
        spatialReference: {
          //切换空间参考，这个参考必须写在底图图层中
          projection: "EPSG:3857",
        },
      }),
    });
    this.add_GeoJSONVTLayer_LineString(); //图层不跟着变
  },

  methods: {
    add_GeoJSONVTLayer_LineString() {
      let GeoJSONLayer = new GeoJSONVectorTileLayer("VT_LineString_WebGL", {
        data: "data/json/data_MY_LineString.json",
        style: {
          style: [
            {
              name: `lineString_geo`,
              renderPlugin: {
                type: "line",
                dataConfig: {
                  type: "line",
                  only2D: true,
                },
                sceneConfig: {
                  depthFunc: "always",
                  blendSrc: "one",
                },
              },
              filter: true,
              symbol: {
                lineColor: "#5F9F9F",
                lineWidth: 2,
                lineOpacity: 1,
              },
            },
          ],
        },
      });
      this.map.addLayer(GeoJSONLayer);
    },
    changeSR() {
      const sp = this.map.getSpatialReference();
      const is4326 = sp._projection.code.includes("4326");
      let projection = "EPSG:4326";
      if (is4326) {
        projection = "EPSG:3857";
      }
      this.map.setSpatialReference({ projection });
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
