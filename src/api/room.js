/**
 * 房间信息管理
 */
import WSAction from '@/api/ws_action.js'

export default {
	//创建房间
	createRoom:function(vue, fn){
		//创建房间，显示loading
		vue.$vux.loading.show({text:"正在创建房间"})
		vue.$http.get(process.env.WEB_ADDR+'/room/create',{withCredentials:true}).then(res=>{
			vue.$vux.loading.hide();
			var resdata = res.data;
			if (!resdata.status) {
				//创建房间失败
				vue.$vux.toast.text(resdata.message);
			} else {
				//创建成功返回roomno
				fn(resdata.data);
			}
		});
	},
	//使用request退出房间
	outRoom:function(vue, fn) {
		if (!vue.user.uid) {
			vue.$vux.toast.text('请先登录');
			return;
		}
		vue.$vux.loading.show({text:'正在退出当前房间'})
		vue.$http.get(process.env.WS_ADDR+'?action=out&uid='+vue.user.uid, {withCredentials:false}).then(res=>{
			vue.$vux.loading.hide()
			var resdata = res.data;
			if (!resdata.status) {
				//退出房间失败
				vue.$vux.toast.text(resdata.message);
			} else {
				//退出成功
				fn();
			}
		});
	}
}