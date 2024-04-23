<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-input
        type="textarea"
        :rows="2"
        placeholder="请输入内容"
        v-model="clusterSymbol.symbol.markerFile"
      >
      </el-input>
      <el-input
        type="textarea"
        :rows="2"
        placeholder="请输入内容"
        v-model="markerSymbol.markerFile"
      >
      </el-input>
        <span class="demonstration">聚合透明度</span>
    <el-slider :min=0 :max=1 :step=0.1 v-model="clusterSymbol.symbol.markerOpacity"></el-slider>
    </div>
  </div>
</template>

<script>
import { Map, TileLayer, GeoJSON, Marker, VectorLayer } from "maptalks";
import { ClusterLayer } from "maptalks.markercluster";
export default {
  components: {},

  data() {
    return {
      map: null,
      clusterSymbol: {
        maxClusterRadius: 160, //最大聚类半径（默认为160)
        symbol: {
          markerFile: "images/icon/cluster1.png", //图标的地址
          markerOpacity: 1, //取值范围0-1，图标透明度
          markerWidth: 50, //图标高度
          markerHeight: 50, //图标高度
          markerHorizontalAlignment: "middle", //图标相对坐标点的水平对齐方式，取值范围： left, middle, right
          markerVerticalAlignment: "middle", //图标相对坐标点的垂直对齐方式，取值范围： top, middle, bottom
        },
        textSymbol: {
          //聚类文本符号
          textSize: 30, //文字大小
          textFill: "#0900d9", //文字颜色
          textOpacity: 1, //文字透明度，取值范围0-1
          textFaceName: "monospace", //文字字体，与css的font-family定义相同(https://developer.mozilla.org/zh-CN/docs/Web/CSS/font-family)
          textWeight: "normal", //文字字重,与css的font-weight定义相同(加粗)
        },
        maxClusterZoom: 18, //绘制为簇的最大缩放
      },
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
    };
  },

  computed: {},
  watch: {
    clusterSymbol: {
      handler(nval, oval) {
        this.updateClusterSymbol(nval);
      },
      deep: true,
    },
    markerSymbol: {
      handler(nval, oval) {
        this.updateMarkerSymbol(nval);
      },
      deep: true,
    },
  },

  mounted() {
    this.map = new Map("map", {
      center: [116.96457, 40.5138],
      zoom: 12,
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
    this.addLayer(
      "Cluster1",
      "Cluster2",
      "talbleName1",
      "data/json/data_MiYun_Point.json",
      {},
      {}
    );
  },

  methods: {
    addLayer(options) {
      let {
        resourceType,
        resourceName,
        tableName,
        data,
        markerSymbol = {},
        clusterStyle = {},
      } = options;
      let key = "cluster_01";
      fetch(`data/json/data_MiYun_Point.json`)
        .then((response) => response.json())
        .then((json) => {
          GeoJSON.toGeometryAsync(json).then((geos) => {
            geos.map((item) => {
              item.setSymbol(this.markerSymbol);
            });
            let clusterLayer = new ClusterLayer(key, geos, {
              maxClusterRadius: this.clusterSymbol.maxClusterRadius,
              maxClusterZoom: this.clusterSymbol.maxClusterZoom,
              symbol: this.clusterSymbol.symbol,
              textSymbol: this.clusterSymbol.textSymbol,
            });
            this.map.addLayer(clusterLayer);
          });
        });
    },
    updateClusterSymbol(style) {
      console.log(style)
      let { maxClusterRadius, maxClusterZoom, symbol, textSymbol } = style;
      let {
        markerFile,
        markerOpacity,
        markerWidth,
        markerHeight,
        markerHorizontalAlignment,
        markerVerticalAlignment,
      } = symbol;
      let {
        textName,
        textSize,
        textFill,
        textOpacity,
        textFaceName,
        textWeight,
        textStyle,
        textDx,
        textDy,
        textWrapWidth,
        textHaloFill,
        textHaloRadius,
        textHaloOpacity,
      } = textSymbol;
      let _target = this.map.getLayer("cluster_01");
      //必须传值，不能传对象
      _target.config({
        maxClusterRadius: maxClusterRadius,
        maxClusterZoom: maxClusterZoom,
        symbol: {
          markerFile: markerFile,
          markerOpacity: markerOpacity,
          markerWidth: markerWidth,
          markerHeight: markerHeight,
          markerHorizontalAlignment: markerHorizontalAlignment,
          markerVerticalAlignment: markerVerticalAlignment,
        },
        textSymbol: {
          textName: textName,
          textSize: textSize,
          textFill: textFill,
          textOpacity: textOpacity,
          textFaceName: textFaceName,
          textWeight: textWeight,
          textStyle: textStyle,
          textDx: textDx,
          textDy: textDy,
          textWrapWidth: textWrapWidth,
          textHaloFill: textHaloFill,
          textHaloRadius: textHaloRadius,
          textHaloOpacity: textHaloOpacity,
        },
      });
    },
    updateMarkerSymbol(style) {
      let _target = this.map.getLayer("cluster_01");
      let markerArr = _target._geoList;
      markerArr.map((item) => {
        item.updateSymbol(style);
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
