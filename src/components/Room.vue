<style scoped>
.head-img {
	width:40px;
	height:40px;
	border-radius:50%;
	border:1px solid #ececec;
}
</style>
<template>
	<div>
		<!-- 脑袋 -->
		<x-header :right-options="{showMore:true}">房间号:{{room_no}}</x-header>
		
		<!-- 显示房主信息 -->
		<card>
			<span slot="header">房间信息</span>
			<div slot="content">
				<span>房主:{{room.uname}}</span>
				<span>当前人数:{{room.online}}</span>
			</div>
		</card>
		
		<!-- 显示跑道 -->
		<ul>
			<li v-for="(user,index) in users">
			{{index}}--<img class="head-img" :src="user.headimg" />--{{user.score}}
			</li>
		</ul>
		
		<!-- 房主操作 -->
		<template v-if="user.uid==room.uid">
			<x-button v-if="room.isactive==1" @click.native="startCmd" :gradients="['#1D62F0', '#19D5FD']">开始</x-button>
			<x-button v-if="room.isactive==3" @click.native="prepareCmd" :gradients="['#1D62F0', '#19D5FD']">准备</x-button>
			<span v-if="room.isactive==2">游戏进行中</span>
		</template>
		<template v-else>
			<span v-if="room.isactive==1">准备开始游戏</span>
			<span v-if="room.isactive==2">游戏进行中</span>
			<span v-if="room.isactive==3">游戏结束</span>
		</template>
		
		<!-- 开始准备框 -->
		<x-dialog v-model="showBeginDialog">
			<divider>游戏即将开始</divider>
			<div><span :style="{'font-size':'80px'}">{{beginTxt}}</span></div>
		</x-dialog>
		
		<!-- 模拟摇晃
		<x-button @click.native="testShake">摇晃</x-button>
		<x-button @click.native="testInfo">显示信息</x-button> -->
	</div>
</template>

<script>
import {XHeader,Group,Cell,XButton,XDialog,Card,Divider} from 'vux'
import WSAction from '@/api/ws_action.js'
import Room from '@/api/room.js'
import User from '@/api/user.js'

export default {
	components:{XHeader,Group,Cell,XButton,XDialog,Card,Divider},
	data() {
		return {
			room_no:this.$route.query.room_no,
			user:this.user,
			room:{
				uname:'',
				isactive:3
			},
			join:false,	//是否加入成功,
			showBeginDialog:false,
			beginTxt:3,
			users:[],
		}
	},
	methods :{
		//加入房间
		joinRoom() {
			var _this = this;
			if(!this.join) {
				Room.enterRoom(this, this.room_no, function(){
					_this.$vux.toast.text('成功加入房间')
					_this.$set(_this, 'join', true)
				})
			} else {
				_this.$vux.toast.text('您已是房间内成员')
			}
		},
		//房主发出开始命令
		startCmd() {
			if (this.user.uid != this.room.uid) {
				this.$vux.toast.show('只有房主才能操作')
			} else {
				Room.startCmd(this, this.room_no)
			}
		},
		//房主发出准备命令
		prepareCmd() {
			console.log('点击准备按钮')
			if (this.user.uid != this.room.uid) {
				this.$vux.toast.show('只有房主才能操作')
			} else {
				Room.prepareCmd(this, this.room_no)
			}
		},
		//模拟摇晃
		testShake() {
			const _this = this;
			if(_this.room.isactive != 2) {
		    		_this.$vux.toast.show({text:'还没有开始，别着急'});
		    } else {
		    		WSAction.play(_this.ws, _this.user.uid)
		    }
		},
		testInfo() {
			console.log(this.room)
			console.log(this.users)
		}
	},
	watch:{
		isactive:function(val){
			var _this = this;
			if (val == 2) {
				var interclock = setInterval(function(){
					//比赛开始，拉取比赛数据
					Room.listScores(_this, _this.room_no, function(rank, data, max){
						for(var i=0,len=_this.users.length;i<len;i++) {
							var user = _this.users[i];
							user.rate = data[user.uid]/max;
							user.score = data[user.uid];
							_this.users.splice(i, 1, user);
						}
					}, function(rank, data, max){
						clearInterval(interclock);
						_this.$vux.alert.show({title:'比赛结束',content:'您的名次:'+(parseInt(rank)+1)})
						_this.$set(_this.room, 'isactive', 3)
					})
				}, 500);
			}
		}
	},
	computed: {
		isactive() {
			return this.room.isactive;
		}
	},
	mounted() {
		var _this = this;
		//获取用户信息
		User.current(this, function(userinfo){
			_this.$set(_this, 'user', userinfo);
		})
		//当前房间号
		var room_no = this.$route.query.room_no;
		//获取房间信息
		Room.roomInfo(this, room_no, function(roominfo){
			_this.$set(_this, 'room', roominfo)
			//获取房间用户
			Room.roomUsers(_this, room_no, function(users){
				_this.$set(_this, 'users', users)
				_this.$set(_this.room, 'online', users.length)
			})
			//加入房间
			Room.enterRoom(_this, room_no, function(){
				_this.$set(_this, 'join', true)
			})
			//摇晃手机
			Room.shakePhone(_this, function(vue){
				if(vue.room.isactive != 2) {
	                _this.$vux.toast.show({text:'还没有开始，别着急'});
	            } else {
	            		WSAction.play(_this.ws, _this.user.uid)
	            }
			});
		})
		
		//连接websocket，接受数据信息
		WSAction.conn(this, function(ws){
			//连接成功时
			ws.onopen=function(event){
				_this.$vux.toast.text('ws连接成功');
			}
			//当发送消息时
			ws.onmessage = function(evt) {
				//处理消息
				var received_msg = evt.data;
				console.log("接收到消息");
				console.log(received_msg);
				var msg = JSON.parse(received_msg);
				if (!msg.status || msg.status == 0) {
					_this.$vux.alert.show({title:'ws报错', content:msg.message})
				} else {
					var data = msg.data;
					if (data.action == 'exit_room') {
						//用户离开通知
						for(i=0,len=_this.users.length; i<len; i++) {
							if(_this.users[j].uid == data.uid) {
								_this.users.splice(j, 1)
								_this.$set(_this.room, 'online', _this.room.online--)
							}
						}
						_this.$set(_this, 'room.online', _this.users.length)
					} else if (data.action == 'join') {
						//用户加入通知
						var exist = false;
						for(var i=0,len=_this.users.length; i<len; i++) {
							if(_this.users[j].uid == data.uid) {
								exist = true;
							}
						}
						//如果用户不存在
						if (!exist) {
							_this.users.push(data.user)
							_this.$set(_this.room, 'online', _this.room.online++)
							_this.$vux.toast.text(data.user.uname+'加入房间')
						}
					} else if (data.action == 'prepare') {
						//房间预备通知
						_this.$set(_this.room, 'isactive', 1)
						_this.$vux.toast.text('准备中')
						//获取房间用户
						Room.roomUsers(_this, room_no, function(users){
							_this.$set(_this, 'users', users)
							_this.$set(_this.room, 'online', users.length)
						})
					} else if (data.action == 'start') {
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
								_this.$set(_this.room, 'isactive', 2);
								clearInterval(interclock);
							}
						}, 1000);
					} else if (data.action == 'play') {
						if(data.over == 1) {
							//比赛已结束,交给定时器去处理逻辑
						}
					}
				}
			}
			//当连接结束时
			ws.onclose = function(event) {
				_this.$vux.toast.text('连接已断开')
				_this.$router.push({path:'/room', query:{'room_no':room_no}})
			}
		});
	}		
}
</script>