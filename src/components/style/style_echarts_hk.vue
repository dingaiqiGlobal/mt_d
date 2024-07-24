<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      vectorLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [114.18365, 22.30434],
      zoom: 11,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        subdomains: ["a", "b", "c", "d"],
      }),
      layers: [],
    });
    this.vectorLayer = new maptalks.VectorLayer("vectorLayer", {
      collision: true, //碰撞检测
      collisionDelay: 250,
      collisionBufferSize: 6,
    }).addTo(this.map);
    this.addPolygons();
  },

  methods: {
    addPolygons() {
      fetch("data/json/hk/hk.json")
        .then((res) => res.json())
        .then((geojson) => {
          const polygons = maptalks.GeoJSON.toGeometry(geojson);
          polygons.forEach((polygon) => {
            polygon.options.enableSimplify = false; //启用简化
            polygon.setSymbol([
              {
                polygonFill: {
                  type: "color-interpolate",
                  property: "value", //value代表人口
                  stops: [
                    [2000, "lightskyblue"],
                    [12000, "yellow"],
                    [30000, "orangered"],
                  ],
                },
                polygonOpacity: 1,
                lineWidth: 1,
                lineColor: "#444",
              },
              // {
              //   textName: "{name}",
              //   textHaloRadius: 0.2,
              //   textHaloFill: "#fff",
              // },
            ]);
            polygon.on("mouseover mouseout", this.mouseEventFunc); //事件绑定
          });
          this.vectorLayer.addGeometry(polygons);
          this.addLabels(); //单独添加
        });
    },
    addLabels() {
      fetch("data/json/hk/hklabel.geojson")
        .then((res) => res.json())
        .then((geojson) => {
          const points = maptalks.GeoJSON.toGeometry(geojson);
          points.forEach((point) => {
            const { name } = point.getProperties();
            point.setSymbol({
              textName: name,
              textHaloRadius: 0.2,
              textHaloFill: "#fff",
            });
          });
          this.vectorLayer.addGeometry(points);
        });
    },
    mouseEventFunc(e) {
      const polygon = e.target;
      console.log(polygon);
      if (e.type === "mouseover") {
        if (!polygon._oldSymbol) {//可以给polygon添加一个._oldSymbol
          polygon._oldSymbol = polygon.getSymbol();
        }
        polygon.setSymbol({
          polygonFill: "#FFCF00",
          lineWidth: 1,
          lineColor: "#444",
          shadowBlur: 5,
          shodowColor: "black",
        });
      } else if (e.type === "mouseout") {
        if (polygon._oldSymbol) {
          polygon.setSymbol(polygon._oldSymbol);
        }
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
