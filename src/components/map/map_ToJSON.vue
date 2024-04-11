<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
    <div id="json"></div>
  </div>
</template>

<script>
import * as dat from "dat.gui";
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
export default {
  components: {},
  data() {
    return {
      map: null,
      groupLayer: null,
    };
  },
  mounted() {
    this.map = new Map("map", {
      center: [116.96457, 40.5138],
      zoom: 10,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });
    this.groupLayer = new GroupGLLayer("group", [], {
      sceneConfig: {
        environment: {
          enable: true,
          mode: 1,
          level: 0,
          brightness: 0,
        },
      },
    }).addTo(this.map);
    /**
     * Canvas
     */
    this.addHeatMapLayer();
    this.addClusterLayer();
    this.add_Vector_Marker(); //不常用
    this.add_Vector_LingString(); //不常用
    this.add_Vector_Polygon(); //不常用

    /**
     * WebGL都不加入GroupGLLayer-密云
     * GeoJSONVTLayer利用样式插件
     */
    //this.add_VectorTileLayer();
    this.add_WebGL_PointLayer();
    this.add_WebGL_LineStringLayer();
    this.add_WebGL_PolygonLayer();
    this.add_GeoJSONVTLayer_Point();
    this.add_GeoJSONVTLayer_LineString();
    this.add_GeoJSONVTLayer_Polygon();
    this.add_GLTFLayer(); //可以添加多个GLTFMarker和MultiGLTFMarker
    this.add_MultiGLTFMarker();
    this.add_Geo3DTilesLayer(); //故宫

    /**
     * WebGL加入GroupGLLayer,就是多加一个分组
     */
    this.add_GroupGL_PointLayer();
    this.add_GroupGL_GeoJSONVTLayer_Point();
    this.add_GroupGL_GLTFLayer();

    //json输出，存在异步（热力图，聚散图异步等等）
    setTimeout(() => {
      this.toJson();
    }, 3000);
  },

  methods: {
    add_GroupGL_PointLayer() {
      const pointLayer = new PointLayer("GroupGL_Point");
      const marker = new Marker([117.0813, 40.18412], {
        cursor: "pointer",
        symbol: {
          markerFile: "images/icon/icon_Red.png",
          markerOpacity: 1,
          markerWidth: 28,
          markerHeight: 40,
          textName: "GroupGL矢量点",
        },
      }).addTo(pointLayer);
      this.groupLayer.addLayer(pointLayer);
    },
    add_GroupGL_GeoJSONVTLayer_Point() {
      let GeoJSONLayer = new GeoJSONVectorTileLayer("VT_Point_GroupGL", {
        data: "data/json/data_PG_Point.json",
        style: {
          style: [
            {
              name: `marker_geo`,
              renderPlugin: {
                type: "icon",
                dataConfig: {
                  type: "point",
                  only2D: true,
                },
                sceneConfig: {
                  depthFunc: "always",
                  blendSrc: "one",
                },
              },
              filter: true,
              symbol: {
                markerFile: "images/icon/icon_Red.png",
                markerOpacity: 1,
                markerWidth: 28,
                markerHeight: 40,
                markerBloom: true,
              },
            },
            {
              name: `marker_text`,
              renderPlugin: {
                dataConfig: {
                  type: "point",
                },
                sceneConfig: {
                  collision: true,
                  fading: false,
                  depthFunc: "always",
                },
                type: "text",
              },
              filter: true,
              symbol: {
                textName: "{NAME}",
              },
            },
          ],
        },
      });
      this.groupLayer.addLayer(GeoJSONLayer);
    },
    add_GroupGL_GLTFLayer() {
      const gltfLayer = new GLTFLayer("GLTFLayer_WebGL");
      const gltfMarker = new GLTFMarker([117.06413, 40.17205], {
        symbol: {
          url: "data/model/CesiumMilkTruck.glb",
          modelHeight: 1000,
          rotationZ: 90,
        },
      });
      gltfLayer.addGeometry(gltfMarker);
      this.groupLayer.addLayer(gltfLayer);
    },

    addHeatMapLayer() {
      fetch(`data/json/data_HR_Point.json`)
        .then((response) => response.json())
        .then((json) => {
          GeoJSON.toGeometryAsync(json).then((geos) => {
            let data = geos.map((p) => {
              let coordinate = p.getCoordinates();
              return [[coordinate.x, coordinate.y]];
            });
            new HeatLayer("Heat_Point", data, {
              radius: 25,
              blur: 15,
              gradient: {
                0.4: "blue",
                0.6: "cyan",
                0.7: "lime",
                0.8: "yellow",
                1.0: "red",
              },
            }).addTo(this.map);
          });
        });
    },

    addClusterLayer() {
      fetch(`data/json/data_HR_Point.json`)
        .then((response) => response.json())
        .then((json) => {
          GeoJSON.toGeometryAsync(json).then((geos) => {
            geos.map((item) => {
              item.setSymbol({
                markerFile: "images/icon/icon_Red.png",
                markerOpacity: 1,
                markerWidth: 28,
                markerHeight: 40,
                textName: "{NAME}",
              });
            });
            let clusterLayer = new ClusterLayer("Cluster_Point", geos, {
              maxClusterRadius: 160,
              maxClusterZoom: 18,
              symbol: {
                markerFile: "images/icon/cluster3.png",
                markerOpacity: 1,
                markerWidth: 50,
                markerHeight: 50,
              },
              textSymbol: {
                textSize: 20,
                textFill: "#0900d9",
                textOpacity: 1,
                textDx: 0,
                textDy: -25,
              },
            });
            this.map.addLayer(clusterLayer);
          });
        });
    },

    add_Vector_Marker() {
      const point = new Marker([116.47568, 40.37375], {
        cursor: "pointer",
        symbol: {
          markerFile: "images/icon/icon_Red.png",
          markerOpacity: 1,
          markerWidth: 28,
          markerHeight: 40,
          textName: "矢量点",
        },
      });
      new VectorLayer("Vector_Marker", point).addTo(this.map);
    },
    add_Vector_LingString() {
      const lineString = new LineString(
        [
          [116.47156, 40.32351],
          [116.50589, 40.51693],
        ],
        {
          cursor: "pointer",
          symbol: {
            lineColor: "#1bbc9b",
            lineWidth: 3,
            textName: "矢量线",
          },
        }
      );
      new VectorLayer("Vector_LineString", lineString).addTo(this.map);
    },
    add_Vector_Polygon() {
      const polygon = new Polygon(
        [
          [
            [116.54812, 40.48665],
            [116.58966, 40.48508],
            [116.57593, 40.42003],
            [116.52512, 40.44721],
            [116.54812, 40.48665],
          ],
        ],
        {
          cursor: "pointer",
          symbol: {
            lineColor: "#34495e",
            lineWidth: 2,
            polygonFill: "rgb(135,196,240)",
            polygonOpacity: 0.6,
            textName: "矢量面",
          },
        }
      );
      new VectorLayer("Vector_Polygon", polygon).addTo(this.map);
    },

    add_VectorTileLayer() {
      let token =
        "pk.eyJ1Ijoic2tiZXlvbmQiLCJhIjoiY2s5MmU1Y2RiMDR4aTNtcDh0MmgwaHQzcyJ9._tMktptrxVL-QNN5s2plzg";
      let vectorTileLayer = new VectorTileLayer("VT_WebGL", {
        urlTemplate: `https://api.mapbox.com/v4/mapbox.mapbox-streets-v11/{z}/{x}/{y}.vector.pbf?access_token=${token}`,
        style: "styles/mapbox-light/style.json",
      });
      this.map.addLayer(vectorTileLayer);
    },

    add_WebGL_PointLayer() {
      const pointLayer = new PointLayer("WebGL_Point");
      const marker = new Marker([116.88354, 40.51014], {
        cursor: "pointer",
        symbol: {
          markerFile: "images/icon/icon_Red.png",
          markerOpacity: 1,
          markerWidth: 28,
          markerHeight: 40,
          textName: "WebGL矢量点",
        },
      }).addTo(pointLayer);
      this.map.addLayer(pointLayer);
    },

    add_WebGL_LineStringLayer() {
      const lineLayer = new LineStringLayer("WebGL_LineString");
      const line = new LineString(
        [
          [116.85196, 40.45322],
          [117.01813, 40.54224],
        ],
        {
          cursor: "pointer",
          symbol: {
            lineColor: "#1bbc9b",
            lineWidth: 3,
            textName: "WebGL矢量线",
          },
        }
      ).addTo(lineLayer);
      this.map.addLayer(lineLayer);
    },

    add_WebGL_PolygonLayer() {
      const polygonLayer = new PolygonLayer("WebGL_Polygon");
      const polygon = new Polygon(
        [
          [
            [116.93333, 40.49605],
            [116.94534, 40.45113],
            [116.99856, 40.46863],
            [116.94878, 40.48926],
            [116.93333, 40.49605],
          ],
        ],
        {
          cursor: "pointer",
          symbol: {
            lineColor: "#34495e",
            lineWidth: 2,
            polygonFill: "rgb(135,196,240)",
            polygonOpacity: 0.6,
            textName: "WebGL矢量面",
          },
        }
      ).addTo(polygonLayer);
      this.map.addLayer(polygonLayer);
    },

    add_GeoJSONVTLayer_Point() {
      let GeoJSONLayer = new GeoJSONVectorTileLayer("VT_Point_WebGL", {
        data: "data/json/data_MY_Point.json",
        style: {
          style: [
            {
              name: `marker_geo`,
              renderPlugin: {
                type: "icon",
                dataConfig: {
                  type: "point",
                  only2D: true,
                },
                sceneConfig: {
                  depthFunc: "always",
                  blendSrc: "one",
                },
              },
              filter: true,
              symbol: {
                markerFile: "images/icon/icon_Red.png",
                markerOpacity: 1,
                markerWidth: 28,
                markerHeight: 40,
                markerBloom: true,
              },
            },
            {
              name: `marker_text`,
              renderPlugin: {
                dataConfig: {
                  type: "point",
                },
                sceneConfig: {
                  collision: true,
                  fading: false,
                  depthFunc: "always",
                },
                type: "text",
              },
              filter: true,
              symbol: {
                textName: "{NAME}",
              },
            },
          ],
        },
      });
      this.map.addLayer(GeoJSONLayer);
    },

    add_GeoJSONVTLayer_LineString() {
      let GeoJSONLayer = new GeoJSONVectorTileLayer("VT_LineString_WebGL", {
        data: "data/json/data_MY_LineString.json",
      });
      this.map.addLayer(GeoJSONLayer);
    },

    add_GeoJSONVTLayer_Polygon() {
      let GeoJSONLayer = new GeoJSONVectorTileLayer("VT_Polygon_WebGL", {
        data: "data/json/data_MY_Polygon.json",
      });
      this.map.addLayer(GeoJSONLayer);
    },
    add_GLTFLayer() {
      const gltfLayer = new GLTFLayer("GLTFLayer_WebGL");
      const gltfMarker = new GLTFMarker([117.09366, 40.60353], {
        symbol: {
          url: "data/model/Cesium_Air.glb",
          modelHeight: 800,
          rotationZ: 90,
        },
      });
      gltfLayer.addGeometry(gltfMarker);
      this.map.addLayer(gltfLayer);
    },
    add_MultiGLTFMarker() {
      const multiGLTFLayer = new GLTFLayer("MultiGLTFMarker_WebGL");
      const multiGLTFMarker = new MultiGLTFMarker(
        [
          {
            coordinates: [117.12524, 40.62438],
            translation: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
          },
          {
            coordinates: [117.22, 40.59414],
            translation: [0, 2, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
          },
        ],
        {
          symbol: {
            url: "data/model/CesiumDrone.glb",
            modelHeight: 400,
          },
        }
      );
      multiGLTFLayer.addGeometry(multiGLTFMarker);
      this.map.addLayer(multiGLTFLayer);
    },
    add_Geo3DTilesLayer() {
      const geo3DTilesLayer = new Geo3DTilesLayer("3dtiles_WebGL", {
        maxGPUMemory: 512,
        services: [
          {
            url: "data/3dtiles/BuildingBlue/tileset.json",
            maximumScreenSpaceError: 16.0,
            heightOffset: 0,
          },
        ],
      });
      this.map.addLayer(geo3DTilesLayer);
    },

    toJson() {
      const mapJSON = this.map.toJSON();
      document.getElementById("json").innerHTML = JSON.stringify(mapJSON);
      console.log(this.map.getLayers(), "图层打印显示");
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
