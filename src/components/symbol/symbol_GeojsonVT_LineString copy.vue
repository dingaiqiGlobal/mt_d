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
        lineStrokeWidth: 0, //线的描边宽度，取值范围 0 - 127
        lineStrokeColor: "#37f611", //线的描边的颜色
        //geojson-vt:不支持虚线??
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
        textSpacing: 250, //沿线分布间隔
        //textPlacement: "NAME", //textPlacement必须是line。是否按照给定property属性合并该属性的值相同的line，能让沿线分布的文字绘制得更加准确，例如：
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
            lineStrokeWidth,
            lineStrokeColor,
            lineDasharray,
            lineDashColor,
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
            textPlacement: "line",//必须写在这里***
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
       * 开启
       */
      LineStringAllSymbol.open();
      LineStringGeoSymbol.close();
      LineStringTextSymbol.close();
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
