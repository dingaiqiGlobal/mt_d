<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
/**
 * 利用IndexedDB缓存图层数据
 * npm install localforage --save
 *
 */
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl-layers";
import localForage from "localforage/src/localforage";

export default {
  components: {},

  data() {
    return {
      map: null,
      baseLayer: null,
      groupLayer: null,
      dataStore: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      layers: [],
    });
    /**
     *初始化存储
     */
    this.dataStore = localForage.createInstance({
      name: "maptalks-baseLayer-store",
    });
    /**
     * baseLayer继承TileLayer中的事件和方法
     * renderercreate事件
     */
    this.baseLayer = new maptalks.TileLayer("base", {
      urlTemplate:
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      subdomains: ["a", "b", "c", "d"],
      maxAvailableZoom: 18,
      version: 1,
    });
    this.baseLayer.on("renderercreate", (e) => {
      let _this = this;
      e.renderer.loadTileBitmap = function (url, tile, callback) {
        const { x, y, z } = tile;
        const id = _this.baseLayer.getId();
        const version = _this.baseLayer.options.version;
        //生成唯一key
        const key = `layer_${id}_${version}_${z}_${x}_${y}`;
        //如果存在返回给图层，否则进行网络请求
        _this.dataStore
          .getItem(key)
          .then((image) => {
            if (image) {
              _this.copyImage(image).then((imageBit) => {
                callback(imageBit);
              });
            } else {
              _this.fetchTile(url, key, callback);
            }
          })
          .catch((error) => {
            console.error(error);
            _this.fetchTile(url, key, callback);
          });
      };
    });

    /**
     * groupLayer
     */
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true },
        bloom: {
          enable: true,
          threshold: 0,
          factor: 1,
          radius: 0.02,
        },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [], { sceneConfig });
    this.groupLayer.addTo(this.map);
    this.baseLayer.addTo(this.groupLayer);
  },

  methods: {
    copyImage(image) {
      return window.createImageBitmap(image);
    },
    fetchTile(url, key, callback) {
      fetch(url)
        .then((res) => res.blob())
        .then((blob) =>  window.createImageBitmap(blob))
        .then((image) => {
          callback(image);
          this.copyImage(image).then((imageBit) => {
            this.dataStore.setItem(key, imageBit);
          });
        })
        .catch((error) => {
          console.error(error);
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
