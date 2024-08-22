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
    //底图也可以用资源代理
    const { ResourceProxy } = maptalks;
    ResourceProxy.proxy["/arcgisonline/"] = {
      target: "https://services.arcgisonline.com/ArcGIS/",
    };

    this.map = new maptalks.Map("map", {
      center: [116.94397, 40.50962],
      zoom: 12,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "/arcgisonline/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
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

    this.vectorLayer = new maptalks.VectorLayer("layer", {
      collision: true,
      collisionDelay: 250,
      debug: false,
    }).addTo(this.map);

    this.addGeomertry();
  },

  methods: {
    //资源代理-ResourceProxy
    addGeomertry() {
      const { ResourceProxy } = maptalks;
      const options = {
        sourceName: "svgs/",
        url: "images/icon/svg_collection.json",
        fill: "#0327ff",
      };
      ResourceProxy.loadSvgs(options).then((result) => {
        console.log(result);
        fetch("data/json/data_MiYun_Point.json")
          .then((res) => res.json())
          .then((geojson) => {
            const points = maptalks.GeoJSON.toGeometry(geojson);
            this.vectorLayer.addGeometry(points);
            let idx = 0;
            points.forEach((point) => {
              const icon = result[idx].name;
              point.setSymbol({
                markerType: "path", //特殊
                markerPath: `$svgs/${icon}`, //use $ get icon data
                markerPathWidth: 15,
                markerPathHeight: 15,
                markerWidth: 15,
                markerHeight: 15,
              });
              idx++;
              if (idx === result.length) {
                idx = 0;
              }
            });
          });
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
