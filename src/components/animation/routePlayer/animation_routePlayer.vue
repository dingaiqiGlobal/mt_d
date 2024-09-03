<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-button @click="start">轨迹回放</el-button>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, GLTFLayer, GLTFMarker } from "@maptalks/gl-layers";
import CustomRoutePlayer from "./CustomRoutePlayer";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      customRoutePlayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.32816570789676, 39.991406601482026],
      zoom: 18,
      spatialReference: {
        projection: "EPSG:3857",
      },
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
     * 1.底图必须加载GroupGLLayer中
     * 2.底图必须抬高至少0.4
     */
    let baseLayer = new maptalks.TileLayer("tile", {
      bufferPixel: 0, //瓦片之间有缝隙
      altitude: 1, //设置TileLayer的整体海拔
      urlTemplate:
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
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
    this.gltfLayer = new GLTFLayer("gltf");
    this.groupLayer = new GroupGLLayer("group", [this.gltfLayer, baseLayer], {
      sceneConfig,
    });
    this.groupLayer.addTo(this.map);

    this.addGltfLayer();
    this.customRoutePlayer = new CustomRoutePlayer(this.map);
  },

  methods: {
    addGltfLayer() {
      let MJ = new GLTFMarker([116.328199067133, 39.9911669355057, 1], {
        id: "门禁",
        symbol: {
          url: "data/model/Cesium_Air.glb",
          modelHeight: 5,
        },
      }).addTo(this.gltfLayer);
      let JG = new GLTFMarker([116.328239149018, 39.9908789689893, 1], {
        id: "井盖",
        symbol: {
          url: "data/model/CesiumBalloon.glb",
          modelHeight: 8,
        },
      }).addTo(this.gltfLayer);
      let LJT = new GLTFMarker([116.328277830657, 39.9906010658866, 1], {
        id: "垃圾桶",
        symbol: {
          url: "data/model/CesiumDrone.glb",
          modelHeight: 2,
        },
      }).addTo(this.gltfLayer);
      let LD = new GLTFMarker([116.32835797554, 39.9900422415562, 1], {
        id: "路灯",
        symbol: {
          url: "data/model/CesiumMilkTruck.glb",
          modelHeight: 5,
        },
      }).addTo(this.gltfLayer);
    },
    start() {
      if (this.customRoutePlayer.oldPlayer == null) {
        this.customRoutePlayer.oldRoute();
      } else {
        if (
          this.customRoutePlayer.oldPlayer.isPlaying() &&
          !this.customRoutePlayer.oldPlayer.isPlayend()
        )
          this.customRoutePlayer.oldPlayer.pause();
        else if (this.customRoutePlayer.oldPlayer.isPlayend()) {
          this.customRoutePlayer.oldPlayer.reset();
          this.customRoutePlayer.oldPlayer.play();
        } else {
          this.customRoutePlayer.oldPlayer.play();
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
