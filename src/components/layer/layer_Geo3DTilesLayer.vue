<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import { Map, TileLayer } from "maptalks";
import { GroupGLLayer, Geo3DTilesLayer } from "@maptalks/gl-layers";
// 可选的ktx2纹理解析插件
import "@maptalks/transcoders.ktx2";
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
      zoom: 12,
      pitch: 60,
      bearing: -25, //旋转
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [], //最初将添加到地图的图层
    });

    /**
     * Geo3DTiles
     *
     */
    const geo3dTilesLayer = new Geo3DTilesLayer("3dtiles", {
      maxGPUMemory: 512, //最大缓存数，单位 M bytes
      loadingLimitOnInteracting: 1, //地图交互过程中瓦片请求最大数量
      loadingLimit: 0, //瓦片请求最大数量
      offset: [0, 0], //	(坐标纠偏)模型的绘制偏移量，函数的参数为模型的参考坐标： function (center) { }，可以用于计算
      services: [
        {
          url: "data/3dtiles/bim/tileset.json",
          // maximumScreenSpaceError值越小，加载的模型越清晰，但加载的数据量会变大
          // 该值越小，渲染精度越高，项目允许的情况下，该值越大性能越好
          maximumScreenSpaceError: 24.0,
          // 数据请求的额外参数
          // urlParams: 'v=0.0',
          // fetch请求的额外参数
          // fetchOptions : { credentials : 'include' },
          heightOffset: 0, //数据的高度偏移量，单位米，可以用于升高或降低模型
          // 环境光照值，倾斜摄影可以设为[1.0, 1.0, 1.0]获得最清晰的效果，非倾斜摄影可以适当降低，例如设为 [0.2, 0.2, 0.2]
          // 如果不设置，则采用地图上的默认光照值
          ambientLight: [0.2, 0.2, 0.2],
          // maxExtent: maxExtent
          scale:[1,1,1],//3dtile整体的缩放参数
          rotation:[0,0,0],//3dtile整体的旋转参数
          coordOffset:[0,0],//3dtile整体偏移量参数
        },
        // 其他的3dtiles数据源
      ],
    });
    const groupLayer = new GroupGLLayer("group", [geo3dTilesLayer]);
    groupLayer.addTo(this.map);

    geo3dTilesLayer.once("loadtileset", (e) => {
      const extent = geo3dTilesLayer.getExtent(e.index);
      this.map.fitExtent(extent, 0, { animation: false });
    });
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
