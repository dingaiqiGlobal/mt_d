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
      groupLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 15,
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
    //point
    const marker0 = new maptalks.Marker([116.38657, 39.91317], {
      symbol: {
        markerType: "ellipse",
        markerFill: {
          type: "linear", //线性-黄色
          places: [0, 0, 1, 1],
          colorStops: [
            [0.0, "#fff"],
            [0.5, "#fff27e"],
            [1, "#f87e4b"],
          ],
        },
        markerLineWidth: 0,
        markerWidth: 30,
        markerHeight: 30,
      },
    });
    const marker1 = new maptalks.Marker([116.39657, 39.91317], {
      symbol: {
        markerType: "ellipse",
        markerFill: {
          type: "radial", //放射-粉色
          colorStops: [
            [0.0, "rgba(216,115,149,0)"],
            [0.5, "rgba(216,115,149,1)"],
            [1.0, "rgba(216,115,149,1)"],
          ],
        },
        markerLineWidth: 0,
        markerWidth: 30,
        markerHeight: 30,
      },
    });
    //line
    const line0 = new maptalks.LineString(
      [
        [116.37609, 39.90875],
        [116.39678, 39.90875],
      ],
      {
        symbol: {
          linePatternFile: "data/json/bj/path_yellow.png",
          linePatternDx: 0,
          lineWidth: 10,
        },
      }
    );
    line0.animate(
      //动画看文档API(要与linePatternAnimSpeed区分开)
      {
        symbol: {
          linePatternDx: 20,
        },
      },
      {
        repeat: true,
      }
    );
    const line1 = new maptalks.LineString(
      [
        [116.37609, 39.89875],
        [116.39678, 39.89875],
      ],
      {
        symbol: {
          lineColor: {
            type: "linear",
            colorStops: [
              [0.0, "red"],
              [1 / 4, "orange"],
              [2 / 4, "green"],
              [3 / 4, "aqua"],
              [1.0, "white"],
            ],
          },
          lineWidth: 10,
        },
      }
    );

    const collection = new maptalks.GeometryCollection([marker0, marker1, line0, line1]);
    new maptalks.VectorLayer("vector", collection).addTo(this.map);
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
