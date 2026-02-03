// app.ts

/**
 * 小程序全局配置
 */
interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo;
  };
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback;
}

App<IAppOption>({
  globalData: {},

  /**
   * 小程序初始化完成时触发
   */
  onLaunch() {
    console.log('易宿酒店小程序启动');
    
    // 检查小程序版本更新
    this.checkUpdate();
    
    // 初始化本地存储
    this.initStorage();
  },

  /**
   * 小程序显示时触发
   */
  onShow() {
    console.log('小程序显示');
  },

  /**
   * 小程序隐藏时触发
   */
  onHide() {
    console.log('小程序隐藏');
  },

  /**
   * 小程序发生错误时触发
   */
  onError(error: string) {
    console.error('小程序错误:', error);
  },

  /**
   * 检查小程序版本更新
   */
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();

      updateManager.onCheckForUpdate((res) => {
        console.log('检查更新:', res.hasUpdate);
      });

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          },
        });
      });

      updateManager.onUpdateFailed(() => {
        wx.showModal({
          title: '更新失败',
          content: '新版本下载失败，请检查网络后重试',
          showCancel: false,
        });
      });
    }
  },

  /**
   * 初始化本地存储
   */
  initStorage() {
    try {
      // 检查存储空间
      const storageInfo = wx.getStorageInfoSync();
      console.log('存储信息:', storageInfo);
      
      // 如果存储空间超过限制，清理旧缓存
      if (storageInfo.currentSize > 8 * 1024) { // 8MB
        console.log('存储空间不足，清理缓存');
        this.clearOldCache();
      }
    } catch (error) {
      console.error('初始化存储失败:', error);
    }
  },

  /**
   * 清理旧缓存
   */
  clearOldCache() {
    try {
      // 清理过期的缓存数据
      const keys = wx.getStorageInfoSync().keys;
      keys.forEach((key) => {
        if (key.startsWith('cache_')) {
          const data = wx.getStorageSync(key);
          if (data && data.timestamp) {
            const now = Date.now();
            const expiry = data.expiry || 5 * 60 * 1000; // 默认5分钟
            if (now - data.timestamp > expiry) {
              wx.removeStorageSync(key);
              console.log('清理过期缓存:', key);
            }
          }
        }
      });
    } catch (error) {
      console.error('清理缓存失败:', error);
    }
  },
});
