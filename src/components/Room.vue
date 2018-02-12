<template>
	<div>
		<!-- 脑袋 -->
		<x-header :right-options="{showMore:true}">房间号:{{room_no}}</x-header>
		
		<!-- 显示房主信息 -->
		<group title="房间信息">
			<cell title="房主：" :value="master_name"></cell>
		</group>
		
		<!-- 显示跑道 -->
		<ul v-if="isactive==2">
			<li v-for="score,mem in playingData">
			{{mem}}-{{score}}
			</li>
		</ul>
		<ul v-else>
			<li v-for="mem in members">
			{{mem}}
			</li>
		</ul>
		
		<!-- 房主操作 -->
		<template v-if="role=='master'">
			<x-button v-if="isactive==1" @click.native="startCmd" :gradients="['#1D62F0', '#19D5FD']">开始</x-button>
			<x-button v-if="isactive==3" @click.native="prepareCmd" :gradients="['#1D62F0', '#19D5FD']">准备</x-button>
			<span v-if="isactive==2">游戏进行中</span>
		</template>
		<template v-else>
			<span v-if="isactive==1">准备开始游戏</span>
			<span v-if="isactive==2">游戏进行中</span>
			<span v-if="isactive==3">游戏结束</span>
		</template>
		
		<!-- 开始准备框 -->
		<x-dialog v-model="showBeginDialog">
			<divider>游戏即将开始</divider>
			<div><span :style="{'font-size':'80px'}">{{beginTxt}}</span></div>
		</x-dialog>
	</div>
</template>

<script>
import {XHeader,Group,Cell,XButton,XDialog} from 'vux'

export default {
	components:{XHeader,Group,Cell,XButton,XDialog},
	data() {
		return {
			'room_no':this.$route.query.room_no,
			'shake':false,
			'role':'player',
			'master_name':'',
			'master_headimg':'',
			'master_sex':'',
			'join':false,	//是否加入成功,
			'playingData':[],	//游戏进行中数据
			'member_count':0,	//人员总数
			'members':[],	//房间内所有人员
			'ws':null,	//websocket
			'isactive':0,	//房间状态
			showBeginDialog:false,
			beginTxt:3,
		}
	},
	methods :{
		joinRoom() {
			const _this = this;
			//加入房间
			this.$vux.loading.show({text:'正在进入房间'});
			this.$http.get(this.baseurl+'/phone/site/join?room_no='+this.room_no,{withCredentials:true}).then((res)=>{
				this.$vux.loading.hide();
				res = res.data;
				if (res.status != 1) {
					this.$vux.toast.show({text:res.message, type:'warn'});
				} else {
					_this.glo.room_no = this.room_no;	//修改当前房间
					//设置用户角色
					if (res.data.role == 'master') {
						_this.$set(_this, 'role', 'master');
					} else {
						_this.$set(_this, 'role', 'player');
					}
					//比赛状态
					_this.$set(_this, 'isactive', res.data.isactive);
					if (res.data.isactive == 2) {
						_this.$set(_this, 'shake', true);
					}
					//设置房主信息
					_this.$set(_this, 'master_name', res.data.master_name);
					_this.$set(_this, 'master_headimg', res.data.master_headimg);
					_this.$set(_this, 'master_sex', res.data.master_sex);
					_this.$set(_this, 'member_count', res.data.member_count);
					_this.$set(_this, 'members', res.data.members);
					_this.$set(_this, 'join', true);
					console.log('加入房间成功');
				}
			}, (err)=>{
				this.$vux.loading.hide();
				this.$vux.toast.show({text:err, type:'warn'});
			})
		},
		//摇晃手机
		shakePhone() {
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
		                if(!_this.shake) {
		                    _this.$vux.toast.show({text:'还没有开始，别着急'});
		                } else {
		                	_this.ws.send(JSON.stringify({action:'play','uuid':_this.glo.uuid,'room_no':_this.room_no,'count':1}));
		                }
		            }
		            last_x = x;
		            last_y = y;
		            last_z = z;
		        }
		    }
		},
		//房主发出开始命令
		startCmd() {
			const _this = this;
			if (this.role == 'master') {
				if (_this.isactive == 2) {
					_this.$vux.toast.show({text:'游戏已经开始了'});
				} else if(_this.isactive == 1) {
					console.log('发送开始命令');
					_this.ws.send(JSON.stringify({action:'start',uuid:_this.glo.uuid, room_no:_this.room_no}));
					_this.$set(_this, 'isactive', 2);
				} else {
					_this.$vux.toast.show({text:'游戏还没有开始准备'});
				}
			} else {
				this.$vux.toast.show({text:'只有房主可以开始比赛'});
			}
		},
		//房主发出准备命令
		prepareCmd() {
			const _this = this;
			if (this.role == 'master') {
				if (_this.isactive == 1) {
					_this.$vux.toast.show({text:'游戏正在准备中'});
				} else if(_this.isactive == 3) {
					console.log('发送准备命令');
					_this.ws.send(JSON.stringify({action:'prepare',uuid:_this.glo.uuid, room_no:_this.room_no}));
					_this.$set(_this, 'isactive', 1);
				} else {
					_this.$vux.toast.show({text:'游戏进行中'});
				}
			} else {
				this.$vux.toast.show({text:'只有房主可以准备比赛'});
			}
		}
	},
	watch:{
		join:function(val) {
			if (val) {
				console.log('加入房间成功,开始建立socket链接');
				const _this = this;
				let wsaddr = this.glo.wsaddr;
				var ws = new WebSocket(wsaddr+'?source=phone&uuid='+this.glo.uuid);
				_this.$set(_this, 'ws', ws);

				//建立连接事件
				ws.onopen = function() {
					if (_this.glo.auth_confirm) {
						console.log('发送确认认证');
					}
				};
			
				//接受到消息事件
				ws.onmessage = function(evt) {
					var received_msg = evt.data;
					console.log("接收到消息");
					console.log(received_msg);
					if (received_msg.status == 0) {
						//消息发生错误
						_this.$vux.alert({title:'错误提示', content:received_msg.message});
					} else {
						//判断消息做出相应
						var data = received_msg.data;
						
						switch (data.action) {
							case 'start':
								//接受到比赛开始命令，三秒后开始
								var i = 3;
								_this.$set(_this, 'showBeginDialog', true);
								_this.$set(_this, 'beginTxt', i);
								var interclock = setInterval(function(){
									i--;
									_this.$set(_this, 'beginTxt', i);
									if (i == 0) {
										_this.$set(_this, 'beginTxt', '开始摇起来');
										_this.$set(_this, 'showBeginDialog', false);
										_this.$set(_this, 'isactive', 2);
										_this.$set(_this, 'shake', true);
										clearInterval(interclock);
									}
								}, 1000);
								break;
							case 'play':
								//正在进行比赛
								if (!_this.shake) {
									_this.$set(_this, 'shake', true);
								}
								if (_this.isactive != 2) {
									_this.$set(_this, 'isactive', 2);
								}
								//显示进度
								_this.$set(_this, 'playingData', data.data);
								break;
							case 'comple':
								_this.$set(_this, 'shake', false);
								_this.$set(_this, 'isactive', 3);
							case 'prepare':
								_this.$set(_this, 'shake', false);
								_this.$set(_this, 'isactive', 1);
								break;
							case 'join':
								_this.$set(_this, 'members', data.data);
								break;
							case 'member_count':
								_this.$set(_this, 'member_count', data.data);
								break;
								
						}
					}
				};
			
				//服务端关闭
				ws.onclose = function() {
					_this.$vux.alert.show({title:'系统错误',text:'服务端异常已关闭'});
				}
			}
		}
	},
	mounted() {
		//判断登录
		this.login();
		
		//进入房间
		this.joinRoom();
		
		//摇晃手机
		this.shakePhone();
	}		
}
</script>