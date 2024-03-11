<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import * as dat from "dat.gui";
import { Map, TileLayer } from "maptalks";
import { GroupGLLayer, GeoJSONVectorTileLayer } from "@maptalks/gl-layers";
export default {
  components: {},

  data() {
    return {
      map: null,
      GeoJSONLayer: null,
      groupLayer: null,
      LineStringSymbol: {
        lineColor: "#f70404", //线的颜色
        lineWidth: 5, //线宽，取值范围 0 - 127
        lineOpacity: 1, //线的透明度，取值范围 0 - 1
        lineJoin: "miter", //线的连接样式，可选的值：miter，round，bevel
        lineCap: "butt", //线头的样式，可选的值：butt，round，square
        lineDx: 50, //线在屏幕坐标x轴上的偏移量，单位像素，取值范围：-128 - 127
        lineDy: 0, //线在屏幕坐标y轴上的偏移量，单位像素，取值范围：-128 - 127
        lineStrokeWidth: 0, //线的描边宽度，取值范围 0 - 127
        lineStrokeColor: "#37f611", //线的描边的颜色
        lineDasharray: "20,20,20,20", //线的虚线样式，****四位数组[20, 20, 20, 20]，单位像素,
        lineDashColor: "#fff", //线虚线的颜色
        lineBloom: false, //泛光
        //标注
        textName: "", //{name}显示的文字内容，如果要显示某个属性得值，用大括号括起来即可
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
        //textPlacement: "line", //***沿线分布，必须写symbol中(可能影响字体与旋转)
        textSpacing: 250, //沿线分布间隔
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
      lights: {
        directional: {
          direction: [1, 0, -1],
          color: [1, 1, 1],
        },
        ambient: {
          resource: {
            prefilterCubeSize: 1024,
          },
          hsv: [0, 0.34, 0],
          orientation: 0,
        },
      },
      baseLayer: new TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });

    let {
      lineColor,
      lineWidth,
      lineOpacity,
      lineJoin,
      lineCap,
      lineDx,
      lineDy,
      lineStrokeWidth,
      lineStrokeColor,
      lineDasharray,
      lineDashColor,
      lineBloom,
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
      textSpacing,
    } = this.LineStringSymbol;
    lineDasharray = lineDasharray.split(",");
    const style = {
      style: [
        {
          name: "line-border",
          renderPlugin: {
            type: "line",
            dataConfig: {
              type: "line",
              only2D: true,
            },
            sceneConfig: {
              depthFunc: "always",
              blendSrc: "one",
            },
          },
          filter: true,
          symbol: {
            lineColor,
            lineWidth,
            lineOpacity,
            lineJoin,
            lineCap,
            lineDx,
            lineDy,
            lineStrokeWidth,
            lineStrokeColor,
            lineDasharray,
            lineDashColor,
            lineBloom,
          },
        },
        {
          name: "line-text",
          renderPlugin: {
            dataConfig: {
              type: "point",
            },
            sceneConfig: {
              collision: true,
              fading: true,
              depthFunc: "always",
            },
            type: "text",
          },
          filter: true,
          symbol: {
            textName: "{NAME}",
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
            textPlacement: "line", //必须写在这里***(可能影响字体与旋转)
            textSpacing,
          },
        },
      ],
    };
    this.GeoJSONLayer = new GeoJSONVectorTileLayer("geojson1", {
      data: "data/json/data_MiYun_LineString.json",
      style,
    });

    this.groupLayer = new GroupGLLayer("group", [this.GeoJSONLayer], {
      sceneConfig: {
        environment: {
          enable: true,
          mode: 1,
          level: 0,
          brightness: 0,
        },
        postProcess: {
          enable: true,
          bloom: {
            enable: true,
            threshold: 0,
            factor: 0.6,
            radius: 1,
          },
        },
      },
    });
    this.groupLayer.addTo(this.map);
    this.GeoJSONLayer.on("dataload", (e) => {
      this.map.fitExtent(e.extent);
    });
  },

  methods: {
    initGui() {
      /**
       * GUI
       */
      this.gui = new dat.GUI();
      this.gui.domElement.style = "position:absolute;top:10px;left:10px";
      const LineStringAllSymbol = this.gui.addFolder("线要素样式");
      const LineStringGeoSymbol = LineStringAllSymbol.addFolder("图形样式");
      const LineStringTextSymbol = LineStringAllSymbol.addFolder("标注样式");
      /**
       * 图形样式
       */
      LineStringGeoSymbol.addColor(this.LineStringSymbol, "lineColor")
        .name("线的颜色")
        .onChange((value) => {
          this.updateLineColor();
        });
      LineStringGeoSymbol.add(this.LineStringSymbol, "lineWidth")
        .min(0)
        .max(127)
        .name("线宽")
        .onChange((value) => {
          this.updateLineWidth();
        });
      LineStringGeoSymbol.add(this.LineStringSymbol, "lineOpacity")
        .min(0)
        .max(1)
        .name("线的透明度")
        .onChange((value) => {
          this.updateLineOpacity();
        });
      LineStringGeoSymbol.add(this.LineStringSymbol, "lineJoin", [
        "miter",
        "round",
        "bevel",
      ])
        .name("线的连接样式")
        .onChange((value) => {
          this.updateLineJoin();
        });
      LineStringGeoSymbol.add(this.LineStringSymbol, "lineCap", [
        "butt",
        "round",
        "square",
      ])
        .name("线头的样式")
        .onChange((value) => {
          this.updateLineCap();
        });
      LineStringGeoSymbol.add(this.LineStringSymbol, "lineDx")
        .min(-128)
        .max(127)
        .name("X偏移量")
        .onChange((value) => {
          this.updateLineDx();
        });
      LineStringGeoSymbol.add(this.LineStringSymbol, "lineDy")
        .min(-128)
        .max(127)
        .name("y偏移量")
        .onChange((value) => {
          this.updateLineDy();
        });
      LineStringGeoSymbol.add(this.LineStringSymbol, "lineStrokeWidth")
        .min(0)
        .max(127)
        .name("描边宽度")
        .onChange((value) => {
          this.updateLineStrokeWidth();
        });
      LineStringGeoSymbol.addColor(this.LineStringSymbol, "lineStrokeColor")
        .name("描边颜色")
        .onChange((value) => {
          this.updateLineStrokeColor();
        });
      LineStringGeoSymbol.add(this.LineStringSymbol, "lineDasharray")
        .name("虚线样式")
        .onChange((value) => {
          this.updateLineDasharray();
        });
      LineStringGeoSymbol.addColor(this.LineStringSymbol, "lineDashColor")
        .name("虚线的颜色")
        .onChange((value) => {
          this.updateLineDashColor();
        });
      LineStringGeoSymbol.add(this.LineStringSymbol, "lineBloom")
        .name("泛光")
        .onChange((value) => {
          this.updateLineBloom();
        });
      /**
       * 文字样式
       */
      LineStringTextSymbol.add(this.LineStringSymbol, "textName")
        .name("标注字段")
        .onChange((value) => {
          this.updateTextName();
        });
      LineStringTextSymbol.add(this.LineStringSymbol, "textSize")
        .name("文字大小")
        .onChange((value) => {
          this.updateTextSize();
        });
      LineStringTextSymbol.addColor(this.LineStringSymbol, "textFill")
        .name("文字颜色")
        .onChange((value) => {
          this.updateTextFill();
        });
      LineStringTextSymbol.add(this.LineStringSymbol, "textOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("文字透明度")
        .onChange((value) => {
          this.updateTextOpacity();
        });
      LineStringTextSymbol.add(this.LineStringSymbol, "textFaceName", [
        "serif",
        "sans-serif",
        "monospace",
        "cursive",
        "fantasy",
      ])
        .name("文字字体")
        .onChange((value) => {
          this.updateTextFaceName();
        });
      LineStringTextSymbol.add(this.LineStringSymbol, "textWeight", [
        "normal",
        "bold",
        "lighter",
        "bolder",
      ])
        .name("文字字重")
        .onChange((value) => {
          this.updateTextWeight();
        });
      LineStringTextSymbol.add(this.LineStringSymbol, "textStyle", [
        "normal",
        "italic",
        "oblique",
      ])
        .name("文字风格")
        .onChange((value) => {
          this.updateTextStyle();
        });
      LineStringTextSymbol.add(this.LineStringSymbol, "textRotation")
        .min(0)
        .max(360)
        .step(5)
        .name("文字旋转角度")
        .onChange((value) => {
          this.updateTextRotation();
        });
      LineStringTextSymbol.add(this.LineStringSymbol, "textDx")
        .min(0)
        .max(127)
        .step(1)
        .name("x轴上的偏移量")
        .onChange((value) => {
          this.updateTextDx();
        });
      LineStringTextSymbol.add(this.LineStringSymbol, "textDy")
        .min(0)
        .max(127)
        .step(1)
        .name("y轴上的偏移量")
        .onChange((value) => {
          this.updateTextDy();
        });
      LineStringTextSymbol.add(this.LineStringSymbol, "textWrapWidth")
        .name("文字换行长度")
        .onChange((value) => {
          this.updateTextWrapWidth();
        });
      LineStringTextSymbol.addColor(this.LineStringSymbol, "textHaloFill")
        .name("文字描边颜色")
        .onChange((value) => {
          this.updateTextHaloFill();
        });
      LineStringTextSymbol.add(this.LineStringSymbol, "textHaloRadius")
        .name("文字描边半径")
        .onChange((value) => {
          this.updateTextHaloRadius();
        });
      LineStringTextSymbol.add(this.LineStringSymbol, "textHaloOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("文字描边透明度")
        .onChange((value) => {
          this.updateTextHaloOpacity();
        });
      LineStringTextSymbol.add(this.LineStringSymbol, "textHorizontalAlignment", [
        "left",
        "middle",
        "right",
      ])
        .name("水平对齐")
        .onChange((value) => {
          this.updateTextHorizontalAlignment();
        });
      LineStringTextSymbol.add(this.LineStringSymbol, "textVerticalAlignment", [
        "top",
        "middle",
        "bottom",
      ])
        .name("垂直对齐")
        .onChange((value) => {
          this.updateTextVerticalAlignment();
        });

      /**
       * 开启
       */
      LineStringAllSymbol.open();
      LineStringGeoSymbol.close();
      LineStringTextSymbol.close();
    },
    /**
     * 更新样式不选择setStyle
     * updateSymbol 用于图层样式的局部更新，相比 setStyle 性能更高，
     * 且除了部分需重构 Mesh 的属性一般不会造成图层刷新闪烁
     */
    updateLineColor() {
      let { lineColor } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-border", {
        lineColor,
      });
    },
    updateLineWidth() {
      let { lineWidth } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-border", {
        lineWidth,
      });
    },
    updateLineOpacity() {
      let { lineOpacity } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-border", {
        lineOpacity,
      });
    },
    updateLineJoin() {
      let { lineJoin } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-border", {
        lineJoin,
      });
    },
    updateLineCap() {
      let { lineCap } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-border", {
        lineCap,
      });
    },
    updateLineDx() {
      let { lineDx } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-border", {
        lineDx,
      });
    },
    updateLineDy() {
      let { lineDy } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-border", {
        lineDy,
      });
    },
    updateLineStrokeWidth() {
      let { lineStrokeWidth } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-border", {
        lineStrokeWidth,
      });
    },
    updateLineStrokeColor() {
      let { lineStrokeColor } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-border", {
        lineStrokeColor,
      });
    },
    updateLineDasharray() {
      let { lineDasharray } = this.LineStringSymbol;
      lineDasharray = lineDasharray.split(",");
      this.GeoJSONLayer.updateSymbol("line-border", {
        lineDasharray,
      });
    },
    updateLineDashColor() {
      let { lineDashColor } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-border", {
        lineDashColor,
      });
    },
    updateLineBloom() {
      let { lineBloom } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-border", {
        lineBloom,
      });
    },
    updateTextName() {
      let { textName } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textName,
      });
    },
    updateTextSize() {
      let { textSize } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textSize,
      });
    },
    updateTextFill() {
      let { textFill } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textFill,
      });
    },
    updateTextOpacity() {
      let { textOpacity } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textOpacity,
      });
    },
    updateTextFaceName() {
      let { textFaceName } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textFaceName,
      });
    },
    updateTextWeight() {
      let { textWeight } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textWeight,
      });
    },
    updateTextStyle() {
      let { textStyle } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textStyle,
      });
    },
    updateTextRotation() {
      let { textRotation } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textRotation,
      });
    },
    updateTextDx() {
      let { textDx } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textDx,
      });
    },
    updateTextDy() {
      let { textDy } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textDy,
      });
    },
    updateTextWrapWidth() {
      let { textWrapWidth } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textWrapWidth,
      });
    },
    updateTextHaloFill() {
      let { textHaloFill } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textHaloFill,
      });
    },
    updateTextHaloRadius() {
      let { textHaloRadius } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textHaloRadius,
      });
    },
    updateTextHaloOpacity() {
      let { textHaloOpacity } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textHaloOpacity,
      });
    },
    updateTextHorizontalAlignment() {
      let { textHorizontalAlignment } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textHorizontalAlignment,
      });
    },
    updateTextVerticalAlignment() {
      let { textVerticalAlignment } = this.LineStringSymbol;
      this.GeoJSONLayer.updateSymbol("line-text", {
        textVerticalAlignment,
      });
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
