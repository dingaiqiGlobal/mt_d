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
import { RoutePlayer, formatRouteData } from "maptalks.routeplayer";

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
      center: [116.31178, 39.9907],
      zoom: 20,
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
    this.gltfLayer=new GLTFLayer("gltf");
    this.groupLayer = new GroupGLLayer("group", [this.gltfLayer], { sceneConfig });
    this.groupLayer.addTo(this.map);

    this.carRoute()
  },

  methods: {
    /**
     * 车辆轨迹
     */
    carRoute() {
      let _this = this;
      function loadRouteLines() {
        fetch("data/json/data_bj_chengfulu_route.json") //MultiLineString
          .then((response) => {
            return response.json();
          })
          .then((geojson) => {
            let features = geojson.features;
            let road = features[0].geometry.coordinates;
            task(road[0]); //23个节点
          });
      }
      loadRouteLines();
      //任务
      function task(routeNode) {
        for (let i = 0; i < routeNode.length; i++) {
          //添加海拔
          if (i > 10) {
            routeNode[i] = [routeNode[i][0], routeNode[i][1], 6.5];
          } else {
            routeNode[i] = [routeNode[i][0], routeNode[i][1], 7];
          }
          //添加car模型
          let start = routeNode[0];
          let car = new GLTFMarker([start[0], start[1], 5], {
            symbol: {
              url: "data/model/GroundVehicle.glb",
              rotationZ: 92,
              loop: true,
              animation: true,
              bloom: false,
              shadow: true,
              modelHeight: 1.5,
            },
          }).addTo(_this.gltfLayer);
          //轨迹
          const data = formatRouteData(routeNode, {
            duration: 1000 * 60 * 10,
          });
          _this.carPlayer = new RoutePlayer(data, {
            showTrail: true, //跟踪？？？
            speed: 7, //速度
            autoPlay: true, //是否自动播放
            repeat: false, //是否重复播放
            //unitTime: 1, //单位时间
            //debug: true, //调试
            // showRoute: true,
            // markerSymbol: {
            //     markerOpacity: 0,
            // },
            // lineSymbol: {
            //     lineColor: "#FFFFFF",
            //     lineWidth: 100,
            // },
          });
          // _this.carPlayer.on("playstart", (e) => {

          // })
          _this.carPlayer.play();
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
