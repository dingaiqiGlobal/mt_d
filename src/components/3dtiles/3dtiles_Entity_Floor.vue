<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-select v-model="value" @change="changeFloor">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, Geo3DTilesLayer, ColorMask } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      geo3DTilesLayer: null,
      masks: [],
      //UI
      options: [
        {
          value: "楼层一",
          label: "楼层一",
        },
        {
          value: "楼层二",
          label: "楼层二",
        },
        {
          value: "楼层三",
          label: "楼层三",
        },
        {
          value: "楼层四",
          label: "楼层四",
        },
      ],
      value: "楼层一",
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [108.95941, 34.21978],
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
    /**
     * 3dtiles
     */
    this.geo3DTilesLayer = new Geo3DTilesLayer("Geo3DTilesLayer", {
      geometryEvents: true,
      services: [
        {
          url: "data/3dtiles/dayanta/tileset.json",
          maximumScreenSpaceError: 1,
          ambientLight: [0.2, 0.2, 0.2],
          heightOffset: -400,
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
          coordOffset: [0, 0.00002],
        },
      ],
    });
    this.geo3DTilesLayer.once("loadtileset", (e) => {
      const extent = this.geo3DTilesLayer.getExtent(e.index);
      this.map.fitExtent(extent, 0, {
        animation: false,
      });
      this.loadEntities();
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
    this.groupLayer = new GroupGLLayer("group", [this.geo3DTilesLayer], { sceneConfig });
    this.groupLayer.addTo(this.map);
  },

  methods: {
    /**
     * ColorMask-特殊api-颜色遮罩
     */
    loadEntities() {
      let _this = this;
      fetch("data/json/XiAn/floor.json")
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          for (let i = 0; i < data.length; i++) {
            const top = Number(data[i].properties.topHeight);
            const buttom = Number(data[i].properties.buttomHeight);
            const mask = new ColorMask(data[i].geometry.coordinates, {
              symbol: {
                polygonFill: "#ea6b48",
                polygonOpacity: 0.6,
              },
              properties: data[i].properties,
              heightRange: [buttom, top], //特殊，高度区间***
            });
            _this.setEventAndInfowindow(mask);
            _this.masks.push(mask);
          }
          _this.geo3DTilesLayer.setMask(_this.masks[0]);
        });
    },
    setEventAndInfowindow(mask) {
      mask.on("mouseover mouseout", (e) => {
        let polygonFill = "#ea6b48";
        if (e.type === "mouseover") {
          polygonFill = "#2e2";
        }
        e.target.updateSymbol({
          polygonFill,
        });
      });
      const name = mask.getProperties().name;
      mask.setInfoWindow({
        title: name,
        content: `名称:${name}`,
      });
      mask.on("click", (e) => {
        const coordinate = this.getInfoWindowCoordinate(e);
        if (coordinate) {
          e.target.getInfoWindow().show(coordinate);
        }
      });
    },
    getInfoWindowCoordinate(event) {
      const { target, coordinate } = event;
      const layer = target.getLayer();
      if (!layer || !layer.identify) {
        return;
      }
      const result = layer.identify(coordinate) || [];
      const len = result.length;
      if (!len) {
        return;
      }
      const coord = result[len - 1].coordinate;
      return new maptalks.Coordinate(coord);
    },
    //UI
    changeFloor(value) {
      for (let i = 0; i < this.masks.length; i++) {
        const properties = this.masks[i].getProperties();
        if (properties.name === value) {
          const center = this.masks[i].getCenter();
          this.map.panTo(center, { animation: true });//平移到指定坐标
          this.geo3DTilesLayer.setMask(this.masks[i]);
        }
      }
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
