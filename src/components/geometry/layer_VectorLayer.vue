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
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
      pitch: 30,
      centerCross: false,
      doubleClickZoom: false,
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
    });

    this.addVectorLayer();
  },

  methods: {
    addVectorLayer() {
      const layer = new maptalks.VectorLayer("layer", {
        style: null, //总style
        debug: false,
        enableSimplify: true, //启用简化几何图形
        cursor: "pointer", //图层的光标样式
        geometryEvents: true, //启用几何体事件
        defaultIconSize: [20, 20], //标记图标的默认大小
        enableAltitude: true, //支持海拔(常用)
        //altitudeProperty:,//几何体的高度属性名称，如果enableAltitude为true，则默认为“高度”
        drawAltitude: false, //绘制垂直线
        sortByDistanceToCamera: false, //标记按相机距离排序
        roundPoint: false, //绘制前进行圆角以提高性能，但会导致动画中的几何体抖动
        altitude: 0, //海拔
        collision: false, //启用碰撞
        collisionBufferSize: 2, //碰撞缓存大小
        collisionDelay: 250, //碰撞延迟
        collisionScope: "layer", //碰撞范围：layer或map
        progressiveRende: false, //渐进渲染
        progressiveRenderCount: 1000, //渐进渲染页面大小
        progressiveRenderDebug: false,
        drawImmediate: false,
        geometryEventTolerance: 1, //几何图形事件的公差
        attribution: null, //指定其他属性
        minZoom: null, //显示图层的最小缩放，设置为-1可取消限制
        maxZoom: null, //显示层的最大缩放，设置为-1可取消限制
        visible: true, //是否显示图层
        opacity: 1,
        zIndex: 1,
        hitDetect: true, //是否为此地图上的光标样式启用图层命中检测，禁用它以提高性能
        renderer: "canvas", //渲染器类型
        globalCompositeOperation: null, //（仅适用于使用CanvasRenderer渲染的层）层的画布2d上下文的全局合成操作。
        debugOutline: "#0f0", //debug线颜色
        cssFilter: null, //css过滤器应用于canvas上下文的过滤器
        forceRenderOnMoving: false, //贴图移动时渲染层的力
        forceRenderOnZooming: false, //贴图缩放时渲染层的力
        forceRenderOnRotating: false, //贴图旋转时渲染层的力
      }).addTo(this.map);

      /**
       * 点
       */
      const center = this.map.getCenter().toArray();
      center.push(44);
      const point = new maptalks.Marker(center, {
        id: "marker0",
        visible: true, //（常用）
        editable: true, 
        interactive: true, //几何体是否可以相互作用
        cursor: null, //悬停样式
        measure: "EPSG:4326", //几何图形的度量代码，定义了measureGeometry如何进行测量
        draggable: false, //是否拖动几何体
        dragShadow: true, //如果为true，则在拖动几何体的过程中，将在移动几何体之前拖动阴影
        dragOnAxis: null, //如果设置，则只能沿指定的轴拖动几何体，可能的值为：x、y
        //zIndex:,
        antiMeridian: false, //反子午线
        symbol: {//（常用）
          markerFile: "images/icon/icon_Red.png",
          markerWidth: 20,
          markerHeight: 25,
        },
        properties: {//（常用）
          foo: "value",
        },
      });
      point.addTo(layer);
      /**
       * 线
       */
      const coordinates = [
        [116.35174, 39.89683, 33],
        [116.42967, 39.89788, 5000],
      ];
      const line = new maptalks.LineString(coordinates, {
        arrowStyle: null, //箭头的样式，可以是预定义的值或数组[箭头宽度，箭头高度]（数组中的值是线宽的倍数），可能的预定义值：classic ([3, 4])
        arrowPlacement: "vertex-last", //箭头的位置：vertex-first, vertex-last, vertex-firstlast, point
        smoothness: 0, //通过四阶贝塞尔插值进行线条平滑，默认为0
        enableSimplify: true, //启用简化
        simplifyTolerance: 2, //简化公差
        enableClip: true,
        symbol: {//（常用）
          lineWidth: 3,
          lineColor: "red",
        },
        id: "line0",
        visible: true,//（常用）
        editable: true,
        interactive: true, //几何体是否可以相互作用
        cursor: null, //悬停样式
        measure: "EPSG:4326", //几何图形的度量代码，定义了measureGeometry如何进行测量
        draggable: false, //是否拖动几何体
        dragShadow: true, //如果为true，则在拖动几何体的过程中，将在移动几何体之前拖动阴影
        dragOnAxis: null, //如果设置，则只能沿指定的轴拖动几何体，可能的值为：x、y
        //zIndex:,
        antiMeridian: false, //反子午线
      });
      line.addTo(layer);
      /**
       * 面
       */
      const coordinatesPolygon = [
        [
          [116.3856, 39.92122, 10],
          [116.3859, 39.91148, 10],
          [116.39628, 39.91178, 10],
          [116.39577, 39.92168, 10],
          [116.3856, 39.92122, 10],
        ],
      ];
      const polygon = new maptalks.Polygon(coordinatesPolygon, {
        smoothness: 0, //通过四阶贝塞尔插值进行线条平滑，默认为0
        enableSimplify: true, //启用简化
        simplifyTolerance: 2, //简化公差
        enableClip: true,
        symbol: {//（常用）
          lineColor: "#34495e",
          lineWidth: 2,
          polygonFill: "rgb(135,196,240)",
          polygonOpacity: 0.6,
        },
        id: "polygon0",
        visible: true,//（常用）
        editable: true,
        interactive: true, //几何体是否可以相互作用
        cursor: null, //悬停样式
        measure: "EPSG:4326", //几何图形的度量代码，定义了measureGeometry如何进行测量
        draggable: false, //是否拖动几何体
        dragShadow: true, //如果为true，则在拖动几何体的过程中，将在移动几何体之前拖动阴影
        dragOnAxis: null, //如果设置，则只能沿指定的轴拖动几何体，可能的值为：x、y
        //zIndex:,
        antiMeridian: false, //反子午线
      }).addTo(layer);
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
