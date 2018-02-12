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

//设置全局变量
Vue.prototype.glo = {
}
Vue.prototype.baseurl = 'http://paoma.com'

//用户登录函数
Vue.prototype.login = function(call) {
	//获取用户信息
	if (!this.glo.uid) {
		const _this = this;
		this.$http.get(_this.baseurl+'/phone/site/user',{withCredentials:true}).then(function(res){
			res = res.data;
			console.log(res);
			if (res.status == 1) {
				_this.glo = res.data;
				//判断用户是否登录，loading,没有则生成登录引导页并跳转
				if(!_this.glo.uid) {
					console.log('登录失败');
				}
				call &&　call(_this.glo);
			} else {
				_this.$vux.toast.show({text:res.message});
			}
		}, function(err){
			_this.$vux.toast.show({text:'获取用户信息失败'});
		});
	} else {
		call &&　call(this.glo);
	}
}

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')
