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
		}, err=>{
			vue.$vux.loading.hide();
			vue.$vux.alert.show({title:'创建房间失败', content:err.message})
		});
	},
	//使用request退出房间
	outRoom:function(vue, fn) {
		if (!vue.user.uid) {
			vue.$vux.toast.text('请先登录');
			return;
		}
		vue.$vux.loading.show({text:'正在退出当前房间'})
		vue.$http.get(process.env.WS_REQ+'?action=out&uid='+vue.user.uid, {withCredentials:false}).then(res=>{
			vue.$vux.loading.hide()
			var resdata = res.data;
			if (!resdata.status) {
				//退出房间失败
				vue.$vux.toast.text(resdata.message);
			} else {
				//退出成功
				fn();
			}
		}, err=>{
			vue.$vux.loading.hide();
			vue.$vux.alert.show({title:'退出房间失败', content:err.message})
		});
	},
	//加入房间
	enterRoom:function(vue, room_no, fn) {
		if (!vue.user.uid) {
			vue.$vux.toast.text('请先登录');
			return;
		}
		vue.$vux.loading.show({text:'正在加入当前房间'})
		vue.$http.get(process.env.WS_REQ+'?action=enter&uid='+vue.user.uid+'&room_no='+room_no, {withCredentials:false}).then(res=>{
			vue.$vux.loading.hide()
			var resdata = res.data;
			if (!resdata.status) {
				//加入房间失败
				vue.$vux.toast.text(resdata.message);
			} else {
				//加入成功
				fn && fn();
			}
		}, err=>{
			vue.$vux.loading.hide();
			vue.$vux.alert.show({title:'加入房间失败', content:err.message})
		});
	},
	//获取房间信息
	roomInfo:function(vue, room_no, fn) {
		vue.$http.get(process.env.WEB_ADDR+'/room/info?room_no='+room_no,{withCredentials:true}).then(res=>{
			var resdata = res.data;
			if (!resdata.status) {
				//获取房间信息失败
				vue.$vux.alert.show({title:'获取房间信息失败', content:resdata.message});
			} else {
				//获取房间信息成功
				fn(resdata.data);
			}
		}, err=>{
			vue.$vux.alert.show({title:'获取房间信息失败', content:err.message})
		});
	},
	//获取房间用户
	roomUsers:function(vue, room_no, fn) {
		vue.$http.get(process.env.WEB_ADDR+'/room/users?room_no='+room_no,{withCredentials:true}).then(res=>{
			var resdata = res.data;
			if (!resdata.status) {
				//获取房间信息失败
				vue.$vux.alert.show({title:'获取房间用户失败', content:resdata.message});
			} else {
				//获取房间信息成功
				fn(resdata.data);
			}
		}, err=>{
			vue.$vux.alert.show({title:'获取房间用户失败', content:err.message})
		});
	},
	//发送预备命令
	prepareCmd:function(vue, room_no, fn) {
		if (!vue.user.uid) {
			vue.$vux.toast.text('请先登录');
			return;
		}
		vue.$vux.loading.show()
		vue.$http.get(process.env.WS_REQ+'?action=prepare&uid='+vue.user.uid+'&room_no='+room_no, {withCredentials:false}).then(res=>{
			vue.$vux.loading.hide()
			var resdata = res.data;
			if (!resdata.status) {
				//发送预备命令失败
				vue.$vux.alert.show({title:'预备比赛失败',content:resdata.message});
			} else {
				//发送成功
				fn && fn();
			}
		}, err=>{
			vue.$vux.loading.hide();
			vue.$vux.alert.show({title:'预备比赛失败', content:err.message})
		});
	},
	//发送开始命令
	startCmd:function(vue, room_no, fn) {
		if (!vue.user.uid) {
			vue.$vux.toast.text('请先登录');
			return;
		}
		vue.$vux.loading.show()
		vue.$http.get(process.env.WS_REQ+'?action=start&uid='+vue.user.uid+'&room_no='+room_no, {withCredentials:false}).then(res=>{
			vue.$vux.loading.hide()
			var resdata = res.data;
			if (!resdata.status) {
				//发送预备命令失败
				vue.$vux.alert.show({title:'开始比赛失败',content:resdata.message});
			} else {
				//发送成功
				fn && fn();
			}
		}, err=>{
			vue.$vux.loading.hide();
			vue.$vux.alert.show({title:'开始比赛失败', content:err.message})
		});
	},
	/**
	 * 获取比赛数据
	 * @param vue
	 * @param room_no
	 * @param runfn 正在比赛中的结果回调, max, data
	 * @param resultfn 比赛结束的结果展示回调，rank，data
	 * @returns
	 */
	listScores:function(vue, room_no, runfn, resultfn) {
		vue.$http.get(process.env.WEB_ADDR+'/room/scores?room_no='+room_no+'&uid='+vue.user.uid, {withCredentials:false}).then(res=>{
			var resdata = res.data
			if(resdata.status == 1) {
				//比赛中展示数据
				runfn && runfn(resdata.data.rank, resdata.data.result, resdata.data.max)
			} else if(resdata.status == 2) {
				//比赛结束展示数据
				resultfn && resultfn(resdata.data.rank, resdata.data.result, resdata.data.max)
			}
		})
	},
	//摇晃手机
	shakePhone:function(vue, fn) {
		const _this = this;
		//监听手机摇动事件
		if (window.DeviceMotionEvent) {
			window.addEventListener('devicemotion', deviceMotionHandler, false);
		} else {
			alert('你的设备不支持摇动');
		}
		var SHAKE_THRESHOLD = 3000;
	    var last_update = 0;
	    var y = 0; var z=0; var last_x=0; var last_y=0; var last_z=0;var x=0;
		function deviceMotionHandler(eventData) {
	        var acceleration = eventData.accelerationIncludingGravity;
	        var curTime = new Date().getTime();
	        if ((curTime - last_update) > 100) {
	            var diffTime = curTime - last_update;
	            last_update = curTime;
	            x = acceleration.x;
	            y = acceleration.y;
	            z = acceleration.z;
	            var speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;
	            if (speed > SHAKE_THRESHOLD) {
	            		fn && fn(vue)
	            }
	            last_x = x;
	            last_y = y;
	            last_z = z;
	        }
	    }
	}
}