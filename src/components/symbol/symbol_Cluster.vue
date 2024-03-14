<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import * as dat from "dat.gui";
import { Map, TileLayer, GeoJSON, Marker } from "maptalks";
import { ClusterLayer } from "maptalks.markercluster";
export default {
  components: {},

  data() {
    return {
      map: null,
      heatmapLayer: null,
      clusterAllSymbol: {
        maxClusterRadius: 160, //最大聚类半径（默认为160)
        clusterSymbol: {
          markerFile: "images/icon/cluster3.png", //图标的地址
          markerOpacity: 1, //取值范围0-1，图标透明度
          markerWidth: 50, //图标高度
          markerHeight: 50, //图标高度
          markerHorizontalAlignment: "middle", //图标相对坐标点的水平对齐方式，取值范围： left, middle, right
          markerVerticalAlignment: "middle", //图标相对坐标点的垂直对齐方式，取值范围： top, middle, bottom
        },
        clusterTextSymbol: {
          //聚类文本符号
          textSize: 30, //文字大小
          textFill: "#0900d9", //文字颜色
          textOpacity: 1, //文字透明度，取值范围0-1
          textFaceName: "monospace", //文字字体，与css的font-family定义相同(https://developer.mozilla.org/zh-CN/docs/Web/CSS/font-family)
          textWeight: "normal", //文字字重,与css的font-weight定义相同(加粗)
        },
        maxClusterZoom: 18, //绘制为簇的最大缩放
        markerSymbol: {
          markerFile: "images/icon/icon_Red.png",
          markerOpacity: 1,
          markerWidth: 28,
          markerHeight: 40,
          markerHorizontalAlignment: "middle",
          markerVerticalAlignment: "middle",
          textName: "{NAME}", //{name}显示的文字内容，如果要显示某个属性得值，用大括号括起来即可
          textSize: 10, //文字大小
          textFill: "#0900d9", //文字颜色
          textOpacity: 0.5, //文字透明度，取值范围0-1
          textFaceName: "monospace", //文字字体，与css的font-family定义相同(https://developer.mozilla.org/zh-CN/docs/Web/CSS/font-family)
          textWeight: "normal", //文字字重,与css的font-weight定义相同
          textStyle: "normal", //文字风格，支持斜体等，与cssfont-style定义相同
          textDx: 0, //文字在屏幕x轴上的偏移度，单位像素
          textDy: 24, //文字在屏幕y轴上的偏移度，单位像素
          textWrapWidth: 240, //文字换行长度，即文字长度超过该值时就会自动换行
          textHaloFill: "#58e61d", //文字描边颜色
          textHaloRadius: 2, //文字描边半径
          textHaloOpacity: 1, //文字描边透明度，取值范围0-1
        },
      },
    };
  },

  computed: {},

  mounted() {
    this.map = new Map("map", {
      center: [116.96457, 40.5138],
      zoom: 12,
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
    this.initGui();
    this.getWfsData();
  },

  methods: {
    /**
     * cnpm i maptalks.markercluster --save
     * 是maptalks.VectorLayer  的子类，继承了所有的方法
     * new ClusterLayer(id, data, options)
     * 一、属性
     * id          String           图层id
     * data        Marker []        数组
     * options     Object {}
     *      1-maxClusterRadius           Number		 最大聚类半径（默认为160）
     *      2-symbol                     Object		 聚类的符号
     *      3-textSymbol                 Object 	 聚类文本符号
     *      4-drawClusterText            Boolean	 是否绘制集群文本（默认为true）-数字标注
     *      5-textSumProperty            String		 要汇总显示为群集文本的属性名称-圆圈上标注的名称，从属性中获取
     *      6-maxClusterZoom             Number 	 绘制为簇的最大缩放（默认为null）
     *      7-animation                  Boolean     缩放时是否设置簇的动画（默认为true）
     *      8-animationDuration          Number      动画持续时间
     *      9-noClusterWithOneMarker     Boolean     是否只显示一个标记的聚类（默认为false）-当为1的时候显示图标
     *      10-其他options同maptalks.VectorLayer
     *
     * 二、config
     * 配置层的选项，并在必要时重新绘制层
     * clusterLayer.config('maxClusterRadius', 100);
     * clusterLayer.config({
     *     'textSymbol' : {
     *         'textFaceName': 'monospace',
     *         'textSize': 16
     *     }
     * });
     *
     * 三、方法
     * 1-addMarker(marker)   添加更多标记marker是Marker[]数组
     * 2-toJSON()            var json = clusterLayer.toJSON();
     *
     *
     */
    getWfsData() {
      let {
        maxClusterRadius,
        clusterSymbol,
        clusterTextSymbol,
        maxClusterZoom,
        markerSymbol,
      } = this.clusterAllSymbol;
      fetch(`data/json/data_MiYun_Point.json`)
        .then((response) => response.json())
        .then((json) => {
          //GeoJSON2Marker-GeoJSON中的方法
          GeoJSON.toGeometryAsync(json).then((geos) => {
            // console.log(geos)
            geos.map((item) => {
              item.setSymbol(markerSymbol);
            });
            // console.log(geos)
            this.addClusterLayer({
              id: "cluster_01",
              markers: geos,
              maxClusterRadius,
              symbol: clusterSymbol,
              textSymbol: clusterTextSymbol,
              maxClusterZoom,
            });
          });
        });
    },
    addClusterLayer(options) {
      let { id, markers, maxClusterRadius, symbol, textSymbol, maxClusterZoom } = options;
      let clusterLayer = new ClusterLayer(id, markers, {
        maxClusterRadius,
        symbol,
        textSymbol,
        maxClusterZoom,
        drawClusterText: true,
        noClusterWithOneMarker: true,
        //以下继承vectorLayer的属性
        geometryEvents: true,
        single: true,
      });
      this.map.addLayer(clusterLayer);
    },
    initGui() {
      /**
       * GUI
       */
      this.gui = new dat.GUI();
      this.gui.domElement.style = "position:absolute;top:10px;left:10px";
      const ClueterSymbol = this.gui.addFolder("聚散图");
      ClueterSymbol.open();
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
