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
      center: [116.950150,40.556590],
      zoom: 12,
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
        spatialReference: {
          //切换空间参考，这个参考必须写在底图图层中
          projection: "EPSG:3857",
        },
      }),
    });
    this.add_GeoJSONVTLayer_LineString();//图层不跟着变
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
