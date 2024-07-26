<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl-layers";
import * as THREE from "three";
import { ThreeLayer } from "maptalks.three";

export default {
  components: {},

  data() {
    return {
      map: null,
      threeLayer: null,
      groupLayer: null,
      vectorLayer: null,

      highMaterial: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.135440,40.086480],
      zoom: 17,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        subdomains: ["a", "b", "c", "d"],
      }),
      layers: [],
    });
    /**
     * threeLayer
     */
    this.threeLayer = new ThreeLayer("three", {
      identifyCountOnEvent: 1,
      animation: true,
    });
    this.threeLayer.prepareToDraw = (gl, scene, camera) => {
      var light = new THREE.DirectionalLight(0xffffff);
      light.position.set(0, -10, 10).normalize();
      scene.add(light);
      scene.add(new THREE.AmbientLight("#fff", 0.3));
      this.loadTexture();
      this.animation();
    };

    /**
     * groupLayer
     */
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true },
        bloom: {
          //开启泛光
          enable: true,
          threshold: 0,
          factor: 1,
          radius: 0.02,
        },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [this.threeLayer], {
      sceneConfig,
    });
    this.groupLayer.addTo(this.map);
  },

  methods: {
    loadTexture() {
      this.highMaterial = new THREE.MeshBasicMaterial({
        color: "#fff",
        transparent: true,
      });
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load("data/json/bj/path_blue.png", (texture) => {
        texture.needsUpdate = true; //使用贴图时进行更新
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set(0.002, 0.002);
        texture.repeat.set(0.01, 1);
        this.highMaterial.map = texture;
        this.highMaterial.needsUpdate = true;
      });
      this.addPaths();//贴图加载完添加
    },
    addPaths() {
      fetch("data/json/data_HD_LineString.json")
        .then((res) => res.json())
        .then((geojson) => {
          const lines = maptalks.GeoJSON.toGeometry(geojson);
          const paths = lines.map((p) => {
            const path = this.threeLayer.toPath(
              p,
              { width: 6, bloom: true },
              this.highMaterial
            );
            return path;
          });
          console.log(paths, "dingding");
          this.threeLayer.addMesh(paths);
        });
    },
    animation() {
      this.threeLayer._needsUpdate = !this.threeLayer._needsUpdate;
      if (this.threeLayer._needsUpdate) {
        this.threeLayer.redraw();
      }
      if (this.highMaterial.map) {
        this.highMaterial.map.offset.x -= 0.002;//速度
      }
      requestAnimationFrame(() => this.animation());
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
