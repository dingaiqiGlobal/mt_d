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
    /**
     * 同layer_WMS
     */
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 6,
      spatialReference: {
        projection: "EPSG:4326",
      },
      baseLayer: new maptalks.WMSTileLayer("wms", {
        tileSystem: [1, -1, -180, 90],
        urlTemplate: "https://ows.terrestris.de/osm/service",
        crs: "EPSG:4326",
        layers: "OSM-WMS",
        styles: "",
        version: "1.3.0",
        format: "image/png",
        transparent: true,
        uppercase: true,
      }),
      attribution: {
        content: "&copy ows.terrestris.de",
      },
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
