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
      PolygonSymbol: {
        polygonFill: "#00ffea", //面的填充色
        polygonOpacity: 0.5, //透明度,取值范围 0 - 1
        polygonBloom: false, //发光*****
        //polygonPatternFile:null,//填充图片，支持url或者base64字符串
        //uvScale:[1,1],//纹理的缩放倍数，两位数组
        //uvOffset:[0,1],//两位数组，纹理的偏移量，0表示不偏移，1表示偏移量等于图片的尺寸，例如0.5表示偏移到图片的一半
        lineColor: "#f70404", //线的颜色
        lineWidth: 5, //线宽，取值范围 0 - 127
        lineOpacity: 1, //线的透明度，取值范围 0 - 1
        lineStrokeWidth: 0, //线的描边宽度，取值范围 0 - 127
        lineStrokeColor: "#37f611", //线的描边的颜色
        lineDasharray: "20,20,20,20", //线的虚线样式，****四位数组[20,20,20,20]，单位像素,
        lineDashColor: "#fff", //线虚线的颜色
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
        urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });

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
    } = this.PolygonSymbol;
    lineDasharray = lineDasharray.split(",");
    const style = {
      style: [
        {
          name: "area-fill", //id
          renderPlugin: {
            type: "fill",
            dataConfig: {
              type: "fill",
              only2D: true,
            },
            sceneConfig: {
              depthFunc: "always",
              blendSrc: "one",
            },
          },
          filter: true,
          symbol: {
            polygonFill,
            polygonOpacity,
          },
        },
        {
          name: "area-border",
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
          name: "area-text",
          renderPlugin: {
            dataConfig: {
              type: "point",
            },
            sceneConfig: {
              collision: true,
              fading: false,
              depthFunc: "always",
            },
            type: "text",
          },
          filter: true,
          symbol: {
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
        },
      ],
    };
    this.GeoJSONLayer = new GeoJSONVectorTileLayer("geojson1", {
      data: "data/json/data_MiYun.json",
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
      const PolygonAllSymbol = this.gui.addFolder("面要素样式");
      const PolygonGeoSymbol = PolygonAllSymbol.addFolder("图形样式");
      const PolygonTextSymbol = PolygonAllSymbol.addFolder("标注样式");

      PolygonGeoSymbol.addColor(this.PolygonSymbol, "polygonFill")
        .name("填充颜色")
        .onChange((value) => {
          this.updatePolygonFill();
        });

      PolygonGeoSymbol.add(this.PolygonSymbol, "polygonOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("填充透明度")
        .onChange((value) => {
          this.updatePolygonOpacity();
        });
      PolygonGeoSymbol.add(this.PolygonSymbol, "polygonBloom")
        .name("泛光")
        .onChange((value) => {
          this.updatePolygonBoom(value);
        });
      PolygonGeoSymbol.addColor(this.PolygonSymbol, "lineColor")
        .name("边框颜色")
        .onChange((value) => {
          this.updateLineColor();
        });
      PolygonGeoSymbol.add(this.PolygonSymbol, "lineWidth")
        .min(0)
        .max(127)
        .name("边框线宽")
        .onChange((value) => {
          this.updateLineWidth();
        });
      PolygonGeoSymbol.add(this.PolygonSymbol, "lineOpacity")
        .min(0)
        .max(1)
        .name("边框透明度")
        .onChange((value) => {
          this.updateLineOpacity();
        });
      PolygonGeoSymbol.add(this.PolygonSymbol, "lineStrokeWidth")
        .min(0)
        .max(127)
        .name("边框描边宽度")
        .onChange((value) => {
          this.updateLineStrokeWidth();
        });
      PolygonGeoSymbol.addColor(this.PolygonSymbol, "lineStrokeColor")
        .name("边框描边颜色")
        .onChange((value) => {
          this.updateLineStrokeColor();
        });
      PolygonGeoSymbol.add(this.PolygonSymbol, "lineDasharray")
        .name("虚线样式")
        .onChange((value) => {
          this.updateLineDasharray();
        });
      PolygonGeoSymbol.addColor(this.PolygonSymbol, "lineDashColor")
        .name("虚线的颜色")
        .onChange((value) => {
          this.updateLineDashColor();
        });
      /**
       * 文字样式
       */
      PolygonTextSymbol.add(this.PolygonSymbol, "textName")
        .name("标注字段")
        .onChange((value) => {
          this.updateTextName();
        });
      PolygonTextSymbol.add(this.PolygonSymbol, "textSize")
        .name("文字大小")
        .onChange((value) => {
          this.updateTextSize();
        });
      PolygonTextSymbol.addColor(this.PolygonSymbol, "textFill")
        .name("文字颜色")
        .onChange((value) => {
          this.updateTextFill();
        });
      PolygonTextSymbol.add(this.PolygonSymbol, "textOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("文字透明度")
        .onChange((value) => {
          this.updateTextOpacity();
        });
      PolygonTextSymbol.add(this.PolygonSymbol, "textFaceName", [
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
      PolygonTextSymbol.add(this.PolygonSymbol, "textWeight", [
        "normal",
        "bold",
        "lighter",
        "bolder",
      ])
        .name("文字字重")
        .onChange((value) => {
          this.updateTextWeight();
        });
      PolygonTextSymbol.add(this.PolygonSymbol, "textStyle", [
        "normal",
        "italic",
        "oblique",
      ])
        .name("文字风格")
        .onChange((value) => {
          this.updateTextStyle();
        });
      PolygonTextSymbol.add(this.PolygonSymbol, "textRotation")
        .min(0)
        .max(360)
        .step(5)
        .name("文字旋转角度")
        .onChange((value) => {
          this.updateTextRotation();
        });
      PolygonTextSymbol.add(this.PolygonSymbol, "textDx")
        .min(0)
        .max(127)
        .step(1)
        .name("x轴上的偏移量")
        .onChange((value) => {
          this.updateTextDx();
        });
      PolygonTextSymbol.add(this.PolygonSymbol, "textDy")
        .min(0)
        .max(127)
        .step(1)
        .name("y轴上的偏移量")
        .onChange((value) => {
          this.updateTextDy();
        });
      PolygonTextSymbol.add(this.PolygonSymbol, "textWrapWidth")
        .name("文字换行长度")
        .onChange((value) => {
          this.updateTextWrapWidth();
        });
      PolygonTextSymbol.addColor(this.PolygonSymbol, "textHaloFill")
        .name("文字描边颜色")
        .onChange((value) => {
          this.updateTextHaloFill();
        });
      PolygonTextSymbol.add(this.PolygonSymbol, "textHaloRadius")
        .name("文字描边半径")
        .onChange((value) => {
          this.updateTextHaloRadius();
        });
      PolygonTextSymbol.add(this.PolygonSymbol, "textHaloOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("文字描边透明度")
        .onChange((value) => {
          this.updateTextHaloOpacity();
        });
      PolygonTextSymbol.add(this.PolygonSymbol, "textHorizontalAlignment", [
        "left",
        "middle",
        "right",
      ])
        .name("水平对齐")
        .onChange((value) => {
          this.updateTextHorizontalAlignment();
        });
      PolygonTextSymbol.add(this.PolygonSymbol, "textVerticalAlignment", [
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
      PolygonAllSymbol.open();
      PolygonGeoSymbol.close();
      PolygonTextSymbol.close();
    },
    /**
     * 更新样式不选择setStyle
     * updateSymbol 用于图层样式的局部更新，相比 setStyle 性能更高，
     * 且除了部分需重构 Mesh 的属性一般不会造成图层刷新闪烁
     */
    updatePolygonFill() {
      let { polygonFill } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-fill", {
        polygonFill,
      });
    },
    updatePolygonOpacity() {
      let { polygonOpacity } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-fill", {
        polygonOpacity,
      });
    },
    /**
     * highlight 的参数说明如下
     *   属性	     说明
     *   id	       数据的 feature id(json中的feature顺序，从0开始)
     *   filter	   数据过滤函数---id或者filter  必选二选一
     *   visible	 数据是否显示
     *   bloom	   数据是否高亮
     *   color	   颜色(鼠标滑动改变的颜色，不是高亮的颜色)
     *   opacity   透明度(鼠标滑动改变的透明度，不是高亮的透明度)
     *
     * 注意事项：
     * map最好加上灯光设置
     * GroupGLLayer设置中将boom打开
     */
    updatePolygonBoom(value) {
      this.GeoJSONLayer.highlight([
        {
          name: "test-fill",
          // id: 0,
          filter: (feature) => {
            const name = feature.properties.NAME;
            return name;
          },
          plugin: "area-fill",
          bloom: value,
        },
      ]);
    },
    updateLineColor() {
      let { lineColor } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-border", {
        lineColor,
      });
    },
    updateLineWidth() {
      let { lineWidth } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-border", {
        lineWidth,
      });
    },
    updateLineOpacity() {
      let { lineOpacity } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-border", {
        lineOpacity,
      });
    },
    updateLineStrokeWidth() {
      let { lineStrokeWidth } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-border", {
        lineStrokeWidth,
      });
    },
    updateLineStrokeColor() {
      let { lineStrokeColor } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-border", {
        lineStrokeColor,
      });
    },
    updateLineDasharray() {
      let { lineDasharray } = this.PolygonSymbol;
      lineDasharray = lineDasharray.split(","); //字符串转数组
      this.GeoJSONLayer.updateSymbol("area-border", {
        lineDasharray,
      });
    },
    updateLineDashColor() {
      let { lineDashColor } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-border", {
        lineDashColor,
      });
    },

    updateTextName() {
      let { textName } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textName,
      });
    },
    updateTextSize() {
      let { textSize } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textSize,
      });
    },
    updateText() {
      let { textFill } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textFill,
      });
    },
    updateTextOpacity() {
      let { textOpacity } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textOpacity,
      });
    },
    updateTextFaceName() {
      let { textFaceName } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textFaceName,
      });
    },
    updateTextWeight() {
      let { textWeight } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textWeight,
      });
    },
    updateTextStyle() {
      let { textStyle } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textStyle,
      });
    },
    updateTextRotation() {
      let { textRotation } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textRotation,
      });
    },
    updateTextDx() {
      let { textDx } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textDx,
      });
    },
    updateTextDy() {
      let { textDy } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textDy,
      });
    },
    updateTextWrapWidth() {
      let { textWrapWidth } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textWrapWidth,
      });
    },
    updateTextHaloFill() {
      let { textHaloFill } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textHaloFill,
      });
    },
    updateTextHaloRadius() {
      let { textHaloRadius } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textHaloRadius,
      });
    },
    updateTextHaloOpacity() {
      let { textHaloOpacity } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textHaloOpacity,
      });
    },
    updateTextHorizontalAlignment() {
      let { textHorizontalAlignment } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
        textHorizontalAlignment,
      });
    },
    updateTextVerticalAlignment() {
      let { textVerticalAlignment } = this.PolygonSymbol;
      this.GeoJSONLayer.updateSymbol("area-text", {
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
