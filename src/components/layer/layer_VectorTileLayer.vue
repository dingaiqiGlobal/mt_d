<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import { Map} from "maptalks";
import { GroupGLLayer, VectorTileLayer } from "@maptalks/gl-layers";
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
      //   baseLayer: new TileLayer("tile", {
      //     urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      //     subdomains: ["a", "b", "c", "d"],
      //     attribution:
      //       '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      //   }),
      layers: [], //最初将添加到地图的图层
    });

    /**
     * VectorTileLayer
     * maptalks里有自己的样式系统和mapbox的不兼容的
     * maptalks的样式系统里还包括了材质，PBR等
     */
    const vtLayer = new VectorTileLayer("vt", {
      urlTemplate: "http://tile.maptalks.com/test/planet-single/{z}/{x}/{y}.mvt",
      fetchOptions: null,
      style: "data/styles/maptalks-common/style.json",
      subdomains: null, //subdomains, 用于替换url模板中的 {s}
      tileSize: [512, 512], //瓦片高宽，单位像素
      offset: [0, 0], //瓦片的偏移量Number[]/Function
      //debugTileData: true,//记得生产环境下不要开启改选项,开启后加载切片数据的过程中会在控制台打印每个切片里的数据的
      features: true, //要想获取图形的完整的信息需要把图层的features打开
      schema: false, //瓦片是否返回数据的属性schema
      collision: true, //是否开启点和文字的碰撞检测
      picking: true, //是否允许图层用identify或identifyAtPoint方法查询数据
      pickingPoint: false, //identify或identifyAtPoint方法的查询结果是否返回查询点的三维空间坐标
      pickingGeometry: false, //identify或identifyAtPoint方法的查询结果是否包含Geometry
      iconErrorUrl: null, //icon请求失败后的替换图片url
      collisionFrameLimit: 1.5, //每帧用于计算Collision的时间限制，单位ms
      defaultRendering: true, //是否开启没有style时的默认样式绘制
      textGamma: 1, //文字的Gamma值，可以用于调整文字清晰度
      maxIconSize: 254, //图标最大尺寸限制
      styleScale: 1, //图层图标和文字的整体放大系数
      spatialReference: "preset-vt-3857", //图层的空间参考
      tileSystem: [1, -1, -6378137 * Math.PI, 6378137 * Math.PI], //一个四位数数组，用于描述 TileSystem，TileSystem用于定义瓦片的起始坐标和X/Y轴上的编号规律
      repeatWorld: true, //	在低级别时，整个世界不满一屏时，是否重复显示世界
      crossOrigin: null, //瓦片数据的cross origin
      debug: false, //是否开启调试信息，开启后地图上会绘制瓦片的编号和范围+
      maxCacheSize: 72, //瓦片缓存的最大数量
      zoomOffset: 0, //瓦片zoom级别和地图zoom级别的差值
      errorUrl: null, //瓦片请求失败后的替代链接
      token: null, //用于替换url模板中的{token}，例如 http://foo/bar/{z}/{x}/{y}?token={token}
      attribution: null, //图层版权声明
      minZoom: null,
      maxZoom: null,
      visible:true,
      opacity:1,
      hitDetect:true,
      collisionScope:"layer",
      //maxAvailableZoom: 18,
    });
    const groupLayer = new GroupGLLayer("group", [vtLayer]).addTo(this.map);
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
