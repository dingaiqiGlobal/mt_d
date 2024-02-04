import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'base_maptalks',
    component: () => import("../components/base_maptalks.vue")
  }
]

const router = new VueRouter({
  routes
})

export default router
