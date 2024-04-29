<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-input
        type="textarea"
        :rows="2"
        placeholder="请输入内容"
        v-model="multigltf.url"
        @change="changeUrl"
      >
      </el-input>
      <el-color-picker
        v-model="multigltf.markerFill"
        @change="changeMarkerFill"
      ></el-color-picker>
      <span class="demonstration">缩放X</span>
      <el-slider v-model="multigltf.scaleX" @change="changeScaleX"></el-slider>
    </div>
  </div>
</template>

<script>
import { Map, TileLayer, GeoJSON, renderer } from "maptalks";
import {
  GeoJSONVectorTileLayer,
  GroupGLLayer,
  GLTFLayer,
  GLTFMarker,
  MultiGLTFMarker,
} from "@maptalks/gl-layers";
export default {
  components: {},

  data() {
    return {
      map: null,
      multigltf: {
        url: "data/model/Cesium_Man.glb",
        markerFill: "#08eafe",
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        translationX: 0,
        translationY: 0,
        translationZ: 0,
      },
    };
  },

  computed: {},

  mounted() {
    this.map = new Map("map", {
      center: [116.93573, 40.53259],
      zoom: 12,
      spatialReference: {
        projection: "EPSG:3857",
      },
      lights: {
        directional: {
          direction: [1, 0, -1],
          color: [1, 1, 1],
        },
        ambient: {
          resource: {
            prefilterCubeSize: 1024,
          },
          hsv: [0, 0.34, 0],
          orientation: 0,
        },
      },
      baseLayer: new TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });
    let GeoJSONLayer = new GeoJSONVectorTileLayer("gvt1", {
      data: "data/json/data_MY_Point.json",
      style: {
        style: [
          {
            name: "ding",
            renderPlugin: {
              type: "gltf-lit",
              dataConfig: {
                type: "native-point",
              },
              sceneConfig: {
                gltfAnimation: {
                  enable: false,
                },
              },
            },
            filter: true,
            symbol: {
              url: this.multigltf.url,
              markerFill: this.multigltf.markerFill,
              translationX: this.multigltf.translationX,
              translationY: this.multigltf.translationY,
              translationZ: this.multigltf.translationZ,
              rotationX: this.multigltf.rotationX,
              rotationY: this.multigltf.rotationY,
              rotationZ: this.multigltf.rotationZ,
              scaleX: this.multigltf.scaleX,
              scaleY: this.multigltf.scaleY,
              scaleZ: this.multigltf.scaleZ,
              animation: true,
              modelHeight: 500,
            },
          },
        ],
      },
    });
    this.map.addLayer(GeoJSONLayer);
  },
  methods: {
    // setGltfLitStyle(id, options) {
    //   //模型
    //   let url = options.url || "data/model/Cesium_Air.glb";
    //   let markerFill = options.markerFill || "#08eafe";
    //   let scaleX = options.scaleX || 1;
    //   let scaleY = options.scaleY || 1;
    //   let scaleZ = options.scaleZ || 1;
    //   let rotationX = options.rotationX || 0;
    //   let rotationY = options.rotationY || 0;
    //   let rotationZ = options.rotationZ || 0;
    //   let translationX = options.translationX || 0;
    //   let translationY = options.translationY || 0;
    //   let translationZ = options.translationZ || 0;
    //   const style = {
    //     style: [
    //       {
    //         name: `${id}_gltf_lit`,
    //         renderPlugin: {
    //           type: "gltf-lit",
    //           dataConfig: {
    //             type: "native-point",
    //           },
    //           sceneConfig: {
    //             gltfAnimation: {
    //               enable: true,
    //             },
    //           },
    //         },
    //         filter: true,
    //         symbol: {
    //           url,
    //           markerFill,
    //           translationX,
    //           translationY,
    //           translationZ,
    //           rotationX,
    //           rotationY,
    //           rotationZ,
    //           scaleX,
    //           scaleY,
    //           scaleZ,
    //           modelHeight: 500,
    //         },
    //       },
    //     ],
    //   };
    //   let _target = this.map.getLayer(id);
    //   _target.setStyle(style);
    // },
    updateSymbol(id, idx, symbol) {
      let _target = this.map.getLayer(id);
      _target.updateSymbol(idx, symbol);
      //更改模型不起效果
       let newStyle = _target.getStyle();
        _target.setStyle(newStyle)
    },
    changeUrl(value) {
      this.updateSymbol("gvt1", "ding", { url: value });
    },
    changeMarkerFill(value) {
      this.updateSymbol("gvt1", "ding", { markerFill: value });
    },
    changeScaleX(value) {
      this.updateSymbol("gvt1", "ding", { scaleX: value });
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
