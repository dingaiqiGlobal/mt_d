<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, GeoJSONVectorTileLayer } from "@maptalks/gl-layers";
import { ClampToEdgeWrapping } from "three";

export default {
  components: {},

  data() {
    return {
      map: null,
      geometry: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
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
     *map设置右键菜单（自定义）
     */
    //
    const options = {
      custom: true, //是否自定义
      items: `<ul class="custom_menu">
                <li onclick="clickItem(this)">Locate</li>
                <li onclick="clickItem(this)">Mark</li>
                <li onclick="clickItem(this)">Identify</li>
                <li onclick="clickItem(this)">About</li>
            </ul>`,
    };
    this.map.setMenu(options);
    //this.map.setMenu(options).openMenu();//直接开启
    this.geometry = new maptalks.Marker([116.38657, 39.91317], {
      draggable: true, //vectorLayer下Geometry才有拖拽
      editable: true,
      cursor: "pointer",
      symbol: {
        markerType: "ellipse",
        markerFill: {
          type: "linear",
          places: [0, 0, 1, 1],
          colorStops: [
            [0.0, "#fff"],
            [0.5, "#fff27e"],
            [1, "#f87e4b"],
          ],
        },
        markerLineWidth: 0,
        markerWidth: 30,
        markerHeight: 30,
      },
    });
    new maptalks.VectorLayer("vector", [this.geometry]).addTo(this.map);
    /**
     * 图形-geometry右键菜单（原生）,
     * 只能是在geometry上
     * 矢量图层可以，geojsonVT等待验证
     */
    const geoOptions = {
      items: [
        {
          item: "item1",
          click: function () {
            alert("Click item1");
          },
        },
        "-",
        {
          item: "item2",
          click: function () {
            alert("Click item2");
          },
        },
      ],
    };
    this.geometry.setMenu(geoOptions);
  },

  methods: {
    clickItem(dom) {
      console.log(dom);
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
.custom_menu {
  width: 90px;
  color: #fff;
  background-color: #051127;
  border: 1px solid #0c2c45;
  list-style: none;
  padding: 0;
}

.custom_menu li {
  padding: 0 8px;
  font-size: 12px;
  line-height: 24px;
}

.custom_menu li:hover {
  background: #0e595e;
  cursor: pointer;
}

.custom_menu li + li {
  border-top: 1px solid #bbb;
}
</style>
