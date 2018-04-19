<template>
	<div>
		<!-- 脑袋 -->
		<x-header>
			<span>跑马吧</span>
			<span @click="backClick" slot="overwrite-left">{{leftTxt}}</span>
		</x-header>
		
		<!-- 用户头像 -->
		<blur :url="headimg">
			<p class="head-center"><img :src="headimg"/></p>
		</blur>
		
		<!-- 操作面板 -->
		<flexbox :gutter="0" wrap="wrap">
			<flexbox-item :span="1/2" @click.native="showCreate">
				<div class="flex-demo">
					<x-icon class="grid-x-icon" type="android-add" size="50"></x-icon><br/>
					<span class="f_content">创建房间</span>
				</div>
			</flexbox-item>
			<flexbox-item :span="1/2" @click.native="joinRoom">
				<div class="flex-demo">
					<x-icon class="grid-x-icon" type="android-send" size="50"></x-icon><br/>
					<span class="f_content">加入房间</span>
				</div>
			</flexbox-item>
			<flexbox-item :span="1/2" @click.native="currentRoom">
				<div class="flex-demo">
					<x-icon class="grid-x-icon" type="android-bar" size="50"></x-icon><br/>
					<span class="f_content">当前房间</span>
				</div>
			</flexbox-item>
			<flexbox-item :span="1/2" @click.native="roomList">
				<div class="flex-demo">
					<x-icon class="grid-x-icon" type="ios-list" size="50"></x-icon><br/>
					<span class="f_content">房间列表</span>
				</div>
			</flexbox-item>
			<flexbox-item :span="1/2" @click.native="go">
				<div class="flex-demo">
					<x-icon class="grid-x-icon" type="person" size="50"></x-icon><br/>
					<span class="f_content">个人中心</span>
				</div>
			</flexbox-item>
			<flexbox-item :span="1/2" @click.native="go">
				<div class="flex-demo">
					<x-icon class="grid-x-icon" type="chatboxes" size="50"></x-icon><br/>
					<span class="f_content">写评价</span>
				</div>
			</flexbox-item>
		</flexbox>
		
		<!-- <box gap="10px 10px">
			<x-button @click.native="test">测试显示glo</x-button>
		</box> -->
		
		<!-- 创建房间对话框 -->
		<x-dialog v-model="showCreateDialog" :hide-on-blur="true">
			<divider>设置奖励</divider>
			<box gap="10px 10px">
			<group>
				<x-number title="一等奖:" v-model="reward.one" type="number" fillable />
				<x-number title="二等奖:" v-model="reward.two" type="number" fillable />
				<x-number title="三等奖:" v-model="reward.three" type="number" fillable />
			</group>
			<group>
				<x-button @click.native="createRoom" :gradients="['#1D62F0', '#19D5FD']">创建</x-button>
			</group>
			</box>
		</x-dialog>
		
	</div>
</template>

<script>
import {XHeader,Blur,Grid,GridItem,XDialog,Card,XInput,XNumber,XButton,Box,Divider,Group,Flexbox,FlexboxItem} from 'vux'
import User from '@/api/user.js'
import Room from '@/api/room.js'
import headImg from '@/assets/image/head.png'
import '@/assets/css/Home.css'

export default {
	components:{XHeader,Blur,Grid,GridItem,XDialog,Card,XInput,XNumber,XButton,Box,Divider,Group,Flexbox,FlexboxItem},
	data(){
		return {
			headimg:headImg,
			uid:0,
			showCreateDialog:false,
			showJoinDialog:false,
			reward:{
				one:0.0,
				two:0.0,
				three:0.0
			},
		}
	},
	methods:{
		//进入房间
		joinRoom() {
			var _this = this;
			if (!this.user.uid) {
				this.$vux.toast.text('请先登录!'); return;
			}
			this.$vux.confirm.prompt('', {
				'title':'输入房间号',
				onConfirm (room_no) {
					if (_this.user.room_no && room_no != _this.user.room_no) {
						//请先退出当前房间
						_this.$vux.confirm.show({
							title:'提示',
							content:'是否退出当前所在房间',
							onCancel(){
								
							},
							onConfirm(){
								//确认退出当前房间
								Room.outRoom(_this, function(){
									//显示奖励设置
									_this.user.room_no=0;
									_this.$router.push({path:'/room', query:{'room_no':room_no}})
								});
							}
						})
					} else {
						//显示奖励设置
						_this.$router.push({path:'/room', query:{'room_no':room_no}})
					}
					
		        },
			});
		},
		//设置奖励
		showCreate() {
			var _this = this;
			if (!this.user.uid) {
				this.$vux.toast.text('请先登录!'); return;
			}
			if (this.user.room_no) {
				//请先退出当前房间
				this.$vux.confirm.show({
					title:'提示',
					content:'是否退出当前所在房间',
					onCancel(){
						
					},
					onConfirm(){
						//确认退出当前房间
						Room.outRoom(_this, function(){
							//显示奖励设置
							_this.user.room_no=0;
							_this.$set(_this, "showCreateDialog", true);
						});
					}
				})
			} else {
				//显示奖励设置
				this.$set(this, "showCreateDialog", true);
			}
		},
		//创建房间
		createRoom() {
			this.$set(this, "showCreateDialog", false);
			
			//发送请求创建房间
			var _this = this;
			Room.createRoom(this, function(room_no){
				_this.user.room_no = room_no;
				//进入房间
				_this.$router.push({path:'/room', query:{'room_no':room_no}})
			})
		},
		//当前房间
		currentRoom() {
			console.log('current')
			if (!this.user.room_no) {
				this.$vux.toast.text('当前没有所在房间');
				return;
			}
			this.$router.push({path:'/room', query:{'room_no':this.user.room_no}})
		},
		//房间列表
		roomList() {
			this.$router.push({path:'/room_list'})
		},
		//点击左侧按钮
		backClick() {
			if (!this.uid) {
				//用户登录
				location.href="/site/phone"
			}
		},
		test() {
			console.log(this.user);
		}
	},
	mounted() {
		const _this = this;
		//获取用户信息
		User.current(this, function(userinfo){
			_this.$set(_this, 'headimg', userinfo.headimg);
			_this.$set(_this, 'uid', userinfo.uid);
		})
	},
	computed:{
		//左侧显示文字
		leftTxt:function() {
			return this.uid?this.user.uname:'登录';
		}
	}
}
</script>