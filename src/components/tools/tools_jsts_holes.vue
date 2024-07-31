<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button @click="plotPolygon">标绘面</button>
      <button @click="clear">清空数据</button>
      <hr />
      <el-checkbox v-model="holeModel">孔洞模式</el-checkbox>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import Plot from "./Tools/Plot/Plot";
import { GroupGLLayer } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      plotLayer: null,
      drawTool: null,
      holeModel: false,
      hitGeometry: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
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
    this.plotLayer = new maptalks.VectorLayer("plotLayer").addTo(this.map);
  },

  methods: {
    /**
     * cnpm i jsts --save--从1.4.0版本开始，可以直接使用NPM包依赖源模块。对于大多数环境，它需要像Rollup这样的打包器才能工作。
     * 所以在public下的index.html中引入
     *
     * maptalks是个纯的地图引擎,内部没有集成任何图形几何库,这里我们使用 jsts来进行几何关系的判断,你可以可以使用其他的库turf、geolib、jsts
     * jsts是JTS 的 js版本,后端几何判断一般用JTS,这样就可以前端端统一起来了
     */

    //绘制面
    plotPolygon() {
      this.drawTool = new maptalks.DrawTool({
        mode: "Polygon",
        once: true, //一次结束
      }).addTo(this.map);
      this.drawTool.setSymbol({
        lineColor: "#327bfb",
        lineWidth: 2,
        lineOpacity: 1,
        polygonFill: "#09cff9",
        polygonOpacity: 0.3,
      });
      this.drawTool.on("drawend", (param) => {
        if (!this.hitGeometry) {
          const geometry = param.geometry;
          geometry.setId(maptalks.Util.GUID());
          //geometry.setSymbol(fillSymbol);
          this.plotLayer.addGeometry(geometry);
        }
        this.hitGeometry = null;
      });
      this.drawTool.on("mousemove", (param) => {
        if (this.holeModel) {
          this.holes(param.tempGeometry);
        }
      });
    },
    //挖洞
    holes(tempGeometry) {
      const geoJSONRender = new jsts.io.GeoJSONReader();
      const coordinates = tempGeometry.getCoordinates();
      if (coordinates.length < 3) {
        return;
      }
      if (!this.hitGeometry) {
        //判断绘制的图形属于哪个图形的洞
        const geo = geoJSONRender.read(tempGeometry.toGeoJSON());
        const filterGeo = this.plotLayer.getGeometries().filter((g) => {
          return g.getHoles().length === 0;
        });
        const geos = filterGeo.map((g) => {
          return geoJSONRender.read(g.toGeoJSON());
        });
        for (let i = 0, len = geos.length; i < len; i++) {
          if (geos[i].geometry.contains(geo.geometry)) {
            this.hitGeometry = filterGeo[i];
            break;
          }
        }
      }
      if (!this.hitGeometry) {
        return;
      }
      const polygonCoordinates = this.hitGeometry.getCoordinates();
      polygonCoordinates[1] = coordinates.map((c) => {
        return c.copy();
      });
      this.hitGeometry.setCoordinates(polygonCoordinates);
    },
    clear() {
      this.drawTool.disable();
      this.plotLayer.clear();
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
