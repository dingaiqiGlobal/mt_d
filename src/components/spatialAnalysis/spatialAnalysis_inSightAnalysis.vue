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
      GeoJSONLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39109, 39.9164],
      zoom: 16,
      pitch: 90,
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

    const style = {
      style: [
        {
          name: "id_3d-extrusion",
          renderPlugin: {
            type: "lit",
            dataConfig: {
              type: "3d-extrusion",
              altitudeProperty: "height",
              altitudeScale: 5,
              defaultAltitude: 10,
            },
            sceneConfig: {},
          },
          filter: true,
          symbol: {
            visible: true,
            polygonFill: "rgba(0, 88, 216, 1)",
            polygonOpacity: 0.8,
          },
        },
      ],
    };
    this.GeoJSONLayer = new GeoJSONVectorTileLayer("geojson1", {
      data: "data/json/data_GuGong.json",
      style,
    });

    this.groupLayer = new GroupGLLayer("group", [this.GeoJSONLayer], {
      sceneConfig: {},
    });
    this.groupLayer.addTo(this.map);
    this.GeoJSONLayer.on("dataload", (e) => {
      this.map.fitExtent(e.extent);
    });
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
