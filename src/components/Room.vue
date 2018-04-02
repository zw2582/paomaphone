<style scoped>
.head-img {
	width:40px;
	height:40px;
	border-radius:50%;
	border:1px solid #ececec;
}
.road_ul {
	margin:10px;
}
.road_li {
	padding-top:10px;
}
.road {
	display:inline-block;
	width:240px;
	height:40px;
	border-bottom:1px solid #982828;
	position:relative;
}
.road .hourse {
	position:absolute;
	left:0px;
	top:7px;
	width:40px;
	height:40px;
	display:inline-block;
}
.road_li .rank {
	font-size:40px;
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
				<span style="float:right">当前人数:{{room.online}}</span>
			</div>
		</card>
		
		<!-- 显示跑道 -->
		<ul class="road_ul">
			<li v-for="(user,index) in users" class="road_li">
				<img class="head-img" :src="user.headimg" />
				<div class="road">
					<div class="hourse" :style="{left:(user.left?user.left:100+'px')}">
						<img :src="hourseimg" height="100%"/>
					</div>
				</div>
				<span class="rank">{{user.score?user.score:0}}</span>
			</li>
		</ul>
		
		<!-- 房主操作 -->
		<box gap="10px 10px">
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
		</box>
		
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
import {XHeader,Group,Cell,XButton,XDialog,Card,Divider,Box} from 'vux'
import WSAction from '@/api/ws_action.js'
import Room from '@/api/room.js'
import User from '@/api/user.js'
import ActiveHourse from '@/assets/active_hourse.gif'

export default {
	components:{XHeader,Group,Cell,XButton,XDialog,Card,Divider,Box},
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
			hourseimg:ActiveHourse,	//跑马图片
			shake:null,	//摇动器
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
		//比赛数据显示
		showRunData(data, ranks, max, min) {
			var _this = this;
			var min_max_rate = min/max;
			for(var i=0,len=_this.users.length;i<len;i++) {
				var user = _this.users[i];
				var left = 200 * data[user.uid]/max
				if (min_max_rate > 0.5) {
					left = left - 100;	//如果跑马的最低分于最高分的比值大于0.5,则长度减去一半
				}
				user.left = left+'px'
				user.score = data[user.uid];
				user.rank = ranks[user.uid]+1;
				_this.users.splice(i, 1, user);
			}
		},
		//比赛开始
		startGame(){
			//接受到比赛开始命令，三秒后开始
			var i = 3;
			var _this = this;
			_this.$set(_this, 'showBeginDialog', true);
			_this.$set(_this, 'beginTxt', i);
			var interclock = setInterval(function(){
				i--;
				_this.$set(_this, 'beginTxt', i);
				if (i == 0) {
					_this.$set(_this, 'beginTxt', '开始摇起来');
					_this.$set(_this, 'showBeginDialog', false);
					_this.$set(_this.room, 'isactive', 2);
					_this.shake.bind();	//启动摇动手机
					clearInterval(interclock);
				}
			}, 1000);
		},
		//比赛结束
		stopGame() {
			var _this = this;
			_this.shake.unbind()	//关闭摇动手机监听
			Room.getReward(_this, _this.room_no, function(rank, money, jifen){
				_this.$vux.alert.show({title:'比赛结束',content:'您的名次:'+(parseInt(rank)+1)+',奖金:'+money+',积分:'+jifen})
				_this.$set(_this.room, 'isactive', 3)
			})
		},
		testInfo() {
			var _this = this
			_this.$vux.toast.text('sd')
		}
	},
	computed: {
		isactive() {
			return this.room.isactive;
		}
	},
	destroyed: function(){
		//离开当前页面触发
		if (this.room.isactive != 2) {
			this.shake.unbind()
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
				_this.user.room_no = _this.room_no;
				_this.$set(_this, 'join', true)
			})
			//绑定摇晃器
			_this.shake = Room.shakePhone(_this, function(){
				WSAction.play(_this.ws, _this.user.uid)
			})
			//连接websocket，接受数据信息
			WSAction.conn(_this, function(ws){
				//连接成功时
				ws.onopen=function(event){
					console.log('ws连接成功')
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
								if(_this.users[i].uid == data.uid) {
									_this.users.splice(i, 1)
									_this.$set(_this.room, 'online', _this.room.online--)
								}
							}
						} else if (data.action == 'join') {
							//用户加入通知
							var exist = false;
							for(var i=0,len=_this.users.length; i<len; i++) {
								if(_this.users[i].uid == data.uid) {
									exist = true;
								}
							}
							//如果用户不存在
							if (!exist) {
								_this.users.push(data.user)
								_this.$set(_this.room, 'online', _this.room.online++)
								_this.$vux.toast.show({text:data.user.uname+'加入房间', position:'bottom', type:'text'})
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
							_this.startGame();
						} else if (data.action == 'play') {
							if(data.over == 1) {
								//比赛已结束,交给定时器去处理逻辑
							}
						} else if(data.action == 'stop') {
							//比赛结束通知
							_this.stopGame()
						} else if(data.action == 'result') {
							//比赛数据推送通知
							_this.showRunData(data.result,data.ranks,data.max,data.min)
						}
					}
				}
				//当连接结束时
				ws.onclose = function(event) {
					_this.$vux.toast.text('连接已断开')
					_this.$router.push({path:'/room', query:{'room_no':room_no}})
				}
			});
		}, function(){
			//加入房间失败回到首页
			_this.$router.push({path:'/'})
		})
	}		
}
</script>