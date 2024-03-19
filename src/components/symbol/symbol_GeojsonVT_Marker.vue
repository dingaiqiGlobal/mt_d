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
      MarkerSymbol: {
        markerFile: "images/icon/icon_Red.png", //图标的地址(与矢量图标二选一)
        markerOpacity: 1, //取值范围0-1，图标透明度
        markerWidth: 28, //图标高度
        markerHeight: 40, //图标高度
        markerDx: 0, //取值范围0-127，图标在屏幕范围x轴上的偏移量
        markerDy: 0, //取值范围0-127，图标在屏幕范围y轴上的偏移量
        markerRotation: 0, //取值范围0-360，图标的旋转角度，单位度
        markerHorizontalAlignment: "middle", //图标相对坐标点的水平对齐方式，取值范围： left, middle, right
        markerVerticalAlignment: "middle", //图标相对坐标点的垂直对齐方式，取值范围： top, middle, bottom
        markerBloom: true, //泛光
        textName: "", //{name}显示的文字内容，如果要显示某个属性得值，用大括号括起来即可
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
      markerFile,
      markerOpacity,
      markerWidth,
      markerHeight,
      markerDx,
      markerDy,
      markerRotation,
      markerHorizontalAlignment,
      markerVerticalAlignment,
      markerBloom,
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
    } = this.MarkerSymbol;
    const style = {
      style: [
        {
          name: "marker",
          renderPlugin: {
            type: "icon",
            dataConfig: {
              type: "point",
              only2D: true,
            },
            sceneConfig: {
              depthFunc: "always",
              blendSrc: "one",
            },
          },
          filter: true,
          symbol: {
            markerFile,
            markerOpacity,
            markerWidth,
            markerHeight,
            markerDx,
            markerDy,
            markerRotation,
            markerHorizontalAlignment,
            markerVerticalAlignment,
            markerBloom,
          },
        },
        {
          name: "marker-text",
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
          },
        },
      ],
    };
    this.GeoJSONLayer = new GeoJSONVectorTileLayer("geojson1", {
      data: "data/json/data_MiYun_Point.json",
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
      const MarkerAllSymbol = this.gui.addFolder("线要素样式");
      const MarkerGeoSymbol = MarkerAllSymbol.addFolder("图形样式");
      const MarkerTextSymbol = MarkerAllSymbol.addFolder("标注样式");

      MarkerGeoSymbol.add(this.MarkerSymbol, "markerFile")
        .name("图标地址")
        .onChange((value) => {
          this.updateMarkerFile();
        });
      MarkerGeoSymbol.add(this.MarkerSymbol, "markerOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("图标透明度")
        .onChange((value) => {
          this.updateMarkerOpacity();
        });
      MarkerGeoSymbol.add(this.MarkerSymbol, "markerWidth")
        .name("图标宽度")
        .onChange((value) => {
          this.updateMarkerWidth();
        });
      MarkerGeoSymbol.add(this.MarkerSymbol, "markerHeight")
        .name("图标高度")
        .onChange((value) => {
          this.updateMarkerHeight();
        });
      MarkerGeoSymbol.add(this.MarkerSymbol, "markerDx")
        .min(0)
        .max(127)
        .step(1)
        .name("x轴上的偏移量")
        .onChange((value) => {
          this.updateMarkerDx();
        });
      MarkerGeoSymbol.add(this.MarkerSymbol, "markerDy")
        .min(0)
        .max(127)
        .step(1)
        .name("y轴上的偏移量")
        .onChange((value) => {
          this.updateMarkerDy();
        });
      MarkerGeoSymbol.add(this.MarkerSymbol, "markerRotation")
        .name("旋转角度")
        .onChange((value) => {
          this.updateMarkerRotation();
        });
      MarkerGeoSymbol.add(this.MarkerSymbol, "markerHorizontalAlignment", [
        "left",
        "middle",
        "right",
      ])
        .name("水平对齐")
        .onChange((value) => {
          this.updateMarkerHorizontalAlignment();
        });
      MarkerGeoSymbol.add(this.MarkerSymbol, "markerVerticalAlignment", [
        "top",
        "middle",
        "bottom",
      ])
        .name("垂直对齐")
        .onChange((value) => {
          this.updateMarkerVerticalAlignment();
        });
      MarkerGeoSymbol.add(this.MarkerSymbol, "markerBloom")
        .name("泛光")
        .onChange((value) => {
          this.updateMarkerBloom();
        });
      /**
       * 文字样式
       */
      MarkerTextSymbol.add(this.MarkerSymbol, "textName")
        .name("标注字段")
        .onChange((value) => {
          this.updateTextName();
        });
      MarkerTextSymbol.add(this.MarkerSymbol, "textSize")
        .name("文字大小")
        .onChange((value) => {
          this.updateTextSize();
        });
      MarkerTextSymbol.addColor(this.MarkerSymbol, "textFill")
        .name("文字颜色")
        .onChange((value) => {
          this.updateTextFill();
        });
      MarkerTextSymbol.add(this.MarkerSymbol, "textOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("文字透明度")
        .onChange((value) => {
          this.updateTextOpacity();
        });
      MarkerTextSymbol.add(this.MarkerSymbol, "textFaceName", [
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
      MarkerTextSymbol.add(this.MarkerSymbol, "textWeight", [
        "normal",
        "bold",
        "lighter",
        "bolder",
      ])
        .name("文字字重")
        .onChange((value) => {
          this.updateTextWeight();
        });
      MarkerTextSymbol.add(this.MarkerSymbol, "textStyle", [
        "normal",
        "italic",
        "oblique",
      ])
        .name("文字风格")
        .onChange((value) => {
          this.updateTextStyle();
        });
      MarkerTextSymbol.add(this.MarkerSymbol, "textRotation")
        .min(0)
        .max(360)
        .step(5)
        .name("文字旋转角度")
        .onChange((value) => {
          this.updateTextRotation();
        });
      MarkerTextSymbol.add(this.MarkerSymbol, "textDx")
        .min(0)
        .max(127)
        .step(1)
        .name("x轴上的偏移量")
        .onChange((value) => {
          this.updateTextDx();
        });
      MarkerTextSymbol.add(this.MarkerSymbol, "textDy")
        .min(0)
        .max(127)
        .step(1)
        .name("y轴上的偏移量")
        .onChange((value) => {
          this.updateTextDy();
        });
      MarkerTextSymbol.add(this.MarkerSymbol, "textWrapWidth")
        .name("文字换行长度")
        .onChange((value) => {
          this.updateTextWrapWidth();
        });
      MarkerTextSymbol.addColor(this.MarkerSymbol, "textHaloFill")
        .name("文字描边颜色")
        .onChange((value) => {
          this.updateTextHaloFill();
        });
      MarkerTextSymbol.add(this.MarkerSymbol, "textHaloRadius")
        .name("文字描边半径")
        .onChange((value) => {
          this.updateTextHaloRadius();
        });
      MarkerTextSymbol.add(this.MarkerSymbol, "textHaloOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("文字描边透明度")
        .onChange((value) => {
          this.updateTextHaloOpacity();
        });
      MarkerTextSymbol.add(this.MarkerSymbol, "textHorizontalAlignment", [
        "left",
        "middle",
        "right",
      ])
        .name("水平对齐")
        .onChange((value) => {
          this.updateTextHorizontalAlignment();
        });
      MarkerTextSymbol.add(this.MarkerSymbol, "textVerticalAlignment", [
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
      MarkerAllSymbol.open();
      MarkerGeoSymbol.close();
      MarkerTextSymbol.close();
    },
    /**
     * 更新样式不选择setStyle
     * updateSymbol 用于图层样式的局部更新，相比 setStyle 性能更高，
     * 且除了部分需重构 Mesh 的属性一般不会造成图层刷新闪烁
     */
    updateMarkerFile() {
      let { markerFile } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker", {
        markerFile,
      });
    },
    updateMarkerOpacity() {
      let { markerOpacity } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker", {
        markerOpacity,
      });
    },
    updateMarkerWidth() {
      let { markerWidth } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker", {
        markerWidth,
      });
    },
    updateMarkerHeight() {
      let { markerHeight } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker", {
        markerHeight,
      });
    },
    updateMarkerDx() {
      let { markerDx } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker", {
        markerDx,
      });
    },
    updateMarkerDy() {
      let { markerDy } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker", {
        markerDy,
      });
    },
    updateMarkerRotation() {
      let { markerRotation } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker", {
        markerRotation,
      });
    },
    updateMarkerHorizontalAlignment() {
      let { markerHorizontalAlignment } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker", {
        markerHorizontalAlignment,
      });
    },
    updateMarkerVerticalAlignment() {
      let { markerVerticalAlignment } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker", {
        markerVerticalAlignment,
      });
    },
    updateMarkerBloom() {
      let { markerBloom } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker", {
        markerBloom,
      });
    },
    updateTextName() {
      let { textName } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textName,
      });
    },
    updateTextSize() {
      let { textSize } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textSize,
      });
    },
    updateTextFill() {
      let { textFill } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textFill,
      });
    },
    updateTextOpacity() {
      let { textOpacity } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textOpacity,
      });
    },
    updateTextFaceName() {
      let { textFaceName } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textFaceName,
      });
    },
    updateTextWeight() {
      let { textWeight } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textWeight,
      });
    },
    updateTextStyle() {
      let { textStyle } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textStyle,
      });
    },
    updateTextRotation() {
      let { textRotation } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textRotation,
      });
    },
    updateTextDx() {
      let { textDx } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textDx,
      });
    },
    updateTextDy() {
      let { textDy } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textDy,
      });
    },
    updateTextWrapWidth() {
      let { textWrapWidth } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textWrapWidth,
      });
    },
    updateTextHaloFill() {
      let { textHaloFill } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textHaloFill,
      });
    },
    updateTextHaloRadius() {
      let { textHaloRadius } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textHaloRadius,
      });
    },
    updateTextHaloOpacity() {
      let { textHaloOpacity } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textHaloOpacity,
      });
    },
    updateTextHorizontalAlignment() {
      let { textHorizontalAlignment } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
        textHorizontalAlignment,
      });
    },
    updateTextVerticalAlignment() {
      let { textVerticalAlignment } = this.MarkerSymbol;
      this.GeoJSONLayer.updateSymbol("marker-text", {
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
