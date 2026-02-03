/**
 * 筛选栏组件
 * 支持星级、价格区间筛选
 */

import { FilterCriteria } from '../../types/index';
import { STAR_OPTIONS, PRICE_OPTIONS } from '../../utils/constants';
import { parsePriceRange } from '../../utils/format';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 当前筛选条件
    filters: {
      type: Object as any,
      value: {
        city: '',
        keyword: '',
        checkIn: '',
        checkOut: '',
        starRating: 0,
        minPrice: undefined,
        maxPrice: undefined,
        facilities: [],
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    starOptions: STAR_OPTIONS,
    priceOptions: PRICE_OPTIONS,
    selectedPriceIndex: 0, // 选中的价格区间索引
    tempFilters: {} as FilterCriteria, // 临时筛选条件
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 处理星级变化
     */
    handleStarChange(e: WechatMiniprogram.TouchEvent) {
      const value = e.currentTarget.dataset.value as number;
      const tempFilters = { ...this.data.tempFilters };
      tempFilters.starRating = value;
      
      this.setData({
        tempFilters,
      });
    },

    /**
     * 处理价格区间变化
     */
    handlePriceChange(e: WechatMiniprogram.TouchEvent) {
      const index = e.currentTarget.dataset.index as number;
      const value = e.currentTarget.dataset.value as string;
      
      // 解析价格区间
      const priceRange = parsePriceRange(value);
      
      const tempFilters = { ...this.data.tempFilters };
      tempFilters.minPrice = priceRange.minPrice;
      tempFilters.maxPrice = priceRange.maxPrice;
      
      this.setData({
        selectedPriceIndex: index,
        tempFilters,
      });
    },

    /**
     * 处理重置按钮点击
     */
    handleReset() {
      const tempFilters = { ...this.properties.filters } as FilterCriteria;
      tempFilters.starRating = 0;
      tempFilters.minPrice = undefined;
      tempFilters.maxPrice = undefined;
      
      this.setData({
        selectedPriceIndex: 0,
        tempFilters,
      });
    },

    /**
     * 处理确定按钮点击
     */
    handleConfirm() {
      // 触发 change 事件，传递新的筛选条件
      this.triggerEvent('change', { filters: this.data.tempFilters });
    },

    /**
     * 初始化临时筛选条件
     */
    initTempFilters() {
      const filters = this.properties.filters as FilterCriteria;
      const tempFilters = { ...filters };
      
      // 根据当前价格范围找到对应的索引
      let selectedPriceIndex = 0;
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        PRICE_OPTIONS.forEach((option, index) => {
          const range = parsePriceRange(option);
          if (
            range.minPrice === filters.minPrice &&
            range.maxPrice === filters.maxPrice
          ) {
            selectedPriceIndex = index;
          }
        });
      }
      
      this.setData({
        tempFilters,
        selectedPriceIndex,
      });
    },
  },

  /**
   * 组件生命周期函数 - 在组件实例进入页面节点树时执行
   */
  attached() {
    this.initTempFilters();
  },

  /**
   * 组件的属性观察器
   */
  observers: {
    filters: function () {
      this.initTempFilters();
    },
  },
});
