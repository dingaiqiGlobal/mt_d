<!-- 下面导航栏  -->
<template>
  <div class="nav-wrap" ref="scrollContainer" @mousewheel="MouseWheel">
    <div class="column-wrap" v-for="(item, index) in list" :key="index">
      <router-link :to="item.path">
        {{ item.text }}
        <img :src="item.img" alt="" />
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  components: {},

  data() {
    return {
      list: [
        {
          id: 1,
          img: "/images/nav/map/map_ToJSON.jpg",
          text: "map转json",
          path: "/map_ToJSON",
        },
        {
          id: 1,
          img: "/images/nav/map/map_options.jpg",
          text: "map参数",
          path: "/map_options",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_WMS.jpg",
          text: "WMS参数",
          path: "/layer_WMS",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_VectorLayer.jpg",
          text: "VectorLayer参数",
          path: "/layer_VectorLayer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_GroupGLLayer.jpg",
          text: "GroupGLLayer参数",
          path: "/layer_GroupGLLayer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_GLTFLayer.jpg",
          text: "GLTFLayer参数",
          path: "/layer_GLTFLayer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_Geo3DTilesLayer.jpg",
          text: "Geo3DTilesLayer参数",
          path: "/layer_Geo3DTilesLayer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_VectorTileLayer.jpg",
          text: "VectorTileLayer参数",
          path: "/layer_VectorTileLayer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_GeoJSONVectorTileLayer.jpg",
          text: "GeoJSON_VT参数",
          path: "/layer_GeoJSONVectorTileLayer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_WebGL_Layer.jpg",
          text: "WebGL图层(点线面)参数",
          path: "/layer_WebGL_Layer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_WebGL_Context.jpg",
          text: "WebGL图层上下文",
          path: "/layer_WebGL_Context",
        },
        {
          id: 1,
          img: "/images/nav/project/project_gltf.jpg",
          text: "gltf方法",
          path: "/project_gltf",
        },
        {
          id: 1,
          img: "/images/nav/3dtiles/3dtiles_add.jpg",
          text: "3dtiles添加",
          path: "/3dtiles_Add",
        },
        {
          id: 1,
          img: "/images/nav/3dtiles/3dtiles_view.jpg",
          text: "3dtiles视图",
          path: "/3dtiles_View",
        },
        {
          id: 1,
          img: "/images/nav/3dtiles/3dtiles_Mask.jpg",
          text: "3dtiles蒙层",
          path: "/3dtiles_Mask",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_Marker.jpg",
          text: "Marker样式",
          path: "/symbol_Marker",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_LineString.jpg",
          text: "LineString样式",
          path: "/symbol_LineString",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_Polygon.jpg",
          text: "Polygon样式",
          path: "/symbol_Polygon",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_GeojsonVT_Polygon.jpg",
          text: "GeojsonVTPolygon样式",
          path: "/symbol_GeojsonVT_Polygon",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_GeojsonVT_LineString.jpg",
          text: "GeojsonVTLineString样式",
          path: "/symbol_GeojsonVT_LineString",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_GeojsonVT_Marker.jpg",
          text: "GeojsonVT_Marker样式",
          path: "/symbol_GeojsonVT_Marker",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_Heatmap.jpg",
          text: "热力图",
          path: "/symbol_Heatmap",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_Cluster.jpg",
          text: "聚散图",
          path: "/symbol_Cluster",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_Cluster_Change.jpg",
          text: "聚散图样式改变",
          path: "/symbol_Cluster_Change",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_GeojsonVT_Polygon_3d_extrusion.jpg",
          text: "3d挤出面",
          path: "/symbol_GeojsonVT_Polygon_3d_extrusion",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_GeojsonVT_PoineModel_MultiGLTFMarker.jpg",
          text: "模型MultiGLTFMarker",
          path: "/symbol_GeojsonVT_PoineModel_MultiGLTFMarker",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_GeojsonVT_PoineModel_GLTFMarker.jpg",
          text: "模型GLTFMarker",
          path: "/symbol_GeojsonVT_PoineModel_GLTFMarker",
        },
      ],
    };
  },

  computed: {},

  mounted() {},

  methods: {
    //鼠标滚轮上下滑动时div左右滑动
    MouseWheel(e) {
      let eventDelta = -e.wheelDelta || -e.deltaY * 40;
      let $scrollWrapper = this.$refs.scrollContainer;
      // console.log($scrollWrapper.scrollLeft)
      // 0到scrollLeft为滚动区域隐藏部分
      $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4;
    },
  },
};
</script>
<style lang="less" scoped>
.nav-wrap {
  text-align: left;
  overflow: auto;
  white-space: nowrap;

  .column-wrap {
    font-size: 16px;
    display: inline-block;
    text-align: center;
    width: 170px;
    height: 130px;
    margin-top: 4px;
    margin-left: 10px;
    border: 1px solid #759dc0;
    padding: 2px 4px 4px 4px;
    background-color: #bcd8f4;
    background-image: linear-gradient(
      #ffffff 0px,
      rgba(255, 255, 255, 0) 3px,
      rgba(255, 255, 255, 0.75) 100%
    );
    box-sizing: content-box;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #86bdf2;
    }

    img {
      width: 150px;
      margin: 5px auto;
      height: 100px;
      display: block;
    }
  }

  /*包含以下四种的链接*/
  a {
    color: #000;
  }

  /*正常的未被访问过的链接*/
  a:link {
    text-decoration: none;
  }

  /*已经访问过的链接*/
  a:visited {
    text-decoration: none;
  }

  /*鼠标划过(停留)的链接*/
  a:hover {
    text-decoration: none;
  }

  /* 正在点击的链接*/
  a:active {
    text-decoration: none;
  }
}
</style>
