import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  // {
  //   path: '/',
  //   name: 'base_maptalks',
  //   component: () => import("../components/base_maptalks.vue")
  // },
  {
    path: '/animation_view',
    name: 'animation_view',
    component: () => import("../components/animation/view/animation_view.vue")
  },
  {
    path: '/animation_style',
    name: 'animation_style',
    component: () => import("../components/animation/animation_style.vue")
  },
  {
    path: '/animation_GSAP',
    name: 'animation_GSAP',
    component: () => import("../components/animation/animation_GSAP.vue")
  },
  {
    path: '/animation_beat_native',
    name: 'animation_beat_native',
    component: () => import("../components/animation/animation_beat_native.vue")
  },
  {
    path: '/tools_jsts_holes',
    name: 'tools_jsts_holes',
    component: () => import("../components/tools/tools_jsts_holes.vue")
  },
  {
    path: '/tools_collection',
    name: 'tools_collection',
    component: () => import("../components/tools/tools_collection.vue")
  },
  {
    path: '/InfoWindow_Base',
    name: 'InfoWindow_Base',
    component: () => import("../components/UIMarker/InfoWindow_Base.vue")
  },
  {
    path: '/UIMarker_Base',
    name: 'UIMarker_Base',
    component: () => import("../components/UIMarker/UIMarker_Base.vue")
  },
  {
    path: '/three_TextureLoader_Road',
    name: 'three_TextureLoader_Road',
    component: () => import("../components/three/three_TextureLoader/three_TextureLoader_Road.vue")
  },
  {
    path: '/three_Terrain',
    name: 'three_Terrain',
    component: () => import("../components/three/three_Terrain/three_Terrain.vue")
  },
  {
    path: '/three_GitCollection',
    name: 'three_GitCollection',
    component: () => import("../components/three/three_GitCollection.vue")
  },
  {
    path: '/map_ToJSON',
    name: 'map_ToJSON',
    component: () => import("../components/map/map_ToJSON.vue")
  },
  {
    path: '/map_ToJSON_FromJSON',
    name: 'map_ToJSON_FromJSON',
    component: () => import("../components/map/map_ToJSON_FromJSON.vue")
  },
  {
    path: '/map_options_spatialReference',
    name: 'map_options_spatialReference',
    component: () => import("../components/map/map_options_spatialReference.vue")
  },
  {
    path: '/map_options',
    name: 'map_options',
    component: () => import("../components/map/map_options.vue")
  },
  {
    path: '/control_custom_scene',
    name: 'control_custom_scene',
    component: () => import("../components/control/control_custom_scene.vue")
  },
  {
    path: '/control_custom_save',
    name: 'control_custom_save',
    component: () => import("../components/control/control_custom_save.vue")
  },
  {
    path: '/control_collection',
    name: 'control_collection',
    component: () => import("../components/control/control_collection.vue")
  },
  {
    path: '/layer_vtLayer_geoserver',
    name: 'layer_vtLayer_geoserver',
    component: () => import("../components/layer/vtLayer/layer_vtLayer_geoserver.vue")
  },
  {
    path: '/layer_tilelayer_geoserver',
    name: 'layer_tilelayer_geoserver',
    component: () => import("../components/layer/tileLayer/layer_tilelayer_geoserver.vue")
  },
  {
    path: '/layer_tilelayer_custom',
    name: 'layer_tilelayer_custom',
    component: () => import("../components/layer/tileLayer/layer_tilelayer_custom.vue")
  },
  {
    path: '/layer_tilelayer_TDT',
    name: 'layer_tilelayer_TDT',
    component: () => import("../components/layer/tileLayer/layer_tilelayer_TDT.vue")
  },
  {
    path: '/layer_tilelayer_gcoord_offset',
    name: 'layer_tilelayer_gcoord_offset',
    component: () => import("../components/layer/tileLayer/layer_tilelayer_gcoord_offset.vue")
  },
  {
    path: '/layer_tilelayer_extent',
    name: 'layer_tilelayer_extent',
    component: () => import("../components/layer/tileLayer/layer_tilelayer_extent.vue")
  },
  {
    path: '/layer_tilelayer_filter',
    name: 'layer_tilelayer_filter',
    component: () => import("../components/layer/tileLayer/layer_tilelayer_filter.vue")
  },
  {
    path: '/layer_tilelayer_mask',
    name: 'layer_tilelayer_mask',
    component: () => import("../components/layer/tileLayer/layer_tilelayer_mask.vue")
  },
  {
    path: '/layer_ExtrudePolygonLayer',
    name: 'layer_ExtrudePolygonLayer',
    component: () => import("../components/layer/layer_ExtrudePolygonLayer.vue")
  },
  {
    path: '/layer_Mapbox_Colourful',
    name: 'layer_Mapbox_Colourful',
    component: () => import("../components/layer/layer_Mapbox_Colourful.vue")
  },
  {
    path: '/layer_Mapbox_Plugin',
    name: 'layer_Mapbox_Plugin',
    component: () => import("../components/layer/layer_Mapbox_Plugin.vue")
  },
  {
    path: '/layer_Mapbox',
    name: 'layer_Mapbox',
    component: () => import("../components/layer/layer_Mapbox.vue")
  },
  {
    path: '/layer_dynamicAddToGL',
    name: 'layer_dynamicAddToGL',
    component: () => import("../components/layer/layer_dynamicAddToGL.vue")
  },
  {
    path: '/layer_WMS',
    name: 'layer_WMS',
    component: () => import("../components/layer/layer_WMS.vue")
  },
  {
    path: '/layer_VectorLayer',
    name: 'layer_VectorLayer',
    component: () => import("../components/layer/layer_VectorLayer.vue")
  },
  {
    path: '/layer_GroupGLLayer',
    name: 'layer_GroupGLLayer',
    component: () => import("../components/layer/layer_GroupGLLayer.vue")
  },
  {
    path: '/layer_GLTFLayer',
    name: 'layer_GLTFLayer',
    component: () => import("../components/layer/layer_GLTFLayer.vue")
  },
  {
    path: '/layer_Geo3DTilesLayer',
    name: 'layer_Geo3DTilesLayer',
    component: () => import("../components/layer/layer_Geo3DTilesLayer.vue")
  },
  {
    path: '/layer_VectorTileLayer',
    name: 'layer_VectorTileLayer',
    component: () => import("../components/layer/layer_VectorTileLayer.vue")
  },
  {
    path: '/layer_GeoJSONVectorTileLayer',
    name: 'layer_GeoJSONVectorTileLayer',
    component: () => import("../components/layer/layer_GeoJSONVectorTileLayer.vue")
  },
  {
    path: '/layer_WebGL_Layer',
    name: 'layer_WebGL_Layer',
    component: () => import("../components/layer/layer_WebGL_Layer.vue")
  },
  {
    path: '/layer_WebGL_Context',
    name: 'layer_WebGL_Context',
    component: () => import("../components/layer/layer_WebGL_Context.vue")
  },
  {
    path: '/gltf_GLTFLineString',
    name: 'gltf_GLTFLineString',
    component: () => import("../components/gltf/gltf_GLTFLineString.vue")
  },
  {
    path: '/gltf_drag',
    name: 'gltf_drag',
    component: () => import("../components/gltf/gltf_drag.vue")
  },
  {
    path: '/gltf_lit',
    name: 'gltf_lit',
    component: () => import("../components/gltf/gltf_lit.vue")
  },
  {
    path: '/3dtiles_Add',
    name: '3dtiles_Add',
    component: () => import("../components/3dtiles/3dtiles_Add.vue")
  },
  {
    path: '/3dtiles_View',
    name: '3dtiles_View',
    component: () => import("../components/3dtiles/3dtiles_View.vue")
  },
  {
    path: '/3dtiles_Mask',
    name: '3dtiles_Mask',
    component: () => import("../components/3dtiles/3dtiles_Mask.vue")
  },
  {
    path: '/symbol_Marker',
    name: 'symbol_Marker',
    component: () => import("../components/symbol/symbol_Marker.vue")
  },
  {
    path: '/symbol_LineString',
    name: 'symbol_LineString',
    component: () => import("../components/symbol/symbol_LineString.vue")
  },
  {
    path: '/symbol_Polygon',
    name: 'symbol_Polygon',
    component: () => import("../components/symbol/symbol_Polygon.vue")
  },
  {
    path: '/symbol_GeojsonVT_Polygon',
    name: 'symbol_GeojsonVT_Polygon',
    component: () => import("../components/symbol/symbol_GeojsonVT_Polygon.vue")
  },
  {
    path: '/symbol_GeojsonVT_LineString',
    name: 'symbol_GeojsonVT_LineString',
    component: () => import("../components/symbol/symbol_GeojsonVT_LineString.vue")
  },
  {
    path: '/symbol_GeojsonVT_Marker',
    name: 'symbol_GeojsonVT_Marker',
    component: () => import("../components/symbol/symbol_GeojsonVT_Marker.vue")
  },
  {
    path: '/symbol_Heatmap',
    name: 'symbol_Heatmap',
    component: () => import("../components/symbol/symbol_Heatmap.vue")
  },
  {
    path: '/symbol_Cluster',
    name: 'symbol_Cluster',
    component: () => import("../components/symbol/symbol_Cluster.vue")
  },
  {
    path: '/symbol_Cluster_Change',
    name: 'symbol_Cluster_Change',
    component: () => import("../components/symbol/symbol_Cluster_Change.vue")
  },
  {
    path: '/symbol_GeojsonVT_Polygon_3d_extrusion',
    name: 'symbol_GeojsonVT_Polygon_3d_extrusion',
    component: () => import("../components/symbol/symbol_GeojsonVT_Polygon_3d_extrusion.vue")
  },
  {
    path: '/symbol_GeojsonVT_PoineModel_MultiGLTFMarker',
    name: 'symbol_GeojsonVT_PoineModel_MultiGLTFMarker',
    component: () => import("../components/symbol/symbol_GeojsonVT_PoineModel_MultiGLTFMarker.vue")
  },
  {
    path: '/symbol_GeojsonVT_MultiGLTFMarker_PluginStyle',
    name: 'symbol_GeojsonVT_MultiGLTFMarker_PluginStyle',
    component: () => import("../components/symbol/symbol_GeojsonVT_MultiGLTFMarker_PluginStyle.vue")
  },
  {
    path: '/symbol_GeojsonVT_PoineModel_GLTFMarker',
    name: 'symbol_GeojsonVT_PoineModel_GLTFMarker',
    component: () => import("../components/symbol/symbol_GeojsonVT_PoineModel_GLTFMarker.vue")
  },
  {
    path: '/style_routeplayer',
    name: 'style_routeplayer',
    component: () => import("../components/style/style_routeplayer.vue")
  },
  {
    path: '/style_update_altitude_terrain',
    name: 'style_update_altitude_terrain',
    component: () => import("../components/style/style_update_altitude_terrain.vue")
  },
  {
    path: '/style_building_floor',
    name: 'style_building_floor',
    component: () => import("../components/style/style_building_floor.vue")
  },
  {
    path: '/style_bj_img',
    name: 'style_bj_img',
    component: () => import("../components/style/style_bj_img.vue")
  },
  {
    path: '/style_bj_three',
    name: 'style_bj_three',
    component: () => import("../components/style/style_bj_three.vue")
  },
  {
    path: '/style_echarts_three',
    name: 'style_echarts_three',
    component: () => import("../components/style/style_hk_three.vue")
  },
  {
    path: '/style_echarts_hk',
    name: 'style_echarts_hk',
    component: () => import("../components/style/style_hk_echarts.vue")
  },
  {
    path: '/style_UniqueValue',
    name: 'style_UniqueValue',
    component: () => import("../components/style/style_UniqueValue.vue")
  },
  {
    path: '/style_BreakPointValue',
    name: 'style_BreakPointValue',
    component: () => import("../components/style/style_BreakPointValue.vue")
  },
]

const router = new VueRouter({
  routes
})

export default router
