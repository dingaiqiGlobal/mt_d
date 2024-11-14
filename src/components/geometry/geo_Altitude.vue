<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
export default {
  components: {},

  data() {
    return {
      map: null,
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
    //drawAltitude
    const marker = new maptalks.Marker([116.38657, 39.91317], {
      properties: {
        height: 0,
      },
      symbol: {
        textFaceName: "sans-serif",
        textName: "MapTalks",
        textFill: "#34495e",
        textSize: 20,
        textHaloColor: "white",
        textHaloRadius: 8,
      },
    });
    new maptalks.VectorLayer("marker", [marker], {
      enableAltitude: true, //一、启用高度
      altitudeProperty: "height", //二、高度字段
      drawAltitude: {
        //三、是否绘制海拔高度：标记为垂直线，线为垂直多边形（不支持collection添加方式）
        lineWidth: 1,
        lineColor: "#ffffff",
      },
    }).addTo(this.map);

    marker.setAltitude(parseFloat(300));//四、官网API未暴露出来

    //line altitude
    const line = new maptalks.LineString(
      [
        [116.37609, 39.90875],
        [116.38609, 39.90875],
        [116.39678, 39.90875],
      ],
      {
        properties: {
          height: [50, 200, 500], //五、每个顶点的单独高度
          name: "节点",
        },
        symbol: {
          lineColor: "#1bbc9b",
          lineWidth: 3,
          textName: "{name}",
          textPlacement: "vertex", //放置（节点）
        },
      }
    );
    new maptalks.VectorLayer("line", [line], {
      enableAltitude: true,
      altitudeProperty: "height",
    }).addTo(this.map);
    //line2Polygon
    const line2Polygon = new maptalks.LineString(
      [
        [116.37609, 39.89875],
        [116.38609, 39.89875],
        [116.39678, 39.89875],
      ],
      {
        properties: {
          height: [50, 200, 500],
          name: "节点",
        },
        symbol: {
          lineColor: "#000000",
          lineWidth: 3,
          textName: "{name}",
          textPlacement: "vertex",
        },
      }
    );
    new maptalks.VectorLayer("line2Polygon", [line2Polygon], {
      enableAltitude: true,
      altitudeProperty: "height",
      drawAltitude: {
        //六、每个顶点的单独高度
        polygonFill: "#ffffff",
        polygonOpacity: 0.3,
        lineWidth: 0,
      },
    }).addTo(this.map);
  },

  methods: {},
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
