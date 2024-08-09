<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import {
  GroupGLLayer,
  VectorTileLayer,
  GeoJSONVectorTileLayer,
} from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      geojsonVtLayer: null,

      //高亮数据
      highData: [],
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [121.50304, 31.21067],
      zoom: 12.1,
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
      environment: {
        enable: true,
        mode: 1,
        level: 0,
        brightness: 0,
      },
      postProcess: {
        enable: true,
        bloom: {
          enable: true,
          threshold: 0,
          factor: 0.6,
          radius: 1,
        },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [], {
      sceneConfig,
    });
    this.groupLayer.addTo(this.map);
    //添加图层
    this.addLayer();
  },

  methods: {
    addLayer() {
      this.geojsonVtLayer = new GeoJSONVectorTileLayer("geo", {
        style: {
          style: [
            {
              name: "landuse-fill",
              filter: true,
              renderPlugin: {
                dataConfig: {
                  type: "fill",
                },
                sceneConfig: {},
                type: "fill",
              },
              symbol: {
                polygonFill: "green",
              },
            },
          ],
        },
        features: true, //瓦片是否返回feature数据，默认只返回id
        pickGeometry: true, //拾取几何
        data: "data/json/sh/shanghai_tudi.geojson",
      });
      this.groupLayer.addLayer(this.geojsonVtLayer);

      //需要高亮的业务数据ID
      const osm_ids = ["53511131", "461440696"];

      this.geojsonVtLayer.on("tileload", (e) => {
        const layer = e.target;
        const tiles = layer.getRenderedFeatures(); //获取当前的所有的加载和渲染的要素集合***
        osm_ids.forEach((osmid) => {
          // if (hightLightMap.has(osmid)) {
          //     return;
          // }
          for (let i = 0, len = tiles.length; i < len; i++) {
            const features = tiles[i].features;
            let isHit = false;
            for (let j = 0, len1 = features.length; j < len1; j++) {
              const feature = features[j].feature;
              if (feature.properties.osm_id === osmid) {
                isHit = true;
                this.hightLightFeature(feature.id);
                break;
              }
            }
            if (isHit) {
              break;
            }
          }
        });
      });
    },
    hightLightFeature(id) {
      this.geojsonVtLayer.highlight([
        {
          name: "test" + id,
          id,
          bloom: true,
          color: "red",
          plugin: "landuse-fill",
          // ...params,
        },
      ]);
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
