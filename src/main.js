// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import App from './App'
import router from './router'
import { AjaxPlugin,LoadingPlugin,ToastPlugin,AlertPlugin,ConfirmPlugin } from 'vux'

FastClick.attach(document.body)

Vue.config.productionTip = false

Vue.use(AjaxPlugin)
Vue.use(LoadingPlugin)
Vue.use(ToastPlugin)
Vue.use(AlertPlugin)
Vue.use(ConfirmPlugin)

//设置用户数据
Vue.prototype.user = {
	'headimg':'../assets/head.png'
}
	
//定义全局的websocket连接,登录成功之后自动连接
Vue.prototype.ws = null;
Vue.prototype.shakeHandler=null;

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')
