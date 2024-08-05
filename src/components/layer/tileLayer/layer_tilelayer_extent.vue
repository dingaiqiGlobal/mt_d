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
import * as THREE from "three";
import { ThreeLayer } from "maptalks.three";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      vectorLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
      //   spatialReference: {
      //     projection: "EPSG:3857",
      //   },
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
    //原型上
    this.addPrototype();
    this.vectorLayer = new maptalks.VectorLayer("vectorLayer").addTo(this.map).setZIndex(2);
    //底图
    const tileLayer = new maptalks.TileLayer("base", {
      urlTemplate:
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      debug: true,
    });
    let that = this;
    tileLayer.getTileUrl = function (x, y, z) {
      if (z === Math.round(this.map.getZoom())) {
        that.addLabels(this._getTileExtent(x, y, z));
      }
      return maptalks.TileLayer.prototype.getTileUrl.call(this, x, y, z);
    };
    tileLayer.addTo(this.map);
  },

  methods: {
    //获取瓦片的边界范围Extent：
    //TileLayer默认没有提供对应的方法,
    //但是可以自己手动添加下对应的方法的,
    //这里在TileLayer 的原型下挂载了两个方法
    addPrototype() {
      maptalks.TileLayer.prototype._getTilePrjExtent = function (x, y, z) {
        const map = this.getMap(),
          res = map._getResolution(z),
          tileConfig = this._getTileConfig(),
          tileExtent = tileConfig.getTilePrjExtent(x, y, res);
        return tileExtent;
      };

      maptalks.TileLayer.prototype._getTileExtent = function (x, y, z) {
        const prjExtent = this._getTilePrjExtent(x, y, z);
        const map = this.getMap();
        const { xmin, ymin, xmax, ymax } = prjExtent;
        const pmin = new maptalks.Point(xmin, ymin),
          pmax = new maptalks.Point(xmax, ymax);
        const projection = map.getProjection();
        const min = projection.unproject(pmin),
          max = projection.unproject(pmax);
        return new maptalks.Extent(min, max);
      };
      console.log(maptalks);
    },
    addLabels(extent) {
      const geos = this.vectorLayer.getGeometries();
      if (geos.length > 100) {
        const removeGeos = geos.slice(0, geos.length - 100);
        this.vectorLayer.removeGeometry(removeGeos);
      }
      const { xmin, ymin, xmax, ymax } = extent;
      const text = `xmin:${xmin}\nymin:${ymin}\nxmax:${xmax}\nymax:${ymax}`;
      const label = new maptalks.Marker(extent.getCenter(), {
        symbol: {
          textName: text,
          textHorizontalAlignment: "right",
          textFill: "red",
        },
      });
      label.addTo(this.vectorLayer);
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
