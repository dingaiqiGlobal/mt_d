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
          img: "/images/nav/spatialAnalysis/spatialAnalysis_inSightAnalysis.jpg",
          text: "分析-通视",
          path: "/spatialAnalysis_inSightAnalysis",
        },
        {
          id: 1,
          img: "/images/nav/spatialAnalysis/spatialAnalysis_skylineAnalysis.jpg",
          text: "分析-天际线",
          path: "/spatialAnalysis_skylineAnalysis",
        },
        {
          id: 1,
          img: "/images/nav/functionUp/functionUp_loadsvg.jpg",
          text: "icon-SVG",
          path: "/functionUp_loadsvg",
        },
        {
          id: 1,
          img: "/images/nav/functionUp/functionUp_loadsprite.jpg",
          text: "icon-雪碧图",
          path: "/functionUp_loadsprite",
        },
        {
          id: 1,
          img: "/images/nav/scene/scene_Weather.jpg",
          text: "scene-天气",
          path: "/scene_Weather",
        },
        {
          id: 1,
          img: "/images/nav/scene/scene_vignette.jpg",
          text: "scene-暗角（未暴露）",
          path: "/scene_vignette",
        },
        {
          id: 1,
          img: "/images/nav/proj4/proj4_base.jpg",
          text: "proj-转换坐标",
          path: "/proj4_base",
        },
        {
          id: 1,
          img: "/images/nav/animation/animation_routePlayer.jpg",
          text: "动画-轨迹回放",
          path: "/animation_routePlayer",
        },
        {
          id: 1,
          img: "/images/nav/animation/animation_videoSurface.jpg",
          text: "动画-视频",
          path: "/animation_videoSurface",
        },
        {
          id: 1,
          img: "/images/nav/animation/animation_view.jpg",
          text: "动画-视图-基础",
          path: "/animation_view",
        },
        {
          id: 1,
          img: "/images/nav/animation/animation_style.jpg",
          text: "动画-style驱动",
          path: "/animation_style",
        },
        {
          id: 1,
          img: "/images/nav/animation/animation_GSAP.jpg",
          text: "动画-GSAP",
          path: "/animation_GSAP",
        },
        {
          id: 1,
          img: "/images/nav/animation/animation_beat_native.jpg",
          text: "动画-原生",
          path: "/animation_beat_native",
        },

        {
          id: 1,
          img: "/images/nav/tools/ModelDraw_gltf.jpg",
          text: "绘制线-model-gltf",
          path: "/ModelDraw_gltf",
        },
        {
          id: 1,
          img: "/images/nav/tools/ModelDraw_three.jpg",
          text: "绘制线-model-three",
          path: "/ModelDraw_three",
        },
        {
          id: 1,
          img: "/images/nav/tools/ModelDraw_polyExtrude.jpg",
          text: "绘制线-model-三方库",
          path: "/ModelDraw_polyExtrude",
        },
        {
          id: 1,
          img: "/images/nav/tools/tools_interactiveCollection.jpg",
          text: "工具-编辑",
          path: "/tools_interactiveCollection",
        },
        {
          id: 1,
          img: "/images/nav/tools/tools_jsts_holes.jpg",
          text: "工具-绘制孔洞",
          path: "/tools_jsts_holes",
        },
        {
          id: 1,
          img: "/images/nav/tools/tools_measure3D.jpg",
          text: "工具-3D测量-版本",
          path: "/tools_measure3D",
        },
        {
          id: 1,
          img: "/images/nav/tools/tools_collection.jpg",
          text: "工具-测量、绘制集合",
          path: "/tools_collection",
        },
        {
          id: 1,
          img: "/images/nav/UIMarker/gifloop.jpg",
          text: "弹框-GIF",
          path: "/gifloop",
        },
        {
          id: 1,
          img: "/images/nav/UIMarker/InfoWindow_Base.jpg",
          text: "弹框-InfoWindow",
          path: "/InfoWindow_Base",
        },
        {
          id: 1,
          img: "/images/nav/UIMarker/UIMarker_Base.jpg",
          text: "弹框-UIMarker",
          path: "/UIMarker_Base",
        },
        {
          id: 1,
          img: "/images/nav/three/three_TextureLoader_Road.jpg",
          text: "three-流光线",
          path: "/three_TextureLoader_Road",
        },
        {
          id: 1,
          img: "/images/nav/terrain/terrain_colors.jpg",
          text: "three-地形颜色-版本",
          path: "/terrain_colors",
        },
        {
          id: 1,
          img: "/images/nav/three/three_Terrain.jpg",
          text: "three-地形沙盘",
          path: "/three_Terrain",
        },
        {
          id: 1,
          img: "/images/nav/three/three_GitCollection.jpg",
          text: "three-特效Git集合",
          path: "/three_GitCollection",
        },
        {
          id: 1,
          img: "/images/nav/map/map_ToJSON.jpg",
          text: "map-ToJSON",
          path: "/map_ToJSON",
        },
        {
          id: 1,
          img: "/images/nav/map/map_ToJSON.jpg",
          text: "map-tojson特殊处理",
          path: "/map_ToJSON_FromJSON",
        },
        {
          id: 1,
          img: "/images/nav/map/map_options_spatialReference.jpg",
          text: "map-设置空间参考",
          path: "/map_options_spatialReference",
        },
        {
          id: 1,
          img: "/images/nav/map/map_options.jpg",
          text: "map-参数",
          path: "/map_options",
        },
        {
          id: 1,
          img: "/images/nav/control/control_setMenu.jpg",
          text: "control-右键",
          path: "/control_setMenu",
        },
        {
          id: 1,
          img: "/images/nav/control/control_custom_save.jpg",
          text: "control-存储",
          path: "/control_custom_save",
        },
        {
          id: 1,
          img: "/images/nav/control/control_custom_scene.jpg",
          text: "控件自定义",
          path: "/control_custom_scene",
        },
        {
          id: 1,
          img: "/images/nav/control/control_collection.jpg",
          text: "control-控件集合",
          path: "/control_collection",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_vtLayer_highlightFeature.jpg",
          text: "vtLayer-feature（未API）",
          path: "/layer_vtLayer_highlightFeature",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_vtLayer_highlight_id.jpg",
          text: "vtLayer-ID高亮",
          path: "/layer_vtLayer_highlight_id",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_vtLayer_highlight_bytileload.jpg",
          text: "vtLayer-高亮",
          path: "/layer_vtLayer_highlight_bytileload",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_vtLayer_geoserver.jpg",
          text: "vtLayer_GeoServer",
          path: "/layer_vtLayer_geoserver",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_tilelayer_geoserver.jpg",
          text: "layer-切片_GeoServer",
          path: "/layer_tilelayer_geoserver",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_tilelayer_custom.jpg",
          text: "layer-自定义切片",
          path: "/layer_tilelayer_custom",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_tilelayer_TDT.jpg",
          text: "layer-天地图",
          path: "/layer_tilelayer_TDT",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_tilelayer_gcoord_offset.jpg",
          text: "layer-高德纠偏",
          path: "/layer_tilelayer_gcoord_offset",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_tilelayer_extent.jpg",
          text: "layer-范围",
          path: "/layer_tilelayer_extent",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_tilelayer_filter.jpg",
          text: "layer-过滤变色",
          path: "/layer_tilelayer_filter",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_tilelayer_mask.jpg",
          text: "layer-蒙皮mask",
          path: "/layer_tilelayer_mask",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_ExtrudePolygonLayer.jpg",
          text: "layer-挤出面-未API",
          path: "/layer_ExtrudePolygonLayer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_Mapbox_Colourful.jpg",
          text: "layer-Mapbox_Colourful",
          path: "/layer_Mapbox_Colourful",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_Mapbox_Plugin.jpg",
          text: "layer-Mapbox_Plugin",
          path: "/layer_Mapbox_Plugin",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_Mapbox.jpg",
          text: "layer-MapboxLayer",
          path: "/layer_Mapbox",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_dynamicAddToGL.jpg",
          text: "layer-矢量贴地形",
          path: "/layer_dynamicAddToGL",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_WMS.jpg",
          text: "layer-WMS参数",
          path: "/layer_WMS",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_VectorLayer.jpg",
          text: "layer-VectorLayer参数",
          path: "/layer_VectorLayer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_GroupGLLayer.jpg",
          text: "layer-GroupGLLayer参数",
          path: "/layer_GroupGLLayer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_GLTFLayer.jpg",
          text: "layer-GLTFLayer参数",
          path: "/layer_GLTFLayer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_Geo3DTilesLayer.jpg",
          text: "layer-Geo3DTilesLayer参数",
          path: "/layer_Geo3DTilesLayer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_VectorTileLayer.jpg",
          text: "layer-VectorTileLayer参数",
          path: "/layer_VectorTileLayer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_GeoJSONVectorTileLayer.jpg",
          text: "layer-GeoJSON_VT参数",
          path: "/layer_GeoJSONVectorTileLayer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_WebGL_Layer.jpg",
          text: "layer-WebGL图层(点线面)参数",
          path: "/layer_WebGL_Layer",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_WebGL_Context.jpg",
          text: "layer-WebGL图层上下文",
          path: "/layer_WebGL_Context",
        },
        {
          id: 1,
          img: "/images/nav/layer/layer_ParticleLayer.jpg",
          text: "layer-粒子图层",
          path: "/layer_ParticleLayer",
        },
        {
          id: 1,
          img: "/images/nav/gltf/gltf_ViewMonomer.jpg",
          text: "gltf-查看单体（特API）",
          path: "/gltf_ViewMonomer",
        },
        {
          id: 1,
          img: "/images/nav/gltf/gltf_DrawerEntity.jpg",
          text: "gltf-抽屉",
          path: "/gltf_DrawerEntity",
        },
        {
          id: 1,
          img: "/images/nav/gltf/gltf_GLTFLineString.jpg",
          text: "gltf-线性添加（特API）",
          path: "/gltf_GLTFLineString",
        },
        {
          id: 1,
          img: "/images/nav/gltf/gltf_drag.jpg",
          text: "gltf-拖拽",
          path: "/gltf_drag",
        },
        {
          id: 1,
          img: "/images/nav/gltf/gltf_lit.jpg",
          text: "gltf-lit批量",
          path: "/gltf_lit",
        },
        {
          id: 1,
          img: "/images/nav/3dtiles/3dtiles_LoadSeting.jpg",
          text: "3dtiles-性能设置",
          path: "/3dtiles_LoadSeting",
        },
        {
          id: 1,
          img: "/images/nav/3dtiles/3dtiles_add.jpg",
          text: "3dtiles-添加",
          path: "/3dtiles_add",
        },
        {
          id: 1,
          img: "/images/nav/3dtiles/3dtiles_view.jpg",
          text: "3dtiles-视图",
          path: "/3dtiles_view",
        },
        {
          id: 1,
          img: "/images/nav/3dtiles/3dtiles_Mask.jpg",
          text: "3dtiles-蒙层",
          path: "/3dtiles_Mask",
        },
        {
          id: 1,
          img: "/images/nav/3dtiles/3dtiles_Entity.jpg",
          text: "3dtiles-单体化",
          path: "/3dtiles_Entity",
        },
        {
          id: 1,
          img: "/images/nav/3dtiles/3dtiles_Entity_Floor.jpg",
          text: "3dtiles-楼层单体化",
          path: "/3dtiles_Entity_Floor",
        },
        {
          id: 1,
          img: "/images/nav/3dtiles/3dtiles_ServiceMethod.jpg",
          text: "3dtiles-service方式添加",
          path: "/3dtiles_ServiceMethod",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_styleJson.jpg",
          text: "symbol-styleJson",
          path: "/symbol_styleJson",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_Marker.jpg",
          text: "symbol-Marker",
          path: "/symbol_Marker",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_LineString.jpg",
          text: "symbol-LineString",
          path: "/symbol_LineString",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_Polygon.jpg",
          text: "symbol-Polygon",
          path: "/symbol_Polygon",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_GeojsonVT_Polygon.jpg",
          text: "symbol-GeojsonVTPolygon",
          path: "/symbol_GeojsonVT_Polygon",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_GeojsonVT_LineString.jpg",
          text: "symbol-GeojsonVTLineString",
          path: "/symbol_GeojsonVT_LineString",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_GeojsonVT_Marker.jpg",
          text: "symbol-GeojsonVT_Marker",
          path: "/symbol_GeojsonVT_Marker",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_Heatmap.jpg",
          text: "symbol-热力图",
          path: "/symbol_Heatmap",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_Cluster_tileclusterlayer.jpg",
          text: "symbol-聚散图分类",
          path: "/symbol_Cluster_tileclusterlayer",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_Cluster.jpg",
          text: "symbol-聚散图",
          path: "/symbol_Cluster",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_Cluster_Change.jpg",
          text: "symbol-聚散改变",
          path: "/symbol_Cluster_Change",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_GeojsonVT_Polygon_3d_extrusion.jpg",
          text: "symbol-3d挤出面",
          path: "/symbol_GeojsonVT_Polygon_3d_extrusion",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_GeojsonVT_PoineModel_MultiGLTFMarker.jpg",
          text: "symbol-MultiGLTFMarker",
          path: "/symbol_GeojsonVT_PoineModel_MultiGLTFMarker",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_GeojsonVT_MultiGLTFMarker_PluginStyle.jpg",
          text: "symbol-模型gltf-lit渲染",
          path: "/symbol_GeojsonVT_MultiGLTFMarker_PluginStyle",
        },
        {
          id: 1,
          img: "/images/nav/symbol/symbol_GeojsonVT_PoineModel_GLTFMarker.jpg",
          text: "symbol-模型GLTFMarker",
          path: "/symbol_GeojsonVT_PoineModel_GLTFMarker",
        },
        {
          id: 1,
          img: "/images/nav/style/style_pbr_JN.jpg",
          text: "style-pbr-济南",
          path: "/style_pbr_JN",
        },
        {
          id: 1,
          img: "/images/nav/style/style_pbr_Building.jpg",
          text: "style-pbr-建筑物",
          path: "/style_pbr_Building",
        },
        {
          id: 1,
          img: "/images/nav/style/style_contourLine.jpg",
          text: "style-等值线",
          path: "/style_contourLine",
        },
        {
          id: 1,
          img: "/images/nav/style/style_roadConditions3D.jpg",
          text: "style-路况3D",
          path: "/style_roadConditions3D",
        },
        {
          id: 1,
          img: "/images/nav/style/style_roadConditions.jpg",
          text: "style-路况2D",
          path: "/style_roadConditions",
        },
        {
          id: 1,
          img: "/images/nav/style/style_update_altitude_terrain.jpg",
          text: "style-海拔跟随地形",
          path: "/style_update_altitude_terrain",
        },
        {
          id: 1,
          img: "/images/nav/style/style_building_floor.jpg",
          text: "style-建筑物楼层",
          path: "/style_building_floor",
        },
        {
          id: 1,
          img: "/images/nav/style/style_bj_img.jpg",
          text: "style-bj_img",
          path: "/style_bj_img",
        },
        {
          id: 1,
          img: "/images/nav/style/style_bj_three.jpg",
          text: "style-bj_three",
          path: "/style_bj_three",
        },
        {
          id: 1,
          img: "/images/nav/style/style_hk_three.jpg",
          text: "style-hk_three",
          path: "/style_echarts_three",
        },
        {
          id: 1,
          img: "/images/nav/style/style_hk_echarts.jpg",
          text: "style-hk_echarts",
          path: "/style_echarts_hk",
        },
        {
          id: 1,
          img: "/images/nav/style/style_UniqueFeature.jpg",
          text: "style-featureStyle渲染（未API）",
          path: "/style_UniqueFeature",
        },
        {
          id: 1,
          img: "/images/nav/style/style_UniqueValue.jpg",
          text: "style-唯一值渲染",
          path: "/style_UniqueValue",
        },
        {
          id: 1,
          img: "/images/nav/style/style_BreakPointValue.jpg",
          text: "style-断点值渲染",
          path: "/style_BreakPointValue",
        },
        {
          id: 1,
          img: "/images/nav/style/style_stops.jpg",
          text: "style-3D_Stops",
          path: "/style_stops",
        },
        {
          id: 1,
          img: "/images/nav/style/style_params_collection.jpg",
          text: "style-样式参数集合",
          path: "/style_params_collection",
        },
        {
          id: 1,
          img: "/images/nav/ogc/ocg_TileLayer_ArcGIS.jpg",
          text: "ocg-TileLayer_ArcGIS",
          path: "/ocg_TileLayer_ArcGIS",
        },
        {
          id: 1,
          img: "/images/nav/ogc/ocg_TileLayer_WMTS.jpg",
          text: "ocg_TileLayer_WMTS",
          path: "/ocg_TileLayer_WMTS",
        },
        {
          id: 1,
          img: "/images/nav/ogc/ocg_TileLayer_WMS.jpg",
          text: "ocg-TileLayer_WMS",
          path: "/ocg_TileLayer_WMS",
        },
        {
          id: 1,
          img: "/images/nav/ogc/ocg_TileLayer_BD.jpg",
          text: "ocg-TileLayer_BD",
          path: "/ocg_TileLayer_BD",
        },
        {
          id: 1,
          img: "/images/nav/geometry/geo_GeometryCollection.jpg",
          text: "geo-Geometry属性",
          path: "/geo_GeometryCollection",
        },
        {
          id: 1,
          img: "/images/nav/geometry/geo_Altitude.jpg",
          text: "geo-高度",
          path: "/geo_Altitude",
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
