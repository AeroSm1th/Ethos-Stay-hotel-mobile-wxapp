// pages/detail/detail.ts

/**
 * 酒店详情页
 */
Page({
  data: {},

  onLoad() {
    console.log('详情页加载');
  },

  onShareAppMessage() {
    return {
      title: '易宿酒店',
      path: '/pages/search/search',
    };
  },
});
