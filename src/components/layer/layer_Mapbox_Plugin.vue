<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button @click="addMapboxOnlineLayer">地图在线</button>
      <hr />
      <button @click="addMapboxCustomLayer">地图自定义</button>
    </div>
  </div>
</template>

<script>
import * as maptalks from "maptalks";
import "maptalks/dist/maptalks.css";
import { GroupGLLayer, VectorTileLayer } from "@maptalks/gl-layers";
import mapboxgl from "mapbox-gl";
import { MapboxglLayer } from "maptalks.mapboxgl/dist/maptalks.mapboxgl.js";

/**
 * cnpm install mapbox-gl --save   必须安装
 * cnpm install maptalks.mapboxgl --save    依赖mapbox
 *
 */

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
      center: [116.41439, 39.91671],
      zoom: 8,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      // baseLayer: new maptalks.TileLayer("tile", {
      //   urlTemplate:
      //     "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      // }),
      layers: [],
    });
    /**
     * groupLayer
     */
    const sceneConfig = {
    };
    this.groupLayer = new GroupGLLayer("group", [], {
      sceneConfig,
    });
    this.groupLayer.addTo(this.map);

    this.addWMSLayer()
  },

  methods: {
    addMapboxOnlineLayer() {
      mapboxgl.accessToken =
        "pk.eyJ1Ijoic2tiZXlvbmQiLCJhIjoiY2s5MmU1Y2RiMDR4aTNtcDh0MmgwaHQzcyJ9._tMktptrxVL-QNN5s2plzg";
      let mapboxglLayer = new MapboxglLayer("mapboxLayer1", {
        glOptions: {
          style: "mapbox://styles/mapbox/light-v9",
        },
      }).addTo(this.map);
    },
    addMapboxCustomLayer() {
      mapboxgl.accessToken =
        "pk.eyJ1Ijoic2tiZXlvbmQiLCJhIjoiY2s5MmU1Y2RiMDR4aTNtcDh0MmgwaHQzcyJ9._tMktptrxVL-QNN5s2plzg";
      let mapboxglLayer = new MapboxglLayer("mapboxLayer2", {
        glOptions: {
          style: "http://192.168.201.166:8080/style/dongcheng/default_blue/style.json",
        },
      }).addTo(this.map);
    },
    addWMSLayer() {
      const wmsTileLayer = new maptalks.WMSTileLayer("wms", {
        service: "WMS",
        layers: "zhjy:HDJD",
        styles: "",
        format: "image/png",
        transparent: true, //要使用的WMS服务的版本
        version: "1.3.0",
        crs: "EPSG:3857",
        uppercase: true, //如果为“true”，则WMS请求参数键将为大写
        detectRetina: false, //将请求四个指定大小一半的瓦片和更大的缩放级别来代替一个，以利用高分辨率
        urlTemplate: "http://192.168.201.162:8088/geoserver/wms",
        subdomains: null, //要替换urlTemplate中的“｛s｝”的子域
        spatialReference: null,
        tileSize: [256, 256],
        offset: [0, 0], //整体瓦片偏移[dx，dy]，适用于来自差分坐标系的瓦片源，例如（wgs84和gcj02
        tileSystem: [1, -1, -180, 90],
        maxAvailableZoom: 20, //可用平铺的最大缩放级别。当以更高的缩放级别显示地图时，将使用来自最大可用缩放的分幅的数据
        repeatWorld: true, //瓦片将在世界之外重复加载
        background: true, //是在交互过程中还是交互后绘制背景，默认为true
        placeholder: false, //占位符图像替换加载平铺，可以是一个带有平铺画布参数的函数
        fragmentShader: null, //自定义片段着色器
        crossOrigin: null, //起点
        fadeAnimation: true, //加载平铺时淡入动画
        fadeDuration: 167, //淡入动画持续时间（毫秒），默认值为167（10帧）
        debug: false, //如果设置为true，平铺将具有边框及其坐标的标题
        renderer: "gl", //canvas或gl
        maxCacheSize: 256, //要缓存的最大瓦片数量
        cascadeTiles: true, //绘制不同缩放比例的级联平铺以减少平铺
        zoomOffset: 0, //从地图缩放到平铺缩放的偏移
        tileRetryCount: 0, //瓦片的重试计数
        errorUrl: null, //加载平铺图像时遇到错误时要替换的图像
        customTags: null, //urlTemplate中的自定义标记值，例如的{ foo: 'bar' } http://path/to/{z}/{x}/{y}?foo={foo}
        decodeImageInWorker: false, //在worker中解码图像，以便在服务器支持的情况下获得更好的性能
        token: null, //用于替换模板中｛token｝的令牌http://foo/bar/{z}/{x}/{y}?token={token}
        //fetchOptions:,//fetch参数，如fetchOptions:{“headers”：{“accept”：“”｝｝
        awareOfTerrain: true, //如果瓦片层知道地形
        bufferPixel: 0.5, //瓦片缓冲区大小，单位为像素
        depthMask: true, //深度遮罩
        attribution: null, //指定其他属性
        minZoom: null, //显示图层的最小缩放，设置为-1可取消限制
        maxZoom: null, //显示层的最大缩放，设置为-1可取消限制
        visible: true, //是否显示图层
        opacity: 1,
        zIndex: 1,
        hitDetect: true, //是否为此地图上的光标样式启用图层命中检测，禁用它以提高性能
        globalCompositeOperation: null, //（仅适用于使用CanvasRenderer渲染的层）层的画布2d上下文的全局合成操作
        debugOutline: "#0f0", //debug线颜色
        cssFilter: null, //css过滤器应用于canvas上下文的过滤器
        forceRenderOnMoving: false, //贴图移动时渲染层的力
        forceRenderOnZooming: false, //贴图缩放时渲染层的力
        forceRenderOnRotating: false, //贴图旋转时渲染层的力
        collisionScope: "layer", //层的碰撞范围：layer或map
      }).addTo(this.map);
      /**
       * 瓦片请求是简单的image get请求，
       * 因为浏览器缓存策略的问题，
       * 如果瓦片地址一样，会触发浏览器缓存策略,
       * 导致前端并没有真实的再次去请求后台的瓦片,
       * 导致显示的瓦片还是上一次的请求的结果，
       * 这时就需要我们手动的绕过 浏览器缓存策略
       */
      // wmsTileLayer.getTileUrl = function (x, y, z) {
      //   let url = maptalks.WMSTileLayer.prototype.getTileUrl.call(this, x, y, z);
      //   url += `&t=${new Date().getTime()}`;
      //   return url;
      // };
      /**
       * 由于业务的需要WMSTileLayer的数据可能是动态，
       * 业务里期望隔一段时间就去更新WMSTileLayerr的内容,
       * 这时就需要去强制刷新WMSTileLayer
       */
      //wmsLayer.forceReload();
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
