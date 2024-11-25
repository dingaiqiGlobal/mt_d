<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-switch
        v-model="pointSwitch"
        active-color="#00ff12"
        inactive-color="#ff0000"
        active-text="点-开"
        inactive-text="点-关"
        @change="pointEdit"
      ></el-switch>
      <br />
      <el-switch
        v-model="lineSwitch"
        active-color="#00ff12"
        inactive-color="#ff0000"
        active-text="线-开"
        inactive-text="线-关"
        @change="lineEdit"
      ></el-switch>
      <br />
      <el-switch
        v-model="polygonSwitch"
        active-color="#00ff12"
        inactive-color="#ff0000"
        active-text="面-开"
        inactive-text="面-关"
        @change="polygonEdit"
      ></el-switch>
    </div>
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
      marker0: null,
      line0: null,
      polygon0: null,
      pointSwitch: false,
      lineSwitch: false,
      polygonSwitch: false,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      //map上禁用所有交互
      //   draggable: false,
      //   dragPan: false,
      //   dragRotate: false,
      //   dragPitch: false,
      //   scrollWheelZoom: false,
      //   touchZoom: false,
      //   doubleClickZoom: false,
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

    this.marker0 = new maptalks.Marker([116.38657, 39.91317], {
      draggable: true, //vectorLayer下Geometry才有拖拽
      editable: true,
      cursor: "pointer",
      symbol: {
        markerType: "ellipse",
        markerFill: {
          type: "linear",
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

    this.line0 = new maptalks.LineString(
      [
        [116.37609, 39.90875],
        [116.39678, 39.90875],
      ],
      {
        draggable: true, //vectorLayer下Geometry才有拖拽
        symbol: {
          linePatternFile: "data/json/bj/path_yellow.png",
          linePatternDx: 0,
          lineWidth: 10,
        },
      }
    );
    this.line0.animate(
      {
        symbol: {
          linePatternDx: 20,
        },
      },
      {
        repeat: true,
      }
    );
    this.polygon0 = new maptalks.Polygon(
      [
        [
          [116.39111, 39.89843],
          [116.3814, 39.89843],
          [116.3814, 39.90393],
          [116.39111, 39.90393],
          [116.39111, 39.89843],
        ],
      ],
      {
        symbol: {
          lineColor: "#34495e",
          lineWidth: 2,
          polygonFill: "rgb(135,196,240)",
          polygonOpacity: 0.6,
        },
        properties: {
          field: "filterTest",
        },
      }
    );

    // const collection = new maptalks.GeometryCollection([marker0, line0,polygon0]);//GeometryCollection没有拖拽
    new maptalks.VectorLayer("vector", [
      this.marker0,
      this.line0,
      this.polygon0,
    ]).addTo(this.map);
  },

  methods: {
    pointEdit(value) {
      if (value) {
        this.marker0.startEdit();
      } else {
        this.marker0.endEdit();
      }
    },
    lineEdit(value) {
      if (value) {
        this.line0.startEdit();
      } else {
        this.line0.endEdit();
      }
    },
    polygonEdit(value) {
      if (value) {
        this.polygon0.startEdit();
      } else {
        this.polygon0.endEdit();
      }
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
