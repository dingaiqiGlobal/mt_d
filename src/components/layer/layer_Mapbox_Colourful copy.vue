<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-select v-model="value" @change="changeStyle">
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
import { GroupGLLayer, VectorTileLayer } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      vtLayer: null,
      options: [
        {
          value: "data/json/colourful/style_bloom.json",
          label: "贴图发光",
        },
        {
          value: "data/json/colourful/style_default_blue.json",
          label: "默认蓝",
        },
        {
          value: "data/json/colourful/style_fangbaidu.json",
          label: "百度",
        },
        {
          value: "data/json/colourful/style_fangesri.json",
          label: "ESRI",
        },
        {
          value: "data/json/colourful/style_gaoduanhui.json",
          label: "高端灰",
        },
        {
          value: "data/json/colourful/style_haiyang_blue.json",
          label: "海洋蓝",
        },
        {
          value: "data/json/colourful/style_heiye.json",
          label: "黑夜",
        },
        {
          value: "data/json/colourful/style_langmanfen.json",
          label: "浪漫粉",
        },
        {
          value: "data/json/colourful/style_qingxin_blue.json",
          label: "清新蓝",
        },
        {
          value: "data/json/colourful/style_wuye_blue.json",
          label: "午夜蓝",
        },
        {
          value: "data/json/colourful/style_ziranglv.json",
          label: "自然绿",
        },
      ],
      value: "贴图发光",
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.41439, 39.91671],
      zoom: 13,
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
      postProcess: {
        enable: true,
        antialias: {
          enable: true,
        },
        //水面开启ssr-倒影反射
        ssr: {
          enable: true,
        },
        //线路开启泛光
        bloom: {
          enable: true,
          threshold: 0,
          factor: 1,
          radius: 0.02,
        },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [], {
      sceneConfig,
    });
    this.groupLayer.addTo(this.map);
    this.addMapBoxLayer();
  },

  methods: {
    /**
     * 泛光注意事项
     * VectorTileLayer---enableBloom: true--不需要
     * sceneConfig---bloom: {enable: true}--必要
     * symbol--- "lineBloom": true,--必要
     */
    addMapBoxLayer() {
      this.vtLayer = new VectorTileLayer("mapbox_vt", {
        urlTemplate: `http://192.168.201.162:8088/geoserver/gwc/service/tms/1.0.0/zhjy%3Adongchenggroup@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`,
        tms: true, //这个参数必须设置
        style: "data/json/colourful/style_bloom.json",
        // enableBloom: true,
      });
      this.groupLayer.addLayer(this.vtLayer);
    },
    changeStyle(value) {
      this.vtLayer.setStyle(value);
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
