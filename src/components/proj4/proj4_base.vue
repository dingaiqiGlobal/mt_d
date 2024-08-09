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

import proj4 from "proj4";
/**
 * cnpm i proj4 --save
 * 
 * geojson-vt的数据源只能是EPSG4326的数据源(除非你魔改), 
 * 但是有时我们项目里的数据投影可能其他投影的数据文件,
 * 比如我所在的江苏地区喜欢用EPSG4528,
 * 这时如果要是用GeoJSONVectorTileLayer加载需要我们对GeoJSON文件里坐标 
 * 数据进行投影转换下
 * 1.可以使用一些工具,比如Arcgis,QGIS等
 * 2.也可以利用 proj4js库在前端直接对geojson文件转换下, 相对于使用桌面工具更加灵活和动态
 * 3.其他的坐标转换方法等,比如你的数据在数据库里也可以使用数据库里的内置函数来解决投影转换等
 * 
 * 
 * 
 */

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
      center: [121.48132, 31.22631],
      zoom: 12,
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

    this.add4528Layer();
  },

  methods: {
    add4528Layer() {
      //定义坐标
      proj4.defs(
        "EPSG:4528",
        "+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=40500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs"
      );
      proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs +type=crs");
      //定义样式
      const style = {
        style: [
          {
            name: "area-fill",
            filter: true,
            renderPlugin: {
              dataConfig: {
                type: "fill",
              },
              sceneConfig: {},
              type: "fill",
            },
            symbol: {
              polygonFill: "red",
              polygonOpacity: 0.7,
            },
          },
          {
            name: "area-border",
            filter: true,
            renderPlugin: {
              dataConfig: {
                type: "line",
              },
              sceneConfig: {},
              type: "line",
            },
            symbol: {
              lineColor: "#000",
              lineOpacity: 1,
              lineWidth: 2,
            },
          },
        ],
      };
      //添加图层
      const layer = new GeoJSONVectorTileLayer("geo", {
        style,
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      layer.on("dataload", (e) => {
        this.map.fitExtent(e.extent);
      });
      this.groupLayer.addLayer(layer);
      //添加数据
      fetch("data/json/sh/shanghai-epsg4528.geojson")
        .then((res) => res.json())
        .then((geojson) => {
          this.geojsonTransform(geojson);
          layer.setData(geojson);
        });
    },
    geojsonTransform(geojson) {
      const coordinatesTransform = (coordinate) => {
        if (Array.isArray(coordinate[0])) {
          return coordinate.map((c) => {
            return coordinatesTransform(c);
          });
        } else {
          return proj4("EPSG:4528", "EPSG:4326", coordinate);
        }
      };
      geojson.features.forEach((feature) => {
        const coordinates = feature.geometry.coordinates;
        feature.geometry.coordinates = coordinatesTransform(coordinates);
      });
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
