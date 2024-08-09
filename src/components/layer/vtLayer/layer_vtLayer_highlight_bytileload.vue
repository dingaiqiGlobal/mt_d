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

      //已经高亮的数据缓存(临时)
      const featureIdCache = new Map();

      this.geojsonVtLayer.on("tileload", (e) => {
        const layer = e.target;
        const tiles = layer.getRenderedFeatures(); //获取当前的所有的加载和渲染的要素集合***
        for (let i = 0, len = tiles.length; i < len; i++) {
          const features = tiles[i].features;
          //console.log(features);
          for (let j = 0, len1 = features.length; j < len1; j++) {
            const feature = features[j].feature;
            const id = feature.id;
            const name = feature.properties.name; //名字长度大于7的才符合要求
            if (!name || name.length < 7) {
              continue;
            }
            if (featureIdCache.has(id)) {
              continue;
            }
            //>7添加到数组
            this.highData.push({
              high: false,
              id:id,
              feature:feature,
            });
            featureIdCache.set(id, 1); //特殊
          }
        }
        //console.log(this.highData,"1111");
        this.hightLightFeature();
      });
    },
    hightLightFeature() {
      if (!this.highData.length) {
        return;
      }
      const needHighLights = this.highData
        .filter((data) => {
          return !data.high;
        })
        .map((data) => {
          data.high = true;
          return {
            name: `test-${data.id}`,
            id: data.id,
            bloom: true,
            color: "red",
            plugin: ["landuse-fill"], //only effect 'landuse-fill' render plugin
          };
        });
      this.geojsonVtLayer.highlight(needHighLights);
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
