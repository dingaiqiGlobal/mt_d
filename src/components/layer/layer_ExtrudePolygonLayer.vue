<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, ExtrudePolygonLayer } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      extrudePolygonLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 9,
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
     * ExtrudePolygonLayer
    ExtrudePolygonLayer继承了OverlayLayer,***在API文档中找不到***
    与style中的lit渲染插件相似
    ExtrudePolygonLayer的作用是用来管理图形，方便的图形的批量显示，隐藏，添加等操作，所以其具有的特性是：
        看不见摸不着
        没有click等这些事件的*****所以只能做展示用，业务上不推荐*****
    继承了OverlayLayer的图层他们的用法都是一样的，仅仅是不同的图层管理的数据类别不同和渲染的形态不同罢了
     */
    const dataConfig = {
      type: "3d-extrusion",
      altitudeProperty: "height",
      altitudeScale: 5,
      defaultAltitude: 0,
      top: true,
      side: true,
      // sideVerticalUVMode: 1
      // textureYOrigin: 'bottom'
    };
    const material = {
      baseColorFactor: [1, 1, 1, 1],
      emissiveFactor: [1, 1, 1],
      roughnessFactor: 0,
      metalnessFactor: 0,
      outputSRGB: 0,
      uvScale: [0.001, 0.0013],
    };
    this.extrudePolygonLayer = new ExtrudePolygonLayer("vector", {
      dataConfig,
      material,
      geometryEvents: false,
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
    this.groupLayer = new GroupGLLayer("group", [this.extrudePolygonLayer], {
      sceneConfig,
    });
    this.groupLayer.addTo(this.map);

    this.addGeometry();
  },

  methods: {
    addGeometry() {
      fetch("data/json/bj/beijingarea.json")
        .then((res) => res.json())
        .then((geojson) => {
          //方式1
            maptalks.GeoJSON.toGeometryAsync(geojson).then((geos) => {
              geos.map((item) => {
                //这个样式比较特殊
                item.setSymbol({
                  topPolygonFill: "#08f2f5",
                  bottomPolygonFill: "#8529ec",
                });
                item.setProperties({
                  height: 2000,
                });
                item.on('click', ()=>{console.log(this);});
              });
              this.extrudePolygonLayer.addGeometry(geos);
            });
          //方式2
        //   const polygons = maptalks.GeoJSON.toGeometry(geojson);
        //   polygons.forEach((polygon) => {
        //     polygon.setSymbol({
        //       topPolygonFill: "#08f2f5",
        //       bottomPolygonFill: "#8529ec",
        //     });
        //     polygon.setProperties({
        //       height: 2000,
        //     });
        //   });
        //   this.extrudePolygonLayer.addGeometry(polygons);
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
