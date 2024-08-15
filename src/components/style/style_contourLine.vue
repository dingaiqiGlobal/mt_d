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
      groupLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [102.604073198907784, 23.123174402406956],
      zoom: 14,
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
    /**
     * groupLayer
     */
    const sceneConfig = {
      postProcess: {
        enable: true,
      },
    };
    this.groupLayer = new GroupGLLayer("group", [], { sceneConfig });
    this.groupLayer.addTo(this.map);
    this.addContourLineLayer();
  },

  methods: {
    /**
     * 1.矢量图层提高海拔高度
     * 2.数据中包含地形高度
     * 3.色阶转换函数
     */
    addContourLineLayer() {
      let lineslayer = new maptalks.VectorLayer("vector", { enableAltitude: true }).addTo(
        this.map
      );

      fetch("data/json/data_ContourLine.json")
        .then((res) => res.json())
        .then((geojson) => {
          let lines = geojson.features;
          for (let val of lines.values()) {
            let rgb = this.hslToRgb((val.properties.ELEV - 1000) / 1000, 1, 0.5);
            let lineGeometry = new maptalks.LineString(val.geometry.coordinates, {
              symbol: {
                lineColor: this.rgbtohex(rgb),
                lineWidth: 1,
                textName: "{altitude}",
                textFill: "#ffffff",
              },
              properties: {
                altitude: val.properties.ELEV - 1000,
              },
            })
              .on("mouseenter", (e) => {
                e.target.updateSymbol({
                  lineColor: "#f00",
                });
              })
              .on("mouseout", (e) => {
                e.target.updateSymbol({
                  lineColor: this.rgbtohex(rgb),
                });
              })
              .addTo(lineslayer);
          }
        });
    },
    rgbtohex(rgb) {
      return (
        "#" +
        (rgb[0].toString(16).length == 2
          ? rgb[0].toString(16)
          : "0" + rgb[0].toString(16)) +
        (rgb[1].toString(16).length == 2
          ? rgb[1].toString(16)
          : "0" + rgb[1].toString(16)) +
        (rgb[2].toString(16).length == 2
          ? rgb[2].toString(16)
          : "0" + rgb[2].toString(16))
      );
    },
    hslToRgb(h, s, l) {
      var r, g, b;
      if (s == 0) {
        r = g = b = l;
      } else {
        var hue2rgb = function hue2rgb(p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
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
