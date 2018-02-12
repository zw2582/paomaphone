import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      alias: '/home',
      name: 'Home',
      component: Home
    },
    {
    	path: '/room',
    	name: 'room',
    	component: (resolve) => require(['@/components/Room'], resolve)
    }
  ]
})
