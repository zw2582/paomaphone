<style scoped>
.head-center {
	text-align:center;
	padding-top:20px;
	color:#fff;
	font-size:18px;
}
.head-center img {
	width:100px;
	height:100px;
	border-radius:50%;
	border:4px solid #ececec;
}
</style>

<template>
	<div>
		<!-- 脑袋 -->
		<x-header>paoma</x-header>
		
		<!-- 用户头像 -->
		<blur :url="headimg">
			<p class="head-center"><img :src="headimg"/></p>
		</blur>
		
		<!-- 操作面板 -->
		<grid :cols=2>
			<grid-item @click.native="showCreateDialog=true" label="创建房间"/>
			<grid-item @click.native="joinRoom" label="加入房间"/>
			<grid-item @click.native="currentRoom" label="当前房间"/>
			<grid-item label="写评价"/>
		</grid>
		
		<box gap="10px 10px">
			<x-button @click.native="test">测试显示glo</x-button>
		</box>
		
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
import {XHeader,Blur,Grid,GridItem,XDialog,Card,XInput,XNumber,XButton,Box,Divider} from 'vux'

export default {
	components:{XHeader,Blur,Grid,GridItem,XDialog,Card,XInput,XNumber,XButton,Box,Divider},
	data(){
		return {
			headimg:'',
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
			const _this = this;
			this.$vux.confirm.prompt('', {
				'title':'输入房间号',
				onConfirm (room_no) {
					_this.$router.push({path:'/room', query:{'room_no':room_no}})
		        },
			});
			return;
			this.$vux.toast.show({text:'准备进入房间', type:'warn'});
		},
		//创建房间
		createRoom() {
			this.$set(this, "showCreateDialog", false);
			//创建房间，显示loading
			this.$vux.loading.show({text:"正在创建房间"})
			//发送请求创建房间
			this.$http.get(this.baseurl+'/phone/site/create',{withCredentials:true}).then((res)=>{
				res = res.data;
				if (res.status == 1) {
					this.$vux.loading.hide();
					let room_no = res.data.room_no;
					this.glo.room_no = room_no;	//修改当前房间
					//进入房间
					this.$router.push({path:'/room', query:{'room_no':room_no}})
				} else {
					this.$vux.loading.hide();
					this.$vux.toast.show({text:res.message, type:'warn'});
				}
			}, (err)=>{
				this.$vux.toast.show({text:err, type:'warn'})
			});
		},
		//当前房间
		currentRoom() {
			this.$router.push({path:'/room', query:{'room_no':this.glo.room_no}})
		},
		test() {
			const _this = this;
			var i = 3;
			_this.$set(_this, 'showBeginDialog', true);
			_this.$set(_this, 'beginTxt', i);
								var interclock = setInterval(function(){
									i--;
									_this.$set(_this, 'beginTxt', i);
									if (i == 0) {
										_this.$set(_this, 'beginTxt', '开始');
										_this.$set(_this, 'showBeginDialog', false);
										clearInterval(interclock);
									}
								}, 1000);
		}
	},
	mounted() {
		const _this = this;
		this.login(function(glo){
			_this.$set(_this, 'headimg', glo.headimg);
		});
	}
}
</script>