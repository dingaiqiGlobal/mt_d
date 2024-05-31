<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
    <div id="json"></div>
  </div>
</template>

<script>
import {
  Map,
  TileLayer,
  VectorLayer,
  GeoJSON,
  Marker,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon,
} from "maptalks";
import {
  GroupGLLayer,
  VectorTileLayer,
  GeoJSONVectorTileLayer,
  PointLayer,
  LineStringLayer,
  PolygonLayer,
  GLTFLayer,
  GLTFMarker,
  MultiGLTFMarker,
  Geo3DTilesLayer,
} from "@maptalks/gl-layers";
import { HeatLayer } from "maptalks.heatmap";
import { ClusterLayer } from "maptalks.markercluster";
import MapEvent from "./MapEvent";
export default {
  components: {},
  data() {
    return {
      map: null,
      groupLayer: null,
      json: {
        jsonVersion: "1.0",
        version: "1.0.0-rc.30",
        extent: {
          xmin: 114.38464721065338,
          ymin: 39.90499411937603,
          xmax: 117.65585822794014,
          ymax: 42.73739581696245,
        },
        options: {
          spatialReference: {
            projection: "EPSG:3857",
          },
          center: {
            x: 116.96457,
            y: 40.5138,
          },
          zoom: 10,
          bearing: -25,
          pitch: 60,
        },
        baseLayer: {
          type: "TileLayer",
          id: "tile",
          options: {
            urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            subdomains: ["a", "b", "c", "d"],
            attribution: "© OpenStreetMap contributors, © CARTO",
            forceRenderOnMoving: true,
            zIndex: -1,
            fadeAnimation: true,
          },
        },
        layers: [
          {
            type: "GroupGLLayer",
            id: "group",
            layers: [
              {
                type: "GLTFLayer",
                id: "GLTFLayer_WebGL",
                options: {},
                geometries: [
                  {
                    coordinates: {
                      x: 117.06413,
                      y: 40.17205,
                    },
                    options: {
                      symbol: {
                        url: "data/model/CesiumMilkTruck.glb",
                        modelHeight: 1000,
                        rotationZ: 90,
                      },
                    },
                    zoomOnAdded: 10,
                  },
                ],
              },
            ],
            options: {
              sceneConfig: {
                environment: {
                  enable: true,
                  mode: 1,
                  level: 0,
                  brightness: 0,
                },
              },
            },
          },
          {
            type: "HeatLayer",
            id: "layer_01",
            options: {
              minZoom: 1,
              maxZoom: 22,
              radius: 25,
              blur: 15,
              gradient: {
                1: "#5d070b",
                0.2: "#1517f0",
                0.4: "#33ff06",
                0.6: "#f1ec04",
                0.8: "#d20d04",
              },
              resourceType: 1,
              resourceName: "resourceName_热力图",
              tableName: "tableName_01",
              mtLayerType: "热力图",
              url: "data/json/data_HR_Point.json",
              styleName1: "layer_01_marker_geo",
              styleName2: "layer_01_marker_text",
            },
          },
          {
            type: "ClusterLayer",
            id: "layer_02",
            options: {
              minZoom: 1,
              maxZoom: 22,
              drawClusterText: true,
              noClusterWithOneMarker: true,
              maxClusterRadius: 160,
              maxClusterZoom: 22,
              symbol: {
                markerFile: "images/icon/cluster1.png",
                markerOpacity: 1,
                markerWidth: 50,
                markerHeight: 50,
                markerHorizontalAlignment: "middle",
                markerVerticalAlignment: "middle",
              },
              textSymbol: {
                textSize: 14,
                textFill: "#fff",
                textOpacity: 1,
                textFaceName: "monospace",
                textWeight: "normal",
              },
              resourceType: 2,
              resourceName: "resourceName_聚合图",
              tableName: "tableName_02",
              mtLayerType: "聚散图",
              url: "data/json/data_HR_Point.json",
              styleName1: "layer_02_marker_geo",
              styleName2: "layer_02_marker_text",
              markerSymbol: {
                markerFile: "images/icon/icon_Red.png",
                markerOpacity: 1,
                markerWidth: 14,
                markerHeight: 20,
                markerDx: 0,
                markerDyy: 0,
                markerRotation: 0,
                markerHorizontalAlignment: "middle",
                markerVerticalAlignment: "middle",
                textName: null,
                textSize: 14,
                textFill: "#fff",
                textOpacity: 1,
                textFaceName: "monospace",
                textWeightt: "normal",
                textStyle: "normal",
                textRotation: 360,
                textDx: 0,
                textDy: 0,
                textWrapWidth: 240,
                textHaloFill: "#fff",
                textHaloRadius: 0.1,
                textHaloOpacity: 1,
                textHorizontalAlignment: "middle",
                textVerticalAlignment: "middle",
              },
            },
          },
        ],
      },
    };
  },
  mounted() {
    this.loadFromJson();
    setTimeout(() => {
      this.toJson();
    }, 3000);
  },

  methods: {
    //热力图与聚散图因为数据量大回显特殊处理

    loadFromJson() {
      //获取HeatLayer和ClusterLayer的数据
      let vectorLayer = this.json.layers.filter(
        (layer) => layer.type === "HeatLayer" || layer.type === "ClusterLayer"
      );
      //回显其他图层
      this.json.layers = this.json.layers.filter(
        (layer) => layer.type !== "HeatLayer" && layer.type !== "ClusterLayer"
      );
      let map = Map.fromJSON("map", this.json);
      this.map = map;

      //添加过滤后的图层
      vectorLayer.forEach((layer) => {
        if (layer.type === "HeatLayer") {
          const id = layer.id;
          const options = layer.options;
          const style = {
            radius: layer.options.radius,
            blur: layer.options.blur,
            gradient: layer.options.gradient,
          };
          this.addHeatMapLayer(id, options, style);
        } else if (layer.type === "ClusterLayer") {
          const id = layer.id;
          const options = layer.options;
          const markerSymbol = layer.options.markerSymbol;
          const clusterStyle = {
            maxClusterRadius: layer.options.maxClusterRadius,
            maxClusterZoom: layer.options.maxClusterZoom,
            symbol: {
              markerFile: layer.options.symbol.markerFile,
              markerOpacity: layer.options.symbol.markerOpacity,
              markerWidth: layer.options.symbol.markerWidth,
              markerHeight: layer.options.symbol.markerHeight,
              markerHorizontalAlignment: layer.options.symbol.markerHorizontalAlignment,
              markerVerticalAlignment: layer.options.symbol.markerVerticalAlignment,
            },
            textSymbol: {
              textSize: layer.options.textSymbol.textSize,
              textFill: layer.options.textSymbol.textFill,
              textOpacity: layer.options.textSymbol.textOpacity,
              textFaceName: layer.options.textSymbol.textFaceName,
              textWeight: layer.options.textSymbol.textWeight,
            },
          };
          this.addClusterLayer(id, options, markerSymbol, clusterStyle);
        }
      });
    },
    addHeatMapLayer(id, options, style = {}) {
      let { resourceType, resourceName, tableName, url } = options;
      //图层树名字
      let index = resourceName.indexOf("_");
      if (index != -1) {
        resourceName = resourceName.substring(0, index);
      }
      let radius = style.radius || 25;
      let blur = style.blur || 15;
      let gradient = style.gradient || {
        0.2: "#1517f0",
        0.4: "#33ff06",
        0.6: "#f1ec04",
        0.8: "#d20d04",
        1: "#5d070b",
      };
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          GeoJSON.toGeometryAsync(json).then((geos) => {
            let data = geos.map((p) => {
              let coordinate = p.getCoordinates();
              return [[coordinate.x, coordinate.y]];
            });
            let heatmapLayer = new HeatLayer(id, data, {
              minZoom: 1,
              maxZoom: 22,
              radius,
              blur,
              gradient,
            });
            heatmapLayer.setOptions({
              resourceType,
              resourceName: `${resourceName}_热力图`,
              tableName,
              mtLayerType: "热力图",
              url: url,
              styleName1: `${id}_marker_geo`,
              styleName2: `${id}_marker_text`,
            });
            this.map.addLayer(heatmapLayer);
          });
        });
    },
    addClusterLayer(id, options, markerSymbol = {}, clusterStyle = {}) {
      let { resourceType, resourceName, tableName, url } = options;
      //图层树名字
      let index = resourceName.indexOf("_");
      if (index != -1) {
        resourceName = resourceName.substring(0, index);
      }
      markerSymbol.markerFile = markerSymbol.markerFile || "";
      markerSymbol.markerOpacity = markerSymbol.markerOpacity || 1;
      markerSymbol.markerWidth = markerSymbol.markerWidth || 14;
      markerSymbol.markerHeight = markerSymbol.markerHeight || 20;
      markerSymbol.markerDx = markerSymbol.markerDx || 0;
      markerSymbol.markerDyy = markerSymbol.markerDy || 0;
      markerSymbol.markerRotation = markerSymbol.markerRotation || 0;
      markerSymbol.markerHorizontalAlignment =
        markerSymbol.markerHorizontalAlignment || "middle";
      markerSymbol.markerVerticalAlignment =
        markerSymbol.markerVerticalAlignment || "middle";
      //`{${textName}}`标注
      markerSymbol.textName = markerSymbol.textName || null;
      markerSymbol.textSize = markerSymbol.textSize || 14;
      markerSymbol.textFill = markerSymbol.textFill || "#fff";
      markerSymbol.textOpacity = markerSymbol.textOpacity || 1;
      markerSymbol.textFaceName = markerSymbol.textFaceName || "monospace";
      markerSymbol.textWeightt = markerSymbol.textWeight || "normal";
      markerSymbol.textStyle = markerSymbol.textStyle || "normal";
      markerSymbol.textRotation = markerSymbol.textRotation || 360;
      markerSymbol.textDx = markerSymbol.textDx || 0;
      markerSymbol.textDy = markerSymbol.textDy || 0;
      markerSymbol.textWrapWidth = markerSymbol.textWrapWidth || 240;
      markerSymbol.textHaloFill = markerSymbol.textHaloFill || "#fff";
      markerSymbol.textHaloRadius = markerSymbol.textHaloRadius || 0.1;
      markerSymbol.textHaloOpacity = markerSymbol.textHaloOpacity || 1;
      markerSymbol.textHorizontalAlignment =
        markerSymbol.textHorizontalAlignment || "middle";
      markerSymbol.textVerticalAlignment = markerSymbol.textVerticalAlignment || "middle";
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          GeoJSON.toGeometryAsync(json).then((geos) => {
            // this.markerArr = geos;
            geos.map((item) => {
              item.setSymbol(markerSymbol);
            });
            let clusterLayer = new ClusterLayer(id, geos, {
              minZoom: 1,
              maxZoom: 22,
              drawClusterText: true, //是否绘制集群文本（默认为true）-数字标注
              noClusterWithOneMarker: true, //是否只显示一个标记的聚类（默认为false）-当为1的时候显示图标
              maxClusterRadius: clusterStyle.maxClusterRadius || 160,
              maxClusterZoom: clusterStyle.maxClusterZoom || 22,
              symbol: {
                markerFile: clusterStyle.symbol.markerFile || "",
                markerOpacity: clusterStyle.symbol.markerOpacity || 1,
                markerWidth: clusterStyle.symbol.markerWidth || 50,
                markerHeight: clusterStyle.symbol.markerHeight || 50,
                markerHorizontalAlignment:
                  clusterStyle.symbol.markerHorizontalAlignment || "middle",
                markerVerticalAlignment:
                  clusterStyle.symbol.markerVerticalAlignment || "middle",
              },
              textSymbol: {
                textSize: clusterStyle.textSymbol.textSize || 14,
                textFill: clusterStyle.textSymbol.textFill || "#fff",
                textOpacity: clusterStyle.textSymbol.textOpacity || 1,
                textFaceName: clusterStyle.textSymbol.textFaceName || "monospace",
                textWeight: clusterStyle.textSymbol.textWeight || "normal",
              },
            });
            clusterLayer.setOptions({
              resourceType,
              resourceName: `${resourceName}_聚合图`,
              tableName,
              mtLayerType: "聚散图",
              url: url,
              styleName1: `${id}_marker_geo`,
              styleName2: `${id}_marker_text`,
            });
            this.map.addLayer(clusterLayer);
          });
        });
    },
    //热力图与聚散图因为数据量大存储时候处理
    toJson() {
      const json = this.map.toJSON();
      json.layers = json.layers.map((layer) => {
        // 如果图层是HeatLayer，则仅保留type、id和options字段
        if (layer.type === "HeatLayer" || layer.type === "ClusterLayer") {
          return {
            type: layer.type,
            id: layer.id,
            options: layer.options,
          };
        }
        // 如果图层不是HeatLayer，则保留原样
        return layer;
      });
      document.getElementById("json").innerHTML = JSON.stringify(json);
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
#json {
  position: fixed;
  background-color: rgba(13, 13, 13, 0.5);
  padding: 10px 10px 10px 10px;
  font: 13px bold sans-serif;
  color: #fff;
  left: 0px;
  top: 0px;
  width: 900px;
  height: 185px;
  overflow: auto;
}
</style>
