<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button type="" @click="addGLPolygon('polygon','data/json/xs.json')">添加面</button>
      <button type="" @click="removeLayer('polygon')">移除面</button>
      <br />
      <button type="" @click="addGLLineString('m20', 'data/json/m20.json')">
        添加m20
      </button>
      <button type="" @click="removeLayer('m20')">移除m20</button>
      <br />
      <button type="" @click="addGLLineString('m100', 'data/json/m100.json')">
        添加m100
      </button>
      <button type="" @click="removeLayer('m100')">移除m100</button>
      <br />
      <button type="" @click="addGLLineString('m200', 'data/json/m200.json')">
        添加m200
      </button>
      <button type="" @click="removeLayer('m200')">移除m200</button>
      <br />
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
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.1842, 40.00474],
      zoom: 15,
      pitch: 80,
      bearing: -25,
    });
    const layers = [
      new maptalks.TileLayer("base", {
        maxAvailableZoom: 20,
        spatialReference: {
          projection: "EPSG:3857",
        },
        urlTemplate:
          "http://webst{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
        subdomains: ["01", "02", "03", "04"],
        // offset: function (z) {
        //   const center = this.map.getCenter();
        //   const c = maptalks.CRSTransform.transform(center.toArray(), "GCJ02", "WGS84");
        //   targetCoord.set(c[0], c[1]);
        //   const offset = map
        //     .coordToPoint(center, z, POINT0)
        //     ._sub(this.map.coordToPoint(targetCoord, z, POINT1));
        //   return offset._round().toArray();
        // },
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
    ];
    //map中必须有地形
    const terrain = {
      type: "mapbox",
      tileSize: 256,
      urlTemplate: `https://{s}.tiles.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=pk.eyJ1Ijoic2tiZXlvbmQiLCJhIjoiY2s5MmU1Y2RiMDR4aTNtcDh0MmgwaHQzcyJ9._tMktptrxVL-QNN5s2plzg`,
      subdomains: ["a", "b", "c", "d"],
    };

    this.groupLayer = new GroupGLLayer("group", layers, { terrain });
    this.groupLayer.addTo(this.map);
    /**
     * 图层必须添加到groupLayer中才能贴地形
     */
  },

  methods: {
    addGLPolygon(id,url) {
      let GeoJSONLayer = new GeoJSONVectorTileLayer(id, {
        data: url,
        minZoom: 1,
        maxZoom: 22,
        style: {
          style: [
            {
              name: `${id}_polygon_geo`,
              renderPlugin: {
                type: "fill",
                dataConfig: {
                  type: "fill",
                  only2D: true,
                  awareOfTerrain: true, //贴地形
                },
                sceneConfig: {
                  depthFunc: "always",
                  blendSrc: "one",
                },
              },
              filter: true,
              symbol: {
                polygonFill: "#000000",
                polygonOpacity: 0,
              },
            },
            {
              name: `${id}_polygon_line_geo`,
              renderPlugin: {
                type: "line",
                dataConfig: {
                  type: "line",
                  only2D: true,
                  awareOfTerrain: true, //贴地形
                },
                sceneConfig: {
                  depthFunc: "always",
                  blendSrc: "one",
                },
              },
              filter: true,
              symbol: {
                lineColor: "#04F75A",
                lineWidth: 2,
                lineOpacity: 1,
                lineStrokeWidth: 0.5,
                lineStrokeColor: "#37f611",
              },
            },
          ],
        },
      });
      this.groupLayer.addLayer(GeoJSONLayer);
    },
    addGLLineString(id, url) {
      let GeoJSONLayer = new GeoJSONVectorTileLayer(id, {
        data: url,
        minZoom: 1,
        maxZoom: 22,
        style: {
          style: [
            {
              name: `${id}_line_geo`,
              renderPlugin: {
                type: "line",
                dataConfig: {
                  type: "line",
                  only2D: true,
                  awareOfTerrain: true, //贴地形
                },
                sceneConfig: {
                  depthFunc: "always",
                  blendSrc: "one",
                },
              },
              filter: true,
              symbol: {
                lineColor: "#fc2929",
                lineWidth: 2,
                lineOpacity: 1,
                lineStrokeWidth: 0,
                lineStrokeColor: "#fc2929",
              },
            },
          ],
        },
      });
      this.groupLayer.addLayer(GeoJSONLayer);
    },
    removeLayer(id) {
      let layer = this.groupLayer.getLayer(id);
      console.log(this.groupLayer);
      if (layer) {
        this.groupLayer.removeLayer(layer);
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
