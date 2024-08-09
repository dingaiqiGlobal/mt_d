<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl-layers";

import { TileClusterLayer } from "maptalks.tileclusterlayer";
import * as turf from "@turf/turf";

/**
 * cnpm i maptalks.tileclusterlayer --save
 * https://www.npmjs.com/package/maptalks.tileclusterlayer
 * 源码在./js/symbol_Cluster_tileclusterlayer.js
 *
 * 高级功能鼠标滑过显示聚散范围，利用了turf.js
 * cnpm install @turf/turf --save
 *
 */

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      tileClusterLayer: null,
      templayer: null, //临时图层
      currentClusterMarker: null, //当前图层标记
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.96457, 40.5138],
      zoom: 10,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      }),
      layers: [],
    });
    /**
     * groupLayer
     */
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [], { sceneConfig });
    this.groupLayer.addTo(this.map);

    this.addTileClusterLayer();
    //计算的临时图层(清空)
    this.templayer = new maptalks.VectorLayer("templayer").addTo(this.map);
    this.map.on("viewchange", () => {
      this.templayer.clear();
      this.currentClusterMarker = null;
    });
  },

  methods: {
    addTileClusterLayer() {
      //样式函数必须这么写
      function getClusterMarkerSymbol(count) {
        const symbol = {
          markerFile: "images/icon/marker-case-clusterer1.png",
          markerVerticalAlignment: "middle",
          textSize: 15,
          textName: count,
          textHaloFill: "#000",
          textHaloRadius: 1.2,
          textFill: "#fff",
        };
        if (count > 50) {
          symbol.markerFile = "images/icon/marker-case-clusterer3.png";
        } else if (count > 20) {
          symbol.markerFile = "images/icon/marker-case-clusterer2.png";
        }
        return symbol;
      }
      this.tileClusterLayer = new TileClusterLayer("layer", {
        maxClusterZoom: 18, //最大聚散等级
        clusterDispersion: true, //当集群标记点击时，将显示子标记
        dispersionCount: 500, //显示聚类标记子项最大计数
        dispersionDuration: 300, //分散持续时间
        clusterMarkerSymbol: getClusterMarkerSymbol, //自定义样式（函数）
        markerEvents: {
          //事件绑定
          click: this.mouseClick,
          mouseover: this.mouseOver,
          mouseout: this.mouseOut,
        },
      });
      this.tileClusterLayer.addTo(this.map);

      //添加数据的方法-可以直接添加geojson
      //tileClusterLayer.setData(geojson);
      fetch(`data/json/data_MiYun_Point.json`)
        .then((response) => response.json())
        .then((geojson) => {
          geojson.features.forEach((f) => {
            //单个样式
            f.symbol = {
              markerFile: "images/icon/icon_Red.png",
              markerOpacity: 1,
              markerWidth: 25,
              markerHeight: 35,
            };
          });
          this.tileClusterLayer.setData(geojson);
        });
    },
    /**
     * 事件
     */
    isClusterMarker(e) {
      return (e.target.getProperties() || {}).isCluster;
    },
    mouseClick(e) {
      if (!this.isClusterMarker(e)) {
        return;
      }
      this.map.setCenter(e.target.getCenter());
      this.map.zoomIn();
    },
    mouseOver(e) {
      if (!this.isClusterMarker(e)) {
        return;
      }
      if (this.currentClusterMarker === e.target) {
        return;
      }
      const features = e.target.getProperties().features || [];
      if (features.length > e.target.getLayer().options.dispersionCount) {
        return;
      }
      const points = features.map((f) => {
        return f;
      });
      const result = turf.concave(turf.featureCollection(points));
      if (!result) {
        return;
      }
      this.templayer.clear();
      const polygons = maptalks.GeoJSON.toGeometry(result);
      polygons.setSymbol({
        lineColor: "yellow",
        lineWidth: 1.5,
      });
      this.templayer.addGeometry(polygons);
      this.currentClusterMarker = e.target;
    },
    mouseOut(e) {
      this.templayer.clear();
      this.currentClusterMarker = null;
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
