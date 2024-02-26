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
]

const router = new VueRouter({
  routes
})

export default router
