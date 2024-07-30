<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, VectorTileLayer } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.41439, 39.91671],
      zoom: 15,
      pitch: 60,
      bearing: -25,
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
      // postProcess: {
      //   enable: true,
      //   antialias: { enable: true },
      // },
    };
    this.groupLayer = new GroupGLLayer("group", [], {
      sceneConfig,
    });
    this.groupLayer.addTo(this.map);
    this.addMapBoxLayer();
    //this.addGeoServerLayer()
  },

  methods: {
    /**
     * ①矢量切片服务-tileserver
     * ②样式-MapTalks Designer制作（与mapbox不是一套）
     * ③MapTalks Designer设计的时候要添加style地址，因为里面包含pbf地址了-http://192.168.201.166:8080/style/dongcheng/default_blue/style.json
     */
    addMapBoxLayer() {
      const vt = new VectorTileLayer("mapbox_vt", {
        urlTemplate: `http://192.168.201.166:8081/data/dongcheng/{z}/{x}/{y}.pbf`,
        style: "data/json/mapbox-light/style_mapbox_dongcheng.json",
      });
      this.groupLayer.addLayer(vt);
    },
    /**
     *  ①矢量切片服务-geoserver
     *  ②options上设置tms: true
     *  ③MapTalks Designer设计的时候要添加-http://192.168.201.162:8088/geoserver/gwc/service/tms/1.0.0/zhjy%3Adongchenggroup@EPSG%3A900913@pbf
     * //样式文件不好配-不建议使用geoserver矢量切片服务
     */
    addGeoServerLayer() {
      const vt = new VectorTileLayer("geoserver_vt", {
        urlTemplate: `http://192.168.201.162:8088/geoserver/gwc/service/tms/1.0.0/zhjy%3Adongchenggroup@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`,
        tms: true,//这个参数必须设置
        style: "data/json/mapbox-light/style_mapbox_dongcheng.json",
      });
      this.groupLayer.addLayer(vt);
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
