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
	roomInfo:function(vue, room_no, fn, errfn) {
		vue.$http.get(process.env.WEB_ADDR+'/room/info?room_no='+room_no,{withCredentials:true}).then(res=>{
			var resdata = res.data;
			if (!resdata.status) {
				//获取房间信息失败
				vue.$vux.alert.show({title:'获取房间信息失败', content:resdata.message});
				errfn && errfn()
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
	 * 获取个人排名和奖金
	 * @param vue
	 * @param room_no
	 * @param runfn 正在比赛中的结果回调, max, data
	 * @param resultfn 比赛结束的结果展示回调，rank，data
	 * @returns
	 */
	getReward:function(vue, room_no, runfn) {
		vue.$http.get(process.env.WEB_ADDR+'/room/reward?room_no='+room_no+'&uid='+vue.user.uid, {withCredentials:false}).then(res=>{
			var resdata = res.data
			if(resdata.status == 1) {
				//个人排名，奖金，积分
				runfn && runfn(resdata.data.rank, resdata.data.money, resdata.data.jifen)
			} else {
				//比赛结束展示数据
				vue.$vux.alert.show({'title':'获取个人排名错误', 'text':resdata.message})
			}
		})
	},
	//摇晃手机
	shakePhone:function(vue, callback) {
		this.vue = vue;
		this.callback = callback;
		//bind
		this.bind = function() {
			if (window.DeviceMotionEvent) {
				window.addEventListener('devicemotion', this.deviceMotionHandler);
			} else {
				this.vue.$vux.alert.show({title:'提示',content:'你的设备不支持摇动'});
			}
		}
		
		//onbind,devicemotion
		this.unbind = function() {
			window.removeEventListener('devicemotion', this.deviceMotionHandler)
		}
		
		this.SHAKE_THRESHOLD = 3000;
	    this.last_update = 0;
	    this.y = 0; this.z=0; this.last_x=0; this.last_y=0; this.last_z=0;this.x=0;
	    
	    var _this = this;
		this.deviceMotionHandler = function(eventData) {
			console.log('window click')
	        var acceleration = eventData.accelerationIncludingGravity;
	        var curTime = new Date().getTime();
	        if ((curTime - _this.last_update) > 100) {
	            var diffTime = curTime - _this.last_update;
	            _this.last_update = curTime;
	            _this.x = acceleration.x;
	            _this.y = acceleration.y;
	            _this.z = acceleration.z;
	            var speed = Math.abs(_this.x + _this.y + _this.z - _this.last_x - _this.last_y - _this.last_z) / diffTime * 10000;
	            if (speed > _this.SHAKE_THRESHOLD) {
	            		_this.callback && _this.callback()
	            }
	            _this.last_x = _this.x;
	            _this.last_y = _this.y;
	            _this.last_z = _this.z;
	        }
	    }
		return this;
	}
}