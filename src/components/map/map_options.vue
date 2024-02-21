<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import * as maptalks from "maptalks";
export default {
  components: {},

  data() {
    return {
      map: null,
    };
  },

  computed: {},

  mounted() {
    /**
     * 读取配置属性的值
     * const centerCross = map.options.centerCross;
     * 修改地图配置信息,可以使用config方法
     * map.config({ centerCross: true });
     */
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
      pitch: 60,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [], //最初将添加到地图的图层

      centerCross: true, //在地图中心显示红十字
      seamlessZoom: true, //是否使用无缝缩放模式
      zoomInCenter: true, //缩放时是否固定在中心
      zoomOrigin: [400, 300], //缩放容器点中的原点，例如[400,300]
      zoomAnimation: true, //启用缩放动画
      zoomAnimationDuration: 330, //缩放动画持续时间
      panAnimation: true, //拖动或触摸结束时继续设置平移动画
      panAnimationDuration: 600, //平移动画持续时间
      rotateAnimation: true, //拖动或触摸旋转结束时继续设置旋转动画
      rotateAnimationDuration: 800, //旋转动画持续时间
      zoomable: true, //启用地图缩放
      enableInfoWindow: true, //启用信息窗口
      hitDetect: true, //是否启用此地图上光标样式图层的命中检测，禁用它以提高性能
      hitDetectLimit: 5, //执行命中检测的最大层数
      fpsOnInteracting: 25, //fps当贴图正在交互时，当fps较低时，一些慢速层将不会在交互时绘制。设置为0可禁用它
      layerCanvasLimitOnInteracting: -1, //交互时在地图上绘制的图层画布的限制，设置它可以提高性能
      maxZoom: 24, //最大缩放
      minZoom: 0, //最小缩放
      maxExtent: {
        xmax: 116.7,
        xmin: 116.8,
        ymax: 40.3,
        ymin: 40.1,
      }, //当设置了maxExtent时，映射将被限制为给定的最大范围，并在用户试图平移范围时反弹
      fixCenterOnResize: true, //调整地图大小时是否固定地图中心
      maxPitch: 80, //最大pitch
      maxVisualPitch: 70, //视觉上的最大pitch
      viewHistory: true, //记录视图历史记录
      viewHistoryCount: 10, //查看历史记录的计数
      draggable: true, //启用拖动
      dragPan: true, //启用拖动平移
      dragRotate: true, //右键单击或ctrl+左键单击拖动贴图进行旋转
      dragPitch: true, //右键单击或ctrl+左键单击将贴图拖动到pitch
      dragRotatePitch: true, //同时俯仰和旋转
      switchDragButton: false, //切换使用左键单击旋转地图，右键单击移动地图
      touchGesture: true,
      touchZoom: true,
      touchRotate: true,
      touchPitch: true,
      touchZoomRotate: false,
      doubleClickZoom: true, //启用双击缩放
      scrollWheelZoom: true, //启用滚动滚轮缩放
      geometryEvents: true, //启用激发几何体事件
      clickTimeThreshold: 280, //mousedown和mouseup之间的时间阈值，用于确定是否为点击事件
      control: true, //允许map添加控件
      attribution: true, //是否在地图上显示属性控件。显示maptalks信息.如果对象，则可以指定位置或基本内容，也可以同时指定两者
      zoomControl: true, //显示缩放控件
      scaleControl: true, //显示比例尺控件
      overviewControl: true, //显示鹰眼图控件
      fog: true, //开启远处画雾
      fogColor: [0, 233, 233],
      renderer: "canvas", //渲染类型
      devicePixelRatio: "", //覆盖设备默认像素的设备像素比率
      heightFactor: 1, //高度/海拔计算的因素，这会影响所有层的高度计算（vectortilayer/gllayer/three-layer/3dtielayer）
      cameraInfiniteFar: false, //将摄影机远平面增加到无穷大。启用此选项可能会降低贴图的性能
      stopRenderOnOffscreen: true, //容器在屏幕外时是否停止贴图渲染
      originLatitudeForAltitude: 40, //海拔高度的原点纬度
      mousemoveThrottleTime: 48, //鼠标事件间隔时间
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
