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
    path: '/map_options',
    name: 'map_options',
    component: () => import("../components/map/map_options.vue")
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
    path: '/project_gltf',
    name: 'project_gltf',
    component: () => import("../components/project/project_gltf.vue")
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
]

const router = new VueRouter({
  routes
})

export default router
