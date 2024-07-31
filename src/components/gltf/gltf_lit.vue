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
import * as THREE from "three";
import { ThreeLayer } from "maptalks.three";

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
      center: [120.59421765, 31.27427065],
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
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [], { sceneConfig });
    this.groupLayer.addTo(this.map);
    this.addGlltfTree();
  },

  methods: {
    addGlltfTree() {
      const style = {
        style: [
          {
            filter: true,
            renderPlugin: {
              type: "gltf-lit",
              dataConfig: {
                type: "native-point",
              },
              sceneConfig: {
                minZoom: 17,//控制缩放
                gltfAnimation: {
                  enable: true,
                },
              },
            },
            symbol: {
              // markerFill: "#0f0",
              // markerRotationAlignment: "line",
              url: "data/model/tree/tree.gltf",
              // markerPlacement: "vertex-last",
              // rotationZ: 90,
              // anchorZ: "middle",
              // translationX: -120,
              scaleX: 0.5,
              scaleY: 0.5,
              scaleZ: 0.6,
            },
          },
        ],
      };
      const vt = new GeoJSONVectorTileLayer("vt", {
        data: "data/json/trees.geojson",
        style,
      });
      this.groupLayer.addLayer(vt);
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
