<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
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
      pitch: 0,
      bearing: 0,
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
     * GeojsonVTLayer
     * featureStyle--未API
     */
    this.vtLayer = new GeoJSONVectorTileLayer("geo", {
      data: "data/json/data_Polygon_BJ.json",
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
              polygonFill: "#000000",
              polygonOpacity: 0.8,
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
        featureStyle: [
          {
            id: 12,
            style: [
              {
                renderPlugin: {
                  dataConfig: {
                    type: "fill",
                  },
                  sceneConfig: {},
                  type: "fill",
                },
                symbol: {
                  polygonFill: "#ffffff",
                  polygonOpacity: 0.8,
                },
              },
              {
                renderPlugin: {
                  dataConfig: {
                    type: "line",
                  },
                  sceneConfig: {},
                  type: "line",
                },
                symbol: {
                  lineColor: "#CB7575",
                  lineWidth: 2,
                },
              },
            ],
          },
        ],
      },
    });

    this.vtLayer.on("dataload", (e) => {
      this.map.fitExtent(e.extent);
    });
    this.groupLayer.addLayer(this.vtLayer);
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
