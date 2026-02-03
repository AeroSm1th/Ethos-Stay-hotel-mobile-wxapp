// pages/detail/detail.ts

import { DetailPageData, Hotel } from '../../types/index';
import { hotelApi } from '../../services/api';
import { storage } from '../../services/storage';
import { calculateNights } from '../../utils/format';

/**
 * 酒店详情页
 */
Page<DetailPageData, {}>({
  data: {
    hotel: null,                // 酒店详情
    loading: true,              // 加载状态
    checkIn: '',                // 入住日期
    checkOut: '',               // 离店日期
    nights: 0,                  // 间夜数
    collected: false,           // 收藏状态
    showNavHeader: false,       // 是否显示顶部导航栏
    currentImageIndex: 0,       // 当前图片索引
  },

  /**
   * 页面加载
   */
  onLoad(options: { id?: string; checkIn?: string; checkOut?: string }) {
    console.log('详情页加载，参数:', options);

    // 解析 URL 参数
    const hotelId = options.id ? parseInt(options.id) : 0;
    const checkIn = options.checkIn || this.getDefaultCheckIn();
    const checkOut = options.checkOut || this.getDefaultCheckOut();

    // 设置日期和间夜数
    this.setData({
      checkIn,
      checkOut,
      nights: calculateNights(checkIn, checkOut),
    });

    // 加载酒店详情
    if (hotelId > 0) {
      this.loadHotelDetail(hotelId);
    } else {
      wx.showToast({
        title: '酒店 ID 无效',
        icon: 'none',
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 页面滚动事件
   */
  onPageScroll(e: { scrollTop: number }) {
    const showNavHeader = e.scrollTop > 200;
    if (this.data.showNavHeader !== showNavHeader) {
      this.setData({ showNavHeader });
    }
  },

  /**
   * 加载酒店详情
   */
  async loadHotelDetail(hotelId: number) {
    try {
      this.setData({ loading: true });

      // 显示加载提示
      wx.showLoading({ title: '加载中...' });

      // 调用 API 获取酒店详情
      const hotel = await hotelApi.getHotelDetail(hotelId);

      // 对房型按价格排序（从低到高）
      if (hotel.roomTypes && hotel.roomTypes.length > 0) {
        hotel.roomTypes.sort((a, b) => {
          const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
          return priceA - priceB;
        });
      }

      // 检查收藏状态
      const collected = storage.isFavorite(hotelId);

      // 保存到浏览历史
      storage.saveHistory(hotel);

      // 更新页面数据
      this.setData({
        hotel,
        collected,
        loading: false,
      });

      wx.hideLoading();
    } catch (error) {
      console.error('加载酒店详情失败:', error);
      
      wx.hideLoading();
      wx.showModal({
        title: '加载失败',
        content: '无法加载酒店详情，请检查网络连接或稍后重试',
        showCancel: true,
        confirmText: '重试',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            // 重试
            this.loadHotelDetail(hotelId);
          } else {
            // 返回上一页
            wx.navigateBack();
          }
        },
      });

      this.setData({ loading: false });
    }
  },

  /**
   * 轮播图切换事件
   */
  onSwiperChange(e: { detail: { current: number } }) {
    this.setData({
      currentImageIndex: e.detail.current,
    });
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack();
  },

  /**
   * 切换收藏状态
   */
  handleCollect() {
    const { hotel, collected } = this.data;
    
    if (!hotel) {
      return;
    }

    if (collected) {
      // 取消收藏
      storage.removeFavorite(hotel.id);
      this.setData({ collected: false });
      wx.showToast({
        title: '已取消收藏',
        icon: 'success',
      });
    } else {
      // 添加收藏
      storage.addFavorite(hotel.id);
      this.setData({ collected: true });
      wx.showToast({
        title: '收藏成功',
        icon: 'success',
      });
    }
  },

  /**
   * 显示日期选择器
   */
  showDatePicker(e: { currentTarget: { dataset: { type: string } } }) {
    const type = e.currentTarget.dataset.type;
    const { checkIn, checkOut } = this.data;

    wx.showModal({
      title: type === 'checkIn' ? '选择入住日期' : '选择离店日期',
      content: '请使用日期选择器选择日期',
      showCancel: false,
      success: () => {
        // 这里可以集成日期选择器组件
        // 暂时使用简单的提示
        console.log('日期选择功能待实现');
      },
    });
  },

  /**
   * 滚动到房型列表
   */
  scrollToRooms() {
    wx.pageScrollTo({
      selector: '#roomTypes',
      duration: 300,
    });
  },

  /**
   * 获取默认入住日期（今天）
   */
  getDefaultCheckIn(): string {
    const today = new Date();
    return this.formatDate(today);
  },

  /**
   * 获取默认离店日期（明天）
   */
  getDefaultCheckOut(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.formatDate(tomorrow);
  },

  /**
   * 格式化日期为 YYYY-MM-DD
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 分享功能
   */
  onShareAppMessage() {
    const { hotel } = this.data;
    
    if (hotel) {
      return {
        title: `${hotel.nameCn} - 易宿酒店`,
        path: `/pages/detail/detail?id=${hotel.id}`,
        imageUrl: hotel.images && hotel.images.length > 0 ? hotel.images[0].imageUrl : '',
      };
    }

    return {
      title: '易宿酒店',
      path: '/pages/search/search',
    };
  },
});
