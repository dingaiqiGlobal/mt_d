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
        lineColor: "#f5ed06", //线的颜色
        lineWidth: 10, //线宽，取值范围 0 - 127
        lineOpacity: 1, //线的透明度，取值范围 0 - 1
        lineJoin: "miter", //线的连接样式，可选的值：miter，round，bevel
        lineCap: "butt", //线头的样式，可选的值：butt，round，square
        lineDx: 50, //线在屏幕坐标x轴上的偏移量，单位像素，取值范围：-128 - 127
        lineDy: 0, //线在屏幕坐标y轴上的偏移量，单位像素，取值范围：-128 - 127
        lineStrokeWidth: 0, //线的描边宽度，取值范围 0 - 127
        lineStrokeColor: "#ffffff", //线的描边的颜色
        // linePatternFile: null, //线的填充图片，支持url或者base64字符串
        // lineJoinPatternMode: 0, //lineJoin处的模型填充方式，为0时，则lineJoin为连续绘制纹理，为1时，则设为图片第一个像素处的颜色
        // linePatternGap: 0, //填充图片之间的间隔宽度，单位为填充图片宽度的倍数，例如设为1时，相邻两张填充图片之间的间隔为填充图片的宽度
        // linePatternAnimSpeed: 0, //动画速度，取值范围-5到5，为负数时，动画方向会变为反向的
        lineDasharray: "20, 20, 20, 20", //线的虚线样式，****四位数组[20, 20, 20, 20]，单位像素,
        lineDashColor: "#ff0000", //线虚线的颜色
        //标注
        textName: "道路", //{name}显示的文字内容，如果要显示某个属性得值，用大括号括起来即可
        textSize: 14, //文字大小
        textFill: "#0900d9", //文字颜色
        textOpacity: 1, //文字透明度，取值范围0-1
        textFaceName: "monospace", //文字字体，与css的font-family定义相同(https://developer.mozilla.org/zh-CN/docs/Web/CSS/font-family)
        textWeight: "normal", //文字字重,与css的font-weight定义相同
        textStyle: "normal", //文字风格，支持斜体等，与cssfont-style定义相同
        textRotation: 360, //文字旋转角度，0-360，单位度
        textDx: 0, //文字在屏幕x轴上的偏移度，单位像素
        textDy: 0, //文字在屏幕y轴上的偏移度，单位像素
        textWrapWidth: 240, //文字换行长度，即文字长度超过该值时就会自动换行
        textHaloFill: "#58e61d", //文字描边颜色
        textHaloRadius: 1, //文字描边半径
        textHaloOpacity: 1, //文字描边透明度，取值范围0-1
        textHorizontalAlignment: "middle", //文字相对坐标点的水平对齐方式，取值范围： left, middle, right
        textVerticalAlignment: "middle", //文字相对坐标点的垂直对齐方式，取值范围： top, middle, bottom
        textPlacement: "line", //****沿线分布还是正常点分布必须为line***
        textSpacing: 25, //textPlacement必须是line。即图标沿线分布时，相互的间隔，单位像素
        // mergeOnProperty: null, //(可选)看文档-textPlacement必须是line。是否按照给定property属性合并该属性的值相同的line
        altitude: 1000, //海拔
      },
    };
  },

  computed: {},

  mounted() {
    this.initGui();
    this.map = new Map("map", {
      center: [116.39259, 39.90473],
      zoom: 15,
      // pitch: 60,
      // bearing: -25,
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
    let {
      //线
      lineColor,
      lineWidth,
      lineOpacity,
      lineJoin,
      lineCap,
      lineDx,
      lineDy,
      lineStrokeWidth,
      lineStrokeColor,
      // linePatternFile,
      // lineJoinPatternMode,
      // linePatternGap,
      // linePatternAnimSpeed,
      lineDasharray,
      lineDashColor,
      //标注
      textName,
      textSize,
      textFill,
      textOpacity,
      textFaceName,
      textWeight,
      textStyle,
      textRotation,
      textDx,
      textDy,
      textWrapWidth,
      textHaloFill,
      textHaloRadius,
      textHaloOpacity,
      textHorizontalAlignment,
      textVerticalAlignment,
      textPlacement,
      textSpacing,
      altitude,
    } = this.lineString;
    lineDasharray = lineDasharray.split(","); //字符串转数组
    let symbol = [
      {
        lineColor,
        lineWidth,
        lineOpacity,
        lineJoin,
        lineCap,
        lineDx,
        lineDy,
        lineStrokeWidth,
        lineStrokeColor,
        // linePatternFile,
        // lineJoinPatternMode,
        // linePatternGap,
        // linePatternAnimSpeed,
        lineDasharray,
        lineDashColor,
        //标注
        textName,
        textSize,
        textFill,
        textOpacity,
        textFaceName,
        textWeight,
        textStyle,
        textRotation,
        textDx,
        textDy,
        textWrapWidth,
        textHaloFill,
        textHaloRadius,
        textHaloOpacity,
        textHorizontalAlignment,
        textVerticalAlignment,
        textPlacement,
        textSpacing,
      },
    ];
    this.lineStringLayer = new LineStringLayer("line0", {});
    this.lineGeometry = new LineString(
      [
        [116.36835, 39.89841, altitude],
        [116.37663, 39.90533, altitude],
        [116.38968, 39.89874, altitude],
        [116.39367, 39.89881, altitude],
        [116.40053, 39.90631, altitude],
        [116.40573, 39.89956, altitude],
      ],
      {
        symbol,
      }
    ).addTo(this.lineStringLayer);
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
      // gui.add(cube,"visible").name("是否显示")
      /**
       * 图形样式
       */
      lineStringGeoSymbol
        .addColor(this.lineString, "lineColor")
        .name("线的颜色")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringGeoSymbol
        .add(this.lineString, "lineWidth")
        .min(0)
        .max(127)
        .name("线宽")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringGeoSymbol
        .add(this.lineString, "lineOpacity")
        .min(0)
        .max(1)
        .name("线的透明度")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringGeoSymbol
        .add(this.lineString, "lineJoin", ["miter", "round", "bevel"])
        .name("线的连接样式")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringGeoSymbol
        .add(this.lineString, "lineCap", ["butt", "round", "square"])
        .name("线头的样式")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringGeoSymbol
        .add(this.lineString, "lineDx")
        .min(-128)
        .max(127)
        .name("X偏移量")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringGeoSymbol
        .add(this.lineString, "lineDy")
        .min(-128)
        .max(127)
        .name("X偏移量")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringGeoSymbol
        .add(this.lineString, "altitude")
        .name("海拔高度")
        .onChange((value) => {
          this.setAltitude(value);
        });
      lineStringGeoSymbol
        .add(this.lineString, "lineStrokeWidth")
        .min(0)
        .max(127)
        .name("描边宽度")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringGeoSymbol
        .addColor(this.lineString, "lineStrokeColor")
        .name("描边颜色")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringGeoSymbol
        .add(this.lineString, "lineDasharray")
        .name("虚线样式")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringGeoSymbol
        .addColor(this.lineString, "lineDashColor")
        .name("虚线的颜色")
        .onChange((value) => {
          this.updateSymbol();
        });

      /**
       * 文字样式
       */
      lineStringTextSymbol
        .add(this.lineString, "textName")
        .name("标注字段")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .add(this.lineString, "textSize")
        .name("文字大小")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .addColor(this.lineString, "textFill")
        .name("文字颜色")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .add(this.lineString, "textOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("文字透明度")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .add(this.lineString, "textFaceName", [
          "serif",
          "sans-serif",
          "monospace",
          "cursive",
          "fantasy",
        ])
        .name("文字字体")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .add(this.lineString, "textWeight", ["normal", "bold", "lighter", "bolder"])
        .name("文字字重")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .add(this.lineString, "textStyle", ["normal", "italic", "oblique"])
        .name("文字风格")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .add(this.lineString, "textRotation")
        .min(0)
        .max(360)
        .step(5)
        .name("文字旋转角度")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .add(this.lineString, "textDx")
        .min(0)
        .max(127)
        .step(1)
        .name("x轴上的偏移量")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .add(this.lineString, "textDy")
        .min(0)
        .max(127)
        .step(1)
        .name("y轴上的偏移量")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .add(this.lineString, "textWrapWidth")
        .name("文字换行长度")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .addColor(this.lineString, "textHaloFill")
        .name("文字描边颜色")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .add(this.lineString, "textHaloRadius")
        .name("文字描边半径")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .add(this.lineString, "textHaloOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("文字描边透明度")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .add(this.lineString, "textHorizontalAlignment", ["left", "middle", "right"])
        .name("水平对齐")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .add(this.lineString, "textVerticalAlignment", ["top", "middle", "bottom"])
        .name("垂直对齐")
        .onChange((value) => {
          this.updateSymbol();
        });
      lineStringTextSymbol
        .add(this.lineString, "textSpacing")
        .name("沿线相互间隔")
        .onChange((value) => {
          this.updateSymbol();
        });
      /**
       * 开启
       */
      lineStringAllSymbol.open();
      lineStringGeoSymbol.close();
      lineStringTextSymbol.close();
    },
    updateSymbol() {
      let {
        //线
        lineColor,
        lineWidth,
        lineOpacity,
        lineJoin,
        lineCap,
        lineDx,
        lineDy,
        lineStrokeWidth,
        lineStrokeColor,
        // linePatternFile,
        // lineJoinPatternMode,
        // linePatternGap,
        // linePatternAnimSpeed,
        lineDasharray,
        lineDashColor,
        //标注
        textName,
        textSize,
        textFill,
        textOpacity,
        textFaceName,
        textWeight,
        textStyle,
        textRotation,
        textDx,
        textDy,
        textWrapWidth,
        textHaloFill,
        textHaloRadius,
        textHaloOpacity,
        textHorizontalAlignment,
        textVerticalAlignment,
        textPlacement,
        textSpacing,
      } = this.lineString;
      lineDasharray = lineDasharray.split(",");
      this.lineGeometry.updateSymbol([
        {
          lineColor,
          lineWidth,
          lineOpacity,
          lineJoin,
          lineCap,
          lineDx,
          lineDy,
          lineStrokeWidth,
          lineStrokeColor,
          // linePatternFile,
          // lineJoinPatternMode,
          // linePatternGap,
          // linePatternAnimSpeed,
          lineDasharray,
          lineDashColor,
          //标注
          textName,
          textSize,
          textFill,
          textOpacity,
          textFaceName,
          textWeight,
          textStyle,
          textRotation,
          textDx,
          textDy,
          textWrapWidth,
          textHaloFill,
          textHaloRadius,
          textHaloOpacity,
          textHorizontalAlignment,
          textVerticalAlignment,
          textPlacement,
          textSpacing,
        },
      ]);
    },
    setAltitude(value) {
      this.lineGeometry.setAltitude(value);
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
