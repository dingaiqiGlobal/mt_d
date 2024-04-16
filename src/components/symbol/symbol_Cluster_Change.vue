<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-input
        type="textarea"
        :rows="2"
        placeholder="请输入内容"
        v-model="clusterAllSymbol.clusterSymbol.markerFile"
      >
      </el-input>
      <el-input
        type="textarea"
        :rows="2"
        placeholder="请输入内容"
        v-model="clusterAllSymbol.markerSymbol.markerFile"
      >
      </el-input>
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
      clusterAllSymbol: {
        maxClusterRadius: 160, //最大聚类半径（默认为160)
        clusterSymbol: {
          markerFile: "images/icon/cluster1.png", //图标的地址
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
  watch: {
    clusterAllSymbol: {
      handler(nval, oval) {
        this.updateClusterSymbol(nval);
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
        urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
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
              item.setSymbol(this.clusterAllSymbol.markerSymbol);
            });
            let clusterLayer = new ClusterLayer(key, geos, {
              maxClusterRadius: this.clusterAllSymbol.maxClusterRadius,
              maxClusterZoom: this.clusterAllSymbol.maxClusterZoom,
              symbol: this.clusterAllSymbol.clusterSymbol,
              textSymbol: this.clusterAllSymbol.clusterTextSymbol,
            });
            this.map.addLayer(clusterLayer);
          });
        });
    },
    updateClusterSymbol(style) {
      let { clusterSymbol, maxClusterRadius } = style;
      let _target = this.map.getLayer("cluster_01");
      //必须传值，不能传对象
      _target.config({
        symbol: {
          markerFile: clusterSymbol.markerFile,
        },
      });
    },
    updateMarkerSymbol(style) {
      //这个可以传对象
      let { markerSymbol } = style;
      let _target = this.map.getLayer("cluster_01");
      let markerArr = _target._geoList;
      markerArr.map((item) => {
        item.updateSymbol(markerSymbol);
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
