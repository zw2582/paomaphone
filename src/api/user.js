/**
 * 用户信息管理
 */
export default {
	//用户登录
	login:function(vue, fn) {
		vue.$http.get(process.env.WEB_ADDR+'/user/login', {withCredentials:true}).then(res=>{
			console.log(res.data);
		});
	},
	/**
	 * 获取当前用户信息
	 * @param vue
	 * @param fn
	 * @returns
	 */
	current:function(vue, fn) {
		if (vue.user.uid) {
			//如果用户信息已存在则直接返回
			return fn(vue.user);
		}
		//发送请求获取当前用户信息
		vue.$http.get(process.env.WEB_ADDR+'/user/current',{withCredentials:true}).then(res=>{
			var resdata = res.data
			if (!resdata.status) {
				//没有拿到用户信息
				vue.$vux.toast.text('用户未登录');
			} else {
				vue.user.uid = resdata.data.uid
				vue.user.uname = resdata.data.uname
				vue.user.sex = resdata.data.sex
				vue.user.headimg = resdata.data.headimg
				vue.user.room_no = resdata.data.room_no
				//判断是否有需要验证的uuid,等待uuid认证后删除
				var uuid = vue.$route.query.uuid;
				if (uuid) {
					vue.$http.get(process.env.WS_ADDR+'?action=auth_confirm&uid='+vue.user.uid+"&uuid="+uuid
							,{withCredentials:false}).then(res=>{
								var resdata = res.data
								vue.$vux.toast.text(resdata.message)
					});
				}
				//回调函数
				fn(vue.user)
			}
		}, err=>{
			vue.$vux.alert.show({title:'请求当前用户信息失败', content:err.message})
		});
	},
}