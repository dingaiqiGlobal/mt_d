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
    //marker
    const marker = new maptalks.Marker([116.38657, 39.91317], {
      symbol: {
        textFaceName: "sans-serif",
        textName: "MapTalks",
        textFill: "#34495e",
        textSize: 20,
        textHaloColor: "white",
        textHaloRadius: 8,
      },
    });
    //line
    const line = new maptalks.LineString(
      [
        [116.37609, 39.90875],
        [116.39678, 39.90875],
      ],
      {
        symbol: {
          lineColor: "#1bbc9b",
          lineWidth: 3,
        },
      }
    );
    //polygon
    const polygon = new maptalks.Polygon(
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
    const collection = new maptalks.GeometryCollection([marker, line, polygon]);
    new maptalks.VectorLayer("vector", collection).addTo(this.map);

    //copy
    const copyLayer = new maptalks.VectorLayer("copy").addTo(this.map);
    polygon
      .copy()
      .translate(0.003 * 3, -0.003 * 3)
      .addTo(copyLayer);
    //filter
    let filterFeature = collection.filter(["==", "field", "filterTest"]);
    filterFeature.forEach(function (item) {
      if (item instanceof maptalks.Polygon) {
        item.updateSymbol({
          polygonFill: "#000000",
        });
      }
    });
    //flash
    marker.flash(
      500, // flash interval in ms
      3, // count
      function () {
        // callback when flash end
        alert("flash ended");
      }
    );
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
