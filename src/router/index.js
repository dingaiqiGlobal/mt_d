import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'base_maptalks',
    component: () => import("../components/base_maptalks.vue")
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
]

const router = new VueRouter({
  routes
})

export default router
