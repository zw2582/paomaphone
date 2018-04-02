<style scoped>
.room_head,.room_info{
	display:inline-block;
}
.room_head img {
	width:60px;
	height:60px;
	border-radius:50%;
	border:4px solid #ececec;
}
.flex-demo {
  color:#000000;
  position: relative;
  padding-top:10px;
  padding-bottom:10px;
  font-size:14px;
}
.flex-demo:after {
    content: " ";
    position: absolute;
    right: 0;
    top: 0;
    width: 1px;
    bottom: 0;
    border-right: 1px solid #C7C7C7;
    color: #C7C7C7;
    transform-origin: 100% 0;
    transform: scaleX(0.5);
}
.flex-demo:before {
    content: " ";
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 1px;
    border-top: 1px solid #D9D9D9;
    color: #D9D9D9;
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
}
</style>
<template>
	<div>
		<!-- 脑袋 
		<x-header>
			<span>房间列表</span>
		</x-header>
		
		<flexbox :gutter="0" wrap="wrap">
			<flexbox-item class="flex-demo" :span="1/2" v-for="room in rooms">
				<div class="room_head"><img :src="room.headimg" width="100%"/></div>
				<div class="room_info">
					房主:{{room.uname}}<br/>
					模式:红包模式<br/>
					加入房间》
				</div>
			</flexbox-item>
		</flexbox>-->
		<x-button @click.native="start">start</x-button>
		<x-button @click.native="end">end</x-button>
		<span>dd:{{dd}}</span>
	</div>
</template>

<script>
	import {Flexbox,FlexboxItem,XHeader,XButton} from 'vux'
	import Shake from '@/api/shake.js'
	
	export default {
		components:{Flexbox,FlexboxItem,XHeader,XButton},
		data(){
			return {
				'rooms':[
					{room_no:1,uname:'test1',headimg:'http://img.mp.itc.cn/upload/20170801/afc9309df32944129d0820121bd64c9e_th.jpg'}
				],
				dd:0
			}
		},
		methods : {
			start:function(){
				console.log('start')
				var _this = this
				Shake.bind(function(){
					var dd = _this.dd;
					_this.$set(_this, 'dd', ++dd)
				})
			},
			end:function() {
				this.$set(this, 'dd', 0)
				Shake.unbind()
			}
		}
	}
</script>