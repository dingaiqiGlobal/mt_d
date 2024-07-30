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
      geojson: {
        type: "FeatureCollection",
        features: [],
      },
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.31585, 39.9597],
      zoom: 18,
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
    //GroupGLLayer能实现抗锯齿等后处理，也能加入其他三维图层，让子图层都融合到同一个三维空间中
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true }, //抗锯齿
      },
    };
    this.groupLayer = new GroupGLLayer("group", [], { sceneConfig });
    this.groupLayer.addTo(this.map);

    this.mergeGeoJSON();
  },

  methods: {
    getGeoJSON(fileName) {
      return fetch(`data/json/building_floor/${fileName}.json`).then((res) => res.json());
    },
    /**
     * 合并geoJson
     * 可以把多个GeoJSON文件合并成一个文件，然后再GeoJSONVectorTileLayer的样式系统里用filter进行数据分类和进行分类配置样式
     */
    mergeGeoJSON() {
      const fileNames = ["building", "label"]; 
      //building数据要分层制作
      //label数据坐标手动添加了高度(楼层标注数据携带海拔值)
      const fetchs = fileNames.map((fileName) => {
        return this.getGeoJSON(fileName);
      });
      Promise.all(fetchs).then((geojsons) => {
        const data = [];
        geojsons.forEach((d, index) => {
          data[index] = {
            layerName: fileNames[index],
            features: d.features,
          };
        });
        let id = 1;
        data.forEach((d) => {
          const { layerName, features } = d;
          features.forEach((f) => {
            f.properties.layerName = layerName;
            f.properties.subFeatureIndex = id;
            id++;
            this.geojson.features.push(f); //构造
          });
        });
        this.addLayer(this.geojson);
      });
     
    },
    addLayer(dataJson) {
      const style = [
        {
          name: "building-floors",
          filter: ["all", ["==", "$type", "Polygon"]],
          renderPlugin: {
            type: "lit",
            dataConfig: {
              type: "3d-extrusion",
              altitudeProperty: "height",
              minHeightProperty: "bottomH",
              altitudeScale: 1,
              defaultAltitude: 10,
              topThickness: 1,
              top: true,
              side: true,
            },
            sceneConfig: {},
          },
          symbol: {
            polygonFill: {
              property: "floor",
              type: "interval",
              stops: (function () {
                let floor = 1;
                const result = [];
                //单双层
                while (floor < 100) {
                  if (floor % 2 === 0) {
                    result.push([floor, "white"]);
                  } else {
                    result.push([floor, "#0579D6"]);
                  }
                  floor++;
                }
                return result;
              })(),
              default: "#fff",
            },
            polygonOpacity: 0.7,
            material: {
              baseColorFactor: [1, 1, 1, 1],
              roughnessFactor: 1,
              metallicFactor: 1,
            },
          },
        },
        {
          name: "building-floors-label",
          filter: ["all", ["==", "$type", "Point"]],
          renderPlugin: {
            dataConfig: {
              type: "point",
            },
            sceneConfig: {
              collision: true,
              fading: true,
              depthFunc: "always",
            },
            type: "text",
          },
          symbol: {
            textFaceName: "Microsoft YaHei,sans-serif",
            textFill: [0, 0, 0, 1],
            textHaloFill: [1, 1, 1, 1],
            textHaloOpacity: 1,
            textHaloRadius: 1,
            textName: "{floor}楼",
            textSize: 12,
            textDy: -10,
          },
        },
      ];
      const layer = new GeoJSONVectorTileLayer("geo", {
        data: dataJson,
        style,
      });
      this.groupLayer.addLayer(layer);
    },
    /**
     * 自己写的给建筑物加楼层点
     */
    // buildFloorPoint() {
    //   fetch("data/json/building_floor/building.json")
    //     .then((res) => res.json())
    //     .then((geojson) => {
    //       const data = {
    //         type: "FeatureCollection",
    //         features: [],
    //       };
    //       geojson.features.forEach((f) => {
    //         const { properties } = f;
    //         const { height } = properties;
    //         const polygon = maptalks.GeoJSON.toGeometry(f);
    //         const center = polygon.getCoordinates()[0][0];

    //         const createPointFeature = (height, properties) => {
    //           center.z = height;
    //           return {
    //             type: "Features",
    //             properties,
    //             geometry: {
    //               type: "Point",
    //               coordinates: center.toArray(),
    //             },
    //           };
    //         };
    //         if (height <= 4) {
    //           properties.bottomHeight = 0;
    //           properties.floor = 1;
    //           properties.height = height;
    //           data.features.push(f);
    //           data.features.push(createPointFeature(height, properties));
    //         } else {
    //           const floors = Math.ceil(height / 4);
    //           for (let floor = 1; floor <= floors; floor++) {
    //             const feature = JSON.parse(JSON.stringify(f));
    //             feature.properties.floor = floor;
    //             feature.properties.bottomHeight = (floor - 1) * 4;
    //             feature.properties.height = floor * 4;
    //             data.features.push(feature);
    //             data.features.push(createPointFeature(floor * 4, feature.properties));
    //           }
    //         }
    //       });
    //       console.log(JSON.stringify(data));
    //     });
    // },
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
