<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import * as dat from "dat.gui";
import { Map, TileLayer, Marker } from "maptalks";
import { GroupGLLayer, PointLayer } from "@maptalks/gl-layers";
export default {
  components: {},

  data() {
    return {
      map: null,
      pointLayer: null,
      marker: null,
      groupLayer: null,
      gui: null,
      point: {
        markerFile: "images/icon/icon_Red.png", //图标的地址(与矢量图标二选一)
        markerOpacity: 1, //取值范围0-1，图标透明度
        markerWidth: 28, //图标高度
        markerHeight: 40, //图标高度
        markerDx: 0, //取值范围0-127，图标在屏幕范围x轴上的偏移量
        markerDy: 0, //取值范围0-127，图标在屏幕范围y轴上的偏移量
        markerRotation: 0, //取值范围0-360，图标的旋转角度，单位度
        markerHorizontalAlignment: "middle", //图标相对坐标点的水平对齐方式，取值范围： left, middle, right
        markerVerticalAlignment: "middle", //图标相对坐标点的垂直对齐方式，取值范围： top, middle, bottom
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
        altitude: 1000, //海拔
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
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });

    /**
     * PointLayer
     */
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
    } = this.point;
    let symbol = [
      {
        markerFile,
        markerOpacity,
        markerWidth,
        markerHeight,
        markerDx,
        markerDy,
        markerRotation,
        markerHorizontalAlignment,
        markerVerticalAlignment,
      },
      {
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
    this.pointLayer = new PointLayer("point0", {});
    this.marker = new Marker([116.39225, 39.90552, this.point.Altitude], {
      symbol,
    }).addTo(this.pointLayer);
    /**
     * GroupGLLayer
     */
    this.groupLayer = new GroupGLLayer("group", [this.pointLayer], {
      sceneConfig: {
        environment: {
          enable: true,
          mode: 1,
          level: 0,
          brightness: 0,
        },
        //只有GLTFMarker有泛光效果
        postProcess: {
          enable: true,
          bloom: {
            enable: true,
          },
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
      const pointAllSymbol = this.gui.addFolder("点要素样式");
      const pointGeoSymbol = pointAllSymbol.addFolder("图形样式");
      const pointTextSymbol = pointAllSymbol.addFolder("标注样式");
      /**
       * 图形样式
       */
      pointGeoSymbol.add(this.point, "markerFile").name("图标地址");
      pointGeoSymbol
        .add(this.point, "markerOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("图标透明度")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointGeoSymbol
        .add(this.point, "markerWidth")
        .name("图标宽度")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointGeoSymbol
        .add(this.point, "markerHeight")
        .name("图标高度")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointGeoSymbol
        .add(this.point, "markerDx")
        .min(0)
        .max(127)
        .step(1)
        .name("x轴上的偏移量")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointGeoSymbol
        .add(this.point, "markerDy")
        .min(0)
        .max(127)
        .step(1)
        .name("y轴上的偏移量")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointGeoSymbol
        .add(this.point, "altitude")
        .name("海拔高度")
        .onChange((value) => {
          this.setAltitude(value);
        });
      pointGeoSymbol
        .add(this.point, "markerRotation")
        .name("旋转角度")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointGeoSymbol
        .add(this.point, "markerHorizontalAlignment", ["left", "middle", "right"])
        .name("水平对齐")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointGeoSymbol
        .add(this.point, "markerVerticalAlignment", ["top", "middle", "bottom"])
        .name("垂直对齐")
        .onChange((value) => {
          this.updateSymbol();
        });
      /**
       * 文字样式
       */
      pointTextSymbol
        .add(this.point, "textName")
        .name("标注字段")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointTextSymbol
        .add(this.point, "textSize")
        .name("文字大小")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointTextSymbol
        .addColor(this.point, "textFill")
        .name("文字颜色")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointTextSymbol
        .add(this.point, "textOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("文字透明度")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointTextSymbol
        .add(this.point, "textFaceName", [
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
      pointTextSymbol
        .add(this.point, "textWeight", ["normal", "bold", "lighter", "bolder"])
        .name("文字字重")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointTextSymbol
        .add(this.point, "textStyle", ["normal", "italic", "oblique"])
        .name("文字风格")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointTextSymbol
        .add(this.point, "textRotation")
        .min(0)
        .max(360)
        .step(5)
        .name("文字旋转角度")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointTextSymbol
        .add(this.point, "textDx")
        .min(0)
        .max(127)
        .step(1)
        .name("x轴上的偏移量")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointTextSymbol
        .add(this.point, "textDy")
        .min(0)
        .max(127)
        .step(1)
        .name("y轴上的偏移量")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointTextSymbol
        .add(this.point, "textWrapWidth")
        .name("文字换行长度")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointTextSymbol
        .addColor(this.point, "textHaloFill")
        .name("文字描边颜色")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointTextSymbol
        .add(this.point, "textHaloRadius")
        .name("文字描边半径")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointTextSymbol
        .add(this.point, "textHaloOpacity")
        .min(0)
        .max(1)
        .step(0.1)
        .name("文字描边透明度")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointTextSymbol
        .add(this.point, "textHorizontalAlignment", ["left", "middle", "right"])
        .name("水平对齐")
        .onChange((value) => {
          this.updateSymbol();
        });
      pointTextSymbol
        .add(this.point, "textVerticalAlignment", ["top", "middle", "bottom"])
        .name("垂直对齐")
        .onChange((value) => {
          this.updateSymbol();
        });

      /**
       * 开启
       */
      pointAllSymbol.open();
      pointGeoSymbol.close();
      pointTextSymbol.close();
    },
    updateSymbol() {
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
      } = this.point;
      this.marker.updateSymbol([
        {
          markerFile,
          markerOpacity,
          markerWidth,
          markerHeight,
          markerDx,
          markerDy,
          markerRotation,
          markerHorizontalAlignment,
          markerVerticalAlignment,
        },
        {
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
    setAltitude(value) {
      this.marker.setAltitude(value);
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
