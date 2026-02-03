// pages/list/list.ts

/**
 * 酒店列表页
 */
Page({
  data: {},

  onLoad() {
    console.log('列表页加载');
  },

  onPullDownRefresh() {
    console.log('下拉刷新');
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    console.log('触底加载更多');
  },
});
