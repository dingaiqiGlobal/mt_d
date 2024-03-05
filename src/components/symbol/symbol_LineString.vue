<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import * as dat from "dat.gui";
import { Map, TileLayer, LineString } from "maptalks";
import { GroupGLLayer, LineStringLayer } from "@maptalks/gl-layers";
export default {
  components: {},

  data() {
    return {
      map: null,
      lineStringLayer: null,
      lineGeometry: null,
      groupLayer: null,
      gui: null,
      lineString: {
        lineColor:"#000",//线的颜色
        lineWidth:2,//线宽，取值范围 0 - 127
        lineOpacity:1,//线的透明度，取值范围 0 - 1
        lineJoin:"miter",//线的连接样式，可选的值：miter，round，bevel
        lineCap:"butt",//线头的样式，可选的值：butt，round，square
        lineDx:0,//线在屏幕坐标x轴上的偏移量，单位像素，取值范围：-128 - 127
        lineDy:0,//线在屏幕坐标y轴上的偏移量，单位像素，取值范围：-128 - 127
        lineStrokeWidth:0,//线的描边宽度，取值范围 0 - 127
        lineStrokeColor:"#000",//线的描边的颜色
        linePatternFile:null,//线的填充图片，支持url或者base64字符串
        lineJoinPatternMode:0,//lineJoin处的模型填充方式，为0时，则lineJoin为连续绘制纹理，为1时，则设为图片第一个像素处的颜色
        linePatternGap:0,//填充图片之间的间隔宽度，单位为填充图片宽度的倍数，例如设为1时，相邻两张填充图片之间的间隔为填充图片的宽度
        linePatternAnimSpeed:0,//动画速度，取值范围-5到5，为负数时，动画方向会变为反向的
        lineDasharray:[0,0,0,0],//线的虚线样式，四位数组，单位像素
        lineDashColor:"#ccc",//线虚线的颜色
        /**
         * 同点
         */
        textName: "天安门", //{name}显示的文字内容，如果要显示某个属性得值，用大括号括起来即可
        textSize: 14, //文字大小
        textFill: "#0900d9", //文字颜色
        textOpacity: 1, //文字透明度，取值范围0-1
        textFaceName: "monospace", //文字字体，与css的font-family定义相同(https://developer.mozilla.org/zh-CN/docs/Web/CSS/font-family)
        textWeight: "normal", //文字字重,与css的font-weight定义相同
        textStyle: "normal", //文字风格，支持斜体等，与cssfont-style定义相同
        textRotation: 360, //文字旋转角度，0-360，单位度
        textDx: 0, //文字在屏幕x轴上的偏移度，单位像素
        textDy: 24, //文字在屏幕y轴上的偏移度，单位像素
        textWrapWidth: 240, //文字换行长度，即文字长度超过该值时就会自动换行
        textHaloFill: "#58e61d", //文字描边颜色
        textHaloRadius: 1, //文字描边半径
        textHaloOpacity: 1, //文字描边透明度，取值范围0-1
        textHorizontalAlignment: "middle", //文字相对坐标点的水平对齐方式，取值范围： left, middle, right
        textVerticalAlignment: "middle", //文字相对坐标点的垂直对齐方式，取值范围： top, middle, bottom
      },
    };
  },

  computed: {},

  mounted() {
    this.initGui();
    this.map = new Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });

    /**
     * LineStringLayer
     */
    this.lineStringLayer = new LineStringLayer("line0", {});
    this.lineGeometry = new LineString([
      [116.35036, 39.90552, 0],
      [116.43002, 39.90644, 0],
    ]).addTo(this.lineStringLayer);
    /**
     * GroupGLLayer
     */
    this.groupLayer = new GroupGLLayer("group", [this.lineStringLayer], {
      sceneConfig: {
        environment: {
          enable: true,
          mode: 1,
          level: 0,
          brightness: 0,
        },
      },
    });
    this.groupLayer.addTo(this.map);
  },

  methods: {
    initGui() {
      /**
       * GUI
       */
      this.gui = new dat.GUI();
      this.gui.domElement.style = "position:absolute;top:10px;left:10px";
      const lineStringAllSymbol = this.gui.addFolder("线要素样式");
      const lineStringGeoSymbol = lineStringAllSymbol.addFolder("图形样式");
      const lineStringTextSymbol = lineStringAllSymbol.addFolder("标注样式");
      /**
       * 图形样式
       */

      /**
       * 文字样式
       */
     

      /**
       * 开启
       */
      lineStringAllSymbol.open();
      lineStringGeoSymbol.open();
      lineStringTextSymbol.open();
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
