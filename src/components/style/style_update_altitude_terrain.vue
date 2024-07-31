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
      groupLayer: null,
      threeLayer: null,

      coordData: [
        {
          id: 1,
          coordinates: [116.13802, 39.99908],
        },
        {
          id: 2,
          coordinates: [116.13253, 40.02249],
        },
        {
          id: 3,
          coordinates: [116.22471, 40.01394],
        },
        {
          id: 4,
          coordinates: [116.10455, 39.98159],
        },
        {
          id: 5,
          coordinates: [116.22351, 40.01256],
        },
      ],
      needUpdateGeos: [],
      cache: new Map(), //键值对
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.17493, 40.00395],
      zoom: 13,
      pitch: 90,
      bearing: 0,
      spatialReference: {
        projection: "EPSG:3857",
      },
      layers: [],
    });
    /**
     * mapbox地形
     */
    const terrain = {
      type: "mapbox",
      tileSize: 256,
      // maxAvailableZoom: 14,
      // zoomOffset: -1,
      // spatialReference: 'preset-vt-3857',
      requireSkuToken: false,
      urlTemplate: `https://{s}.tiles.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=pk.eyJ1Ijoic2tiZXlvbmQiLCJhIjoiY2s5MmU1Y2RiMDR4aTNtcDh0MmgwaHQzcyJ9._tMktptrxVL-QNN5s2plzg`,
      subdomains: ["a", "b", "c", "d"],
      shader: "lit",
      material: {
        baseColorFactor: [1, 1, 1, 1],
        outputSRGB: 1,
        roughnessFactor: 0.69,
        metallicFactor: 0,
      },
    };
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
      //添加立柱
      this.addBars();
      this.addPointLayer();
      this.threeLayer.inited = true; //给three添加属性
      this.animation();
    };
    /**
     * groupLayer
     */
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true }, //抗锯齿
      },
    };
    this.groupLayer = new GroupGLLayer("group", [this.threeLayer], {
      //sceneConfig,
      terrain,
    });
    this.groupLayer.addTo(this.map);
  },

  methods: {
    addBars() {
      const material = new THREE.MeshLambertMaterial({ color: "red" });
      const bars = this.coordData.map((d) => {
        const bar = this.threeLayer.toBar(
          d.coordinates,
          { height: 1000, radius: 100, topColor: "#fff" },
          material
        );
        bar.setId(d.id);
        return bar;
      });
      this.threeLayer.addMesh(bars);
    },
    /**
     * maptalks生态图层里只有VectorTileLayer适配了地形，
     * 图形管理图层(PointLayer,VectorLayer等)并没有适配地形,
     * 那么们使用图形管理图层时需要自己的手动的更新图形(Geometry)的海拔
     */
    addPointLayer() {
      const pointLayer = new maptalks.VectorLayer("layer1", {
        enableAltitude: true,
        zIndex: 1,
      }).addTo(this.map);
      const points = this.coordData.map((d) => {
        const { id, coordinates } = d;
        const point = new maptalks.Marker(coordinates, {});
        point.setId(id);
        return point;
      });
      pointLayer.addGeometry(points);

      //监听地形的tileload并查询哪些图形在这个瓦片内
      //getTerrainLayer()这个api没有暴露出去
      this.groupLayer.getTerrainLayer().on("tileload", (e) => {
        const zoom = this.map.getZoom();
        if (zoom < 10) {
          return;
        }
        //计算当前的瓦片内的点，加入到更新队列
        const { res, extent2d } = e.tile;
        const points = pointLayer.getGeometries();
        points.forEach((point) => {
          const coordinate = point.getCoordinates();
          const glpoint = this.map.coordinateToPointAtRes(coordinate, res); //将坐标转换为指定分辨率的 2D 点
          if (extent2d.contains(glpoint)) {
            //contains包含
            const height = this.groupLayer.queryTerrain(coordinate);
            if (height && Array.isArray(height)) {
              this.needUpdateGeos.push({
                geometry: point,
                height: height[0],
              });
            }
          }
        });
      });
    },
    /**
     * 图形海拔的更新任务我们放到了一个任务队列里，
     * 利用动画函数异步更新,防止tileload触发太频繁导致单位时间内大规模的图形海拔更新， 
     * 图形海拔的更新利用削峰填谷的方法
     * 注意队列的遍历是从后向前的,因为：
     * 同一个图形可能被多次更新,所以我们使用最新的海拔值来更新图形，老的直接舍弃
     * 不管队列多长,更新的数据量只和图形的数量有关，因为队列里可能有一个图形的多个任务,而我们只需要处理最新的任务，老的舍弃
     * 每次更新完直接清空任务队列,当没有任务时直接闲置，真正的按需消费，不浪费性能资源
     */
    animation() {
      this.threeLayer._needsUpdate = !this.threeLayer._needsUpdate;
      if (this.threeLayer._needsUpdate) {
        this.threeLayer.redraw();
      }
      if (this.needUpdateGeos.length && this.threeLayer.inited) {
        for (let len = this.needUpdateGeos.length, i = len - 1; i >= 0; i--) {
          const data = this.needUpdateGeos[i];
          const { geometry, height } = data;
          if (this.cache.has(geometry)) {
            continue;
          }
          const altitude = height;
          geometry.setAltitude(altitude + 1000);
          const id = geometry.getId();
          const bar = this.findBar(id);
          if (bar) {
            bar.setAltitude(altitude);
          }
          this.cache.set(geometry, 1);
        }
        this.cache.clear();
        this.needUpdateGeos = [];
      }
      requestAnimationFrame(() => this.animation());
    },
    findBar(id) {
      const bars = this.threeLayer.getBaseObjects();
      for (let i = 0, len = bars.length; i < len; i++) {
        const bar = bars[i];
        if (bar.getId() === id) {
          return bar;
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
