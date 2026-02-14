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
</style>
