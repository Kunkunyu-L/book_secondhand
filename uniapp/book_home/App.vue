<script>
	import { baseURL } from './untils/config.js'
	export default {
		globalData: { systemConfig: {} },
		onLaunch: function() {
			// 从基础设置加载系统配置（与后台管理同源）
			uni.request({
				url: baseURL + '/home/config',
				method: 'GET',
				success: (res) => {
					if (res.data?.status === 200 && res.data?.data) {
						const app = getApp()
						if (app && app.globalData) app.globalData.systemConfig = res.data.data
					}
				}
			})
		},
		onShow: function() {
			// console.log('App Show')
		},
		onHide: function() {
			// console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	* {
		margin: 0;
		padding: 0;
		scrollbar-width: none; /* Firefox 隐藏滚动条 */
		-ms-overflow-style: none; /* IE、Edge 隐藏滚动条 */
	}
	/* WebKit 隐藏所有滚动条（保留滚动能力） */
	::-webkit-scrollbar {
		display: none;
		width: 0;
		height: 0;
	}
	page::-webkit-scrollbar,
	scroll-view::-webkit-scrollbar {
		display: none;
		width: 0;
		height: 0;
	}
	page {
	  height: 100vh;
	  margin: 0;
	  padding: 0;
	  box-sizing: border-box;
	}
	
	/* 通用容器类 - 占满屏幕（排除tabbar） */
	.full-height-container {
	  display: flex;
	  flex-direction: column;
	  height: 100vh;
	  width: 100%;
	  box-sizing: border-box;
	  margin: 0;
	  padding: 0;
	}
	
	/* 可滚动内容区 - 核心样式 */
	.scroll-content {
	  flex: 1;
	  width: 100%;
	  overflow-y: auto; /* 允许垂直滚动 */
	  overflow-x: hidden; /* 禁止水平滚动 */
	  margin: 0;
	  padding: 0;
	  box-sizing: border-box;
	  
	  /* 隐藏滚动条 - 兼容多平台 */
	  /* H5/APP端 */
	  &::-webkit-scrollbar {
	    display: none;
	    width: 0;
	    height: 0;
	  }
	  /* 微信小程序 */
	  -ms-overflow-style: none;
	  scrollbar-width: none;
	}
	
	/* 底部TabBar通用样式 */
	.tabbar-container {
	  height: 50px;
	  width: 100%;
	  margin: 0;
	  padding: 0;
	  box-sizing: border-box;
	}
	
	/* TabBar 页内容区：占满导航栏下方到 TabBar 上方，无安全距离、无底部留白 */
	.tabbar-content {
	  height: calc(100vh - 50px);
	  width: 100%;
	  overflow-y: auto;
	  overflow-x: hidden;
	  margin: 0;
	  padding: 0;
	  box-sizing: border-box;
	}
	.tabbar-content::-webkit-scrollbar { display: none; width: 0; height: 0; }
</style>
