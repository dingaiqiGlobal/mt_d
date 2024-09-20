<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import { Map, TileLayer } from "maptalks";
import { GroupGLLayer, Geo3DTilesLayer } from "@maptalks/gl-layers";
import "@maptalks/transcoders.draco";
// import "@maptalks/transcoders.crn";
// import "@maptalks/transcoders.ktx2";
export default {
  components: {},

  data() {
    return {
      map: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new Map("map", {
      center: [116.39259, 39.90473],
      zoom: 15,
      pitch: 60,
      bearing: -25,
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
              front: "images/skybox/gradient/front.png",
              back: "images/skybox/gradient/back.png",
              left: "images/skybox/gradient/left.png",
              right: "images/skybox/gradient/right.png",
              top: "images/skybox/gradient/top.png",
              bottom: "images/skybox/gradient/bottom.png",
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
     * 底图
     */
    const baseLayer = new TileLayer("tile", {
      urlTemplate:
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    });
    /**
     * 3dtiles
     */
    const geo3DTilesLayer = new Geo3DTilesLayer("Geo3DTilesLayer", {
      geometryEvents: true,
      services: [],
    });
    //services-1
    geo3DTilesLayer.addService({
      url: "data/3dtiles/bim/tileset.json",
      maximumScreenSpaceError: 16,
      ambientLight: [0.2, 0.2, 0.2],
      heightOffset: 8,
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      coordOffset: [0, 0],
    });
    //services-2
    geo3DTilesLayer.addService({
      url: "data/3dtiles/BuildingBlue/tileset.json",
      maximumScreenSpaceError: 16,
      ambientLight: [0.2, 0.2, 0.2],
      heightOffset: 8,
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      coordOffset: [0, 0],
    });
    /**
     * groupLayer
     */
    const groupLayer = new GroupGLLayer("group", [geo3DTilesLayer, baseLayer], {
      sceneConfig: {
        environment: {
          enable: true, // 是否开启环境天空盒绘制
          mode: 1, // 天空盒模式： 0: 氛围模式， 1: 实景模式
          level: 0, // 实景模式下的模糊级别，0-3
          brightness: 1, // 天空盒的明亮度，-1 - 1， 默认为0
        },
        postProcess: {
          enable: true, // 是否开启后处理
          antialias: {
            //开启抗锯齿后处理
            enable: true,
          },
        },
      },
    });
    groupLayer.addTo(this.map);

    console.log(geo3DTilesLayer.options.services)

    /**
     * 一些Geo3DTilesLayer的方法
     *  showService(idx:number):this;---显示
        hideService(idx: number):this;---隐藏
        setToRedraw(): this;---重绘
        addService(info:Geo3DTilesService):this;---添加
        updateService(idx: number,info: Geo3DTilesServiceOptions): this;---修改
        removeService(idx: number):this;---移除
        getTileUrl(url: string, rootNode: RootTileNode): string;
        getExtent(index:number):maptalks.Extentnull;
        boundingVolumeToExtent(node: RootTileNode): maptalks.Extent null,
        getRootTiles(): RootTileNode[];
        getTiles(): QueriedTiles;
        onTileLoad(tile:TileNode, node: TileNode): void;
        onTilesetLoad(tileset: any, parent: TileNode, url: string): void;
        _isVisible(node: TileNode, maxExtent: maptalks.Extent, projectionView: number[]
     */
  },

  methods: {},
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
