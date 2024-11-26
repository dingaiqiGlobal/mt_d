<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-button type="primary" @click="this.hideFeature">隐藏某一区</el-button>
      <el-button type="warning" @click="this.cancel">取消隐藏</el-button>
      <el-button type="primary" @click="this.updateFeatureStyle">更新新洲区样式</el-button>
      <el-button type="warning" @click="this.updateNotFeatureStyle">更新非新洲区样式</el-button>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, GeoJSONVectorTileLayer } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      vtLayer: null,
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
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [], { sceneConfig });
    this.groupLayer.addTo(this.map);

    /**
     * GeojsonVTLayer
     */
    this.vtLayer = new GeoJSONVectorTileLayer("geo", {
      data: "data/json/wh//area.geojson",
      style: {
        style: [
          {
            filter: true,
            renderPlugin: {
              dataConfig: {
                type: "fill",
              },
              sceneConfig: {},
              type: "fill",
            },
            symbol: {
              polygonFill: "#996247",
              polygonOpacity: 1,
            },
          },
          {
            filter: true,
            renderPlugin: {
              dataConfig: {
                type: "line",
              },
              sceneConfig: {},
              type: "line",
            },
            symbol: {
              lineColor: "#E2E2E2",
              lineOpacity: 1,
              lineWidth: 2,
            },
          },
        ],
      },
    });

    this.vtLayer.on("dataload", (e) => {
      this.map.fitExtent(e.extent);
    });
    this.groupLayer.addLayer(this.vtLayer);
  },

  methods: {
    hideFeature() {
      this.vtLayer.highlight([{ id: 10, name: "test", visible: false }]);
    },
    cancel() {
      this.vtLayer.cancelHighlight(["test"]);
    },
    updateFeatureStyle() {
      this.vtLayer.highlight([
        {
          id: 12,
          color: "#efc69e",
        },
      ]);
    },
    updateNotFeatureStyle() {
      this.vtLayer.highlight([
        {
          name: "非新洲区",
          filter: (feature) => feature.properties.name !== "新洲区",
          color: "#ef9e9f",
        },
      ]);
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
