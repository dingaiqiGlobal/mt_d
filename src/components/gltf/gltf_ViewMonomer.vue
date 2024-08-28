<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import {
  GroupGLLayer,
  GeoJSONVectorTileLayer,
  GLTFLayer,
  GLTFMarker,
  Geo3DTilesLayer,
} from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      gltfLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.31178, 39.9907],
      zoom: 22,
      pitch: 66,
      bearing: 87,
      spatialReference: {
        projection: "EPSG:3857",
      },
      // baseLayer: new maptalks.TileLayer("tile", {
      //   urlTemplate:
      //     "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      // }),
      layers: [],
      lights: {
        directional: {
          direction: [1, 0, -1],
          color: [1, 1, 1],
        },
        ambient: {
          resource: {
            url: {
              front: "images/skybox/446/front.jpg",
              back: "images/skybox/446/back.jpg",
              left: "images/skybox/446/left.jpg",
              right: "images/skybox/446/right.jpg",
              top: "images/skybox/446/top.jpg",
              bottom: "images/skybox/446/bottom.jpg",
            },
            prefilterCubeSize: 256,
          },
          exposure: 0.8,
          hsv: [0, 0.34, 0],
          orientation: 1,
        },
      },
    });

    /**
     * groupLayer
     */
    const sceneConfig = {
      environment: {
        enable: true,
        mode: 1,
        level: 0,
        brightness: 0.489,
      },
      shadow: {
        type: "esm",
        enable: true,
        quality: "high",
        opacity: 0.5,
        color: [0, 0, 0],
        blurOffset: 1,
      },
      postProcess: {
        enable: true,
        antialias: {
          enable: true,
          taa: true,
          jitterRatio: 0.25,
        },
        ssr: {
          enable: true,
        },
        bloom: {
          enable: true,
          threshold: 0,
          factor: 1,
          radius: 1,
        },
        ssao: {
          enable: true,
          bias: 0.101,
          radius: 0.069,
          intensity: 1.5,
        },
        sharpen: {
          enable: false,
          factor: 0.2,
        },
        outline: {
          enable: true,
          outlineFactor: 0.3,
          highlightFactor: 0.2,
          outlineWidth: 1,
          outlineColor: [1, 1, 0],
        },
      },
      ground: {
        enable: true,
        renderPlugin: {
          type: "fill",
        },
        symbol: {
          polygonFill: [0.168, 0.2, 0.274, 1],
          polygonOpacity: 1,
        },
        extras: {
          currentMaterial: "",
        },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [], { sceneConfig });
    this.groupLayer.addTo(this.map);

    //添加图层
    // this.addRoadLayer();
    this.addRoadConditionsLayer();
    this.addGltfModel();
    this.add3DTiles();
  },

  methods: {
    // addRoadLayer() {
    //   const style = {
    //     renderPlugin: {
    //       type: "line",
    //       dataConfig: {
    //         type: "line",
    //       },
    //       sceneConfig: {},
    //     },
    //     symbol: {
    //       lineBloom: false,
    //       lineCap: "butt",
    //       lineColor: [1, 1, 1, 1],
    //       lineDasharray: [0, 0, 0, 0],
    //       lineDashColor: [1, 1, 1, 0],
    //       lineDx: 0,
    //       lineDy: 0,
    //       lineJoin: "miter",
    //       lineOpacity: 1,
    //       linePatternAnimSpeed: 0,
    //       linePatternFile: "images/icon/texture_road.jpg",
    //       lineStrokeWidth: 0,
    //       lineStrokeColor: [0, 0, 0, 1],
    //       lineJoinPatternMode: 0,
    //       lineWidth: {
    //         type: "exponential",
    //         default: 2,
    //         stops: [
    //           [14, 2],
    //           [15, 4],
    //           [16, 10],
    //           [17, 20],
    //           [18, 50],
    //           [20.7, 100],
    //           [22, 200],
    //         ],
    //       },
    //       visible: true,
    //     },
    //   };
    //   const GeoJSONLayer = new GeoJSONVectorTileLayer("geojson1", {
    //     data: "data/json/data_bj_erhuang.json",
    //     style,
    //   });
    //   this.groupLayer.addLayer(GeoJSONLayer);
    // },
    addRoadConditionsLayer() {
      const style = {
        renderPlugin: {
          type: "line",
          dataConfig: {
            type: "line",
          },
          sceneConfig: {
            //WebGL深度测试函数，可选的值有 always, never, <, <=, !=, >, >=
            //数据里必须包含z，例子[116.555,40.651,7]
            depthFunc: "<=",
            depthMask: true,
          },
        },
        symbol: {
          lineBloom: false,
          lineColor: {
            type: "categorical",
            property: "conditions",
            stops: [
              ["拥堵", "#ff0006"],
              ["缓慢", "#fffc00"],
              ["畅通", "#1fe198"],
            ],
          },
          lineOpacity: 0.3,
          lineWidth: {
            type: "exponential",
            default: 2,
            stops: [
              [14, 2],
              [15, 4],
              [16, 10],
              [17, 20],
              [18, 50],
              [20.7, 100],
              [22, 200],
            ],
          },
          visible: true,
        },
      };
      const GeoJSONLayer = new GeoJSONVectorTileLayer("geojson2", {
        data: "data/json/data_bj_chengfulu.json",
        style,
      });
      this.groupLayer.addLayer(GeoJSONLayer);
    },
    addGltfModel() {
      this.gltfLayer = new GLTFLayer("gltf", {
        minZoom: null,
        maxZoom: null,
        opacity: 1,
      });
      const symbol = {
        url: "data/model/GroundVehicle.glb",
        modelHeight: 1.5, //模型高度
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        rotationZ: 180,
      };

      const gltfMarker = new GLTFMarker([116.42783, 39.93524], {
        fitSize: 80, //模型加到地图上的初始尺寸，单位像素
        symbol,
        visible: true,
      });
      this.gltfLayer.addGeometry(gltfMarker);
      this.groupLayer.addLayer(this.gltfLayer);
    },
    add3DTiles() {
      const geo3DTilesLayer = new Geo3DTilesLayer("Geo3DTilesLayer", {
        services: [
          {
            url: "data/3dtiles/DaoLu/tileset.json",
            maximumScreenSpaceError: 16, //该值越小，渲染精度越高，项目允许的情况下，该值越大性能越好
            ambientLight: [0.2, 0.2, 0.2],
            heightOffset: -35,
            scale: [1, 1, 1], //3dtile整体的缩放参数
            rotation: [0, 0, 0], //3dtile整体的旋转参数
            coordOffset: [0, 0], //3dtile整体偏移量参数
          },
        ],
      });
      this.groupLayer.addLayer(geo3DTilesLayer);
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
