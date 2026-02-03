/**
 * 酒店卡片组件
 * 显示酒店的基本信息，包括图片、名称、星级、地址、价格、标签
 */

import { Hotel } from '../../types/index';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 酒店数据
    hotel: {
      type: Object as any,
      value: null,
    },
    // 是否显示价格
    showPrice: {
      type: Boolean,
      value: true,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    minPrice: 0, // 最低价格
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 处理卡片点击事件
     */
    handleCardClick() {
      const hotel = this.properties.hotel as Hotel;
      if (hotel) {
        this.triggerEvent('click', { hotel });
      }
    },
  },

  /**
   * 组件生命周期函数 - 在组件实例进入页面节点树时执行
   */
  attached() {
    this.calculateMinPrice();
  },

  /**
   * 组件生命周期函数 - 在组件布局完成后执行
   */
  ready() {
    // 组件布局完成
  },

  /**
   * 组件的属性观察器
   */
  observers: {
    'hotel.roomTypes': function (roomTypes: any[]) {
      this.calculateMinPrice();
    },
  },

  /**
   * 计算最低价格
   */
  calculateMinPrice() {
    const hotel = this.properties.hotel as Hotel;
    if (hotel && hotel.roomTypes && hotel.roomTypes.length > 0) {
      // 将价格字符串转换为数字
      const prices = hotel.roomTypes.map((room) => {
        const price = typeof room.price === 'string' ? parseFloat(room.price) : room.price;
        return price;
      });
      const minPrice = Math.min(...prices);
      this.setData({
        minPrice: Math.floor(minPrice),
      });
    } else {
      // 如果没有房型数据，设置价格为 0
      this.setData({
        minPrice: 0,
      });
    }
  },
});
