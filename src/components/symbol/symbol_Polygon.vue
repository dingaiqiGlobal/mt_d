<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import * as dat from "dat.gui";
import { Map, TileLayer, Polygon } from "maptalks";
import { GroupGLLayer, PolygonLayer } from "@maptalks/gl-layers";
export default {
  components: {},

  data() {
    return {
      map: null,
      PolygonLayer: null,
      PolygonGeometry: null,
      groupLayer: null,
      gui: null,
      Polygon: {
        polygonFill: "#00ffea", //面的填充色
        polygonOpacity: 0.5, //透明度,取值范围 0 - 1
        //polygonPatternFile:null,//填充图片，支持url或者base64字符串
        //uvScale:[1,1],//纹理的缩放倍数，两位数组
        //uvOffset:[0,1],//两位数组，纹理的偏移量，0表示不偏移，1表示偏移量等于图片的尺寸，例如0.5表示偏移到图片的一半
        lineColor: "#f5ed06", //线的颜色
        lineWidth: 10, //线宽，取值范围 0 - 127
        lineOpacity: 1, //线的透明度，取值范围 0 - 1
        lineStrokeWidth: 0, //线的描边宽度，取值范围 0 - 127
        lineStrokeColor: "#37f611", //线的描边的颜色
        lineDasharray: "20, 20, 20, 20", //线的虚线样式，****四位数组[20, 20, 20, 20]，单位像素,
        lineDashColor: "#ff0000", //线虚线的颜色
        //标注
        textName: "标注面", //{name}显示的文字内容，如果要显示某个属性得值，用大括号括起来即可
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
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });

    /**
     * Polygon
     */
    let {
      polygonFill,
      polygonOpacity,
      lineColor,
      lineWidth,
      lineOpacity,
      lineStrokeWidth,
      lineStrokeColor,
      lineDasharray,
      lineDashColor,
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
    } = this.Polygon;
    lineDasharray = lineDasharray.split(",");
    let symbol = [
      {
        polygonFill,
        polygonOpacity,
        lineColor,
        lineWidth,
        lineOpacity,
        lineStrokeWidth,
        lineStrokeColor,
        lineDasharray,
        lineDashColor,
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
      },
    ];
    this.PolygonLayer = new PolygonLayer("Polygon0", {});
    this.PolygonGeometry = new Polygon(
      [
        [
          [116.3856, 39.92122, 10],
          [116.3859, 39.91148, 10],
          [116.39628, 39.91178, 10],
          [116.39577, 39.92168, 10],
          [116.3856, 39.92122, 10],
        ],
      ],
      { symbol }
    ).addTo(this.PolygonLayer);
    /**
     * GroupGLLayer
     */
    this.groupLayer = new GroupGLLayer("group", [this.PolygonLayer], {
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
      const PolygonAllSymbol = this.gui.addFolder("面要素样式");
      const PolygonGeoSymbol = PolygonAllSymbol.addFolder("图形样式");
      const PolygonTextSymbol = PolygonAllSymbol.addFolder("标注样式");
      // gui.add(cube,"visible").name("是否显示")
      /**
       * 图形样式
       */
      PolygonGeoSymbol.addColor(this.Polygon, "polygonFill")
        .name("填充颜色")
        .onChange((value) => {
          this.updateSymbol();
        });

      PolygonGeoSymbol.add(this.Polygon, "polygonOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("填充透明度")
        .onChange((value) => {
          this.updateSymbol();
        });
      /**
       * 边框样式
       */
      PolygonGeoSymbol.addColor(this.Polygon, "lineColor")
        .name("边框颜色")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonGeoSymbol.add(this.Polygon, "lineWidth")
        .min(0)
        .max(127)
        .name("边框线宽")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonGeoSymbol.add(this.Polygon, "lineOpacity")
        .min(0)
        .max(1)
        .name("边框透明度")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonGeoSymbol.add(this.Polygon, "lineStrokeWidth")
        .min(0)
        .max(127)
        .name("边框描边宽度")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonGeoSymbol.addColor(this.Polygon, "lineStrokeColor")
        .name("边框描边颜色")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonGeoSymbol.add(this.Polygon, "lineDasharray")
        .name("边框虚线样式")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonGeoSymbol.addColor(this.Polygon, "lineDashColor")
        .name("边框虚线的颜色")
        .onChange((value) => {
          this.updateSymbol();
        });

      /**
       * 文字样式
       */
      /**
       * 文字样式
       */
      PolygonTextSymbol.add(this.Polygon, "textName")
        .name("标注字段")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonTextSymbol.add(this.Polygon, "textSize")
        .name("文字大小")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonTextSymbol.addColor(this.Polygon, "textFill")
        .name("文字颜色")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonTextSymbol.add(this.Polygon, "textOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("文字透明度")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonTextSymbol.add(this.Polygon, "textFaceName", [
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
      PolygonTextSymbol.add(this.Polygon, "textWeight", [
        "normal",
        "bold",
        "lighter",
        "bolder",
      ])
        .name("文字字重")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonTextSymbol.add(this.Polygon, "textStyle", ["normal", "italic", "oblique"])
        .name("文字风格")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonTextSymbol.add(this.Polygon, "textRotation")
        .min(0)
        .max(360)
        .step(5)
        .name("文字旋转角度")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonTextSymbol.add(this.Polygon, "textDx")
        .min(0)
        .max(127)
        .step(1)
        .name("x轴上的偏移量")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonTextSymbol.add(this.Polygon, "textDy")
        .min(0)
        .max(127)
        .step(1)
        .name("y轴上的偏移量")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonTextSymbol.add(this.Polygon, "textWrapWidth")
        .name("文字换行长度")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonTextSymbol.addColor(this.Polygon, "textHaloFill")
        .name("文字描边颜色")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonTextSymbol.add(this.Polygon, "textHaloRadius")
        .name("文字描边半径")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonTextSymbol.add(this.Polygon, "textHaloOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("文字描边透明度")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonTextSymbol.add(this.Polygon, "textHorizontalAlignment", [
        "left",
        "middle",
        "right",
      ])
        .name("水平对齐")
        .onChange((value) => {
          this.updateSymbol();
        });
      PolygonTextSymbol.add(this.Polygon, "textVerticalAlignment", [
        "top",
        "middle",
        "bottom",
      ])
        .name("垂直对齐")
        .onChange((value) => {
          this.updateSymbol();
        });
      /**
       * 开启
       */
      PolygonAllSymbol.open();
      PolygonGeoSymbol.close();
      PolygonTextSymbol.close();
    },
    updateSymbol() {
      let {
        polygonFill,
        polygonOpacity,
        lineColor,
        lineWidth,
        lineOpacity,
        lineStrokeWidth,
        lineStrokeColor,
        lineDasharray,
        lineDashColor,
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
      } = this.Polygon;
      lineDasharray = lineDasharray.split(",");
      this.PolygonGeometry.updateSymbol([
        {
          polygonFill,
          polygonOpacity,
          lineColor,
          lineWidth,
          lineOpacity,
          lineStrokeWidth,
          lineStrokeColor,
          lineDasharray,
          lineDashColor,
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
        },
      ]);
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
