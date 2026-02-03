// pages/search/search.ts

/**
 * 酒店查询页（首页）
 */

import { Hotel } from '../../types/index';
import { hotelApi } from '../../services/api';
import { storage } from '../../services/storage';
import { formatDate, calculateNights } from '../../utils/format';
import { POPULAR_CITIES, STAR_OPTIONS, PRICE_OPTIONS, POPULAR_FACILITY_TAGS } from '../../utils/constants';
import { showError, showSuccess } from '../../utils/toast';

/**
 * 查询页数据接口
 */
interface SearchPageData {
  city: string;              // 当前选择的城市
  keyword: string;           // 搜索关键词
  checkIn: string;           // 入住日期 (YYYY-MM-DD)
  checkOut: string;          // 离店日期 (YYYY-MM-DD)
  nights: number;            // 间夜数
  starRating: number;        // 星级筛选
  priceRange: string;        // 价格区间
  selectedTags: string[];    // 选中的设施标签
  bannerHotels: Hotel[];     // Banner 酒店列表
  recommendHotels: Hotel[];  // 推荐酒店列表
  loading: boolean;          // 加载状态
  showCityPicker: boolean;   // 是否显示城市选择器
  popularCities: string[];   // 热门城市列表
  starOptions: Array<{ value: number; label: string }>; // 星级选项
  priceOptions: string[];    // 价格选项
  quickTags: string[];       // 快捷标签
}

Page<SearchPageData, {}>({
  /**
   * 页面的初始数据
   */
  data: {
    city: '北京',
    keyword: '',
    checkIn: '',
    checkOut: '',
    nights: 1,
    starRating: 0,
    priceRange: '不限',
    selectedTags: [],
    bannerHotels: [],
    recommendHotels: [],
    loading: false,
    showCityPicker: false,
    popularCities: POPULAR_CITIES,
    starOptions: STAR_OPTIONS,
    priceOptions: PRICE_OPTIONS,
    quickTags: POPULAR_FACILITY_TAGS,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    console.log('========================================');
    console.log('查询页加载 - 版本: 2024-02-03-v2');
    console.log('========================================');
    this.initPage();
  },

  /**
   * 初始化页面
   */
  initPage() {
    // 初始化日期
    this.initDates();
    
    // 加载最近选择的城市
    this.loadRecentCity();
    
    // 加载推荐酒店
    this.loadRecommendHotels();
  },

  /**
   * 初始化日期
   */
  initDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkIn = formatDate(today);
    const checkOut = formatDate(tomorrow);
    const nights = calculateNights(checkIn, checkOut);

    this.setData({
      checkIn,
      checkOut,
      nights,
    });
  },

  /**
   * 加载最近选择的城市
   */
  loadRecentCity() {
    const recentCity = storage.getRecentCity();
    if (recentCity) {
      this.setData({
        city: recentCity,
      });
    }
  },

  /**
   * 解析价格区间字符串
   * @param priceRange 价格区间字符串（如 "¥150-300"）
   * @returns { minPrice?: number, maxPrice?: number }
   */
  parsePriceRange(priceRange: string): { minPrice?: number; maxPrice?: number } {
    if (priceRange === '不限') {
      return {};
    }

    // 匹配 "¥150以下"
    const belowMatch = priceRange.match(/¥(\d+)以下/);
    if (belowMatch) {
      return { maxPrice: parseInt(belowMatch[1]) };
    }

    // 匹配 "¥600以上"
    const aboveMatch = priceRange.match(/¥(\d+)以上/);
    if (aboveMatch) {
      return { minPrice: parseInt(aboveMatch[1]) };
    }

    // 匹配 "¥150-300"
    const rangeMatch = priceRange.match(/¥(\d+)-(\d+)/);
    if (rangeMatch) {
      return {
        minPrice: parseInt(rangeMatch[1]),
        maxPrice: parseInt(rangeMatch[2]),
      };
    }

    return {};
  },

  /**
   * 加载推荐酒店
   * 根据当前筛选条件加载酒店列表
   */
  async loadRecommendHotels() {
    try {
      this.setData({ loading: true });

      const { starRating, priceRange, selectedTags } = this.data;

      // 构造查询参数
      const params: any = {
        page: 1,
        pageSize: 6,
      };

      // 添加星级筛选
      if (starRating > 0) {
        params.starRating = starRating;
      }

      // 添加价格筛选 - 解析价格区间字符串
      if (priceRange !== '不限') {
        const priceParams = this.parsePriceRange(priceRange);
        if (priceParams.minPrice !== undefined) {
          params.minPrice = priceParams.minPrice;
        }
        if (priceParams.maxPrice !== undefined) {
          params.maxPrice = priceParams.maxPrice;
        }
      }

      // 添加设施标签筛选
      if (selectedTags.length > 0) {
        params.tags = selectedTags.join(',');
      }

      console.log('查询页: 加载推荐酒店，参数:', params);

      // 获取推荐酒店
      const response = await hotelApi.getHotelList(params);

      const hotels = response.data || [];

      // 第一个作为 Banner
      const bannerHotels = hotels.slice(0, 1);
      // 其余作为推荐列表
      const recommendHotels = hotels.slice(1);

      this.setData({
        bannerHotels,
        recommendHotels,
        loading: false,
      });
    } catch (error) {
      console.error('加载推荐酒店失败:', error);
      this.setData({ loading: false });
      showError('加载推荐酒店失败');
    }
  },

  /**
   * 显示城市选择器
   */
  showCityPicker() {
    this.setData({
      showCityPicker: true,
    });
  },

  /**
   * 隐藏城市选择器
   */
  hideCityPicker() {
    this.setData({
      showCityPicker: false,
    });
  },

  /**
   * 选择城市
   */
  handleCitySelect(e: WechatMiniprogram.TouchEvent) {
    const city = e.currentTarget.dataset.city as string;
    this.setData({
      city,
      showCityPicker: false,
    });
    
    // 保存到本地存储
    storage.saveRecentCity(city);
  },

  /**
   * 处理入住日期变化
   */
  handleCheckInChange(e: WechatMiniprogram.CustomEvent) {
    const checkIn = e.detail.value as string;
    const { checkOut } = this.data;

    // 如果入住日期晚于或等于离店日期，自动调整离店日期
    if (checkIn >= checkOut) {
      const newCheckOut = new Date(checkIn);
      newCheckOut.setDate(newCheckOut.getDate() + 1);
      const checkOutStr = formatDate(newCheckOut);
      
      this.setData({
        checkIn,
        checkOut: checkOutStr,
        nights: 1,
      });
    } else {
      const nights = calculateNights(checkIn, checkOut);
      this.setData({
        checkIn,
        nights,
      });
    }
  },

  /**
   * 处理离店日期变化
   */
  handleCheckOutChange(e: WechatMiniprogram.CustomEvent) {
    const checkOut = e.detail.value as string;
    const { checkIn } = this.data;

    // 如果离店日期早于或等于入住日期，自动调整入住日期
    if (checkOut <= checkIn) {
      const newCheckIn = new Date(checkOut);
      newCheckIn.setDate(newCheckIn.getDate() - 1);
      const checkInStr = formatDate(newCheckIn);
      
      this.setData({
        checkIn: checkInStr,
        checkOut,
        nights: 1,
      });
    } else {
      const nights = calculateNights(checkIn, checkOut);
      this.setData({
        checkOut,
        nights,
      });
    }
  },

  /**
   * 处理关键词输入
   */
  handleKeywordInput(e: WechatMiniprogram.Input) {
    this.setData({
      keyword: e.detail.value,
    });
  },

  /**
   * 处理星级选择
   */
  handleStarSelect(e: WechatMiniprogram.TouchEvent) {
    const starRating = e.currentTarget.dataset.value as number;
    this.setData({
      starRating,
    });
    
    // 重新加载推荐酒店
    this.loadRecommendHotels();
  },

  /**
   * 处理价格区间选择
   */
  handlePriceSelect(e: WechatMiniprogram.TouchEvent) {
    const priceRange = e.currentTarget.dataset.value as string;
    this.setData({
      priceRange,
    });
    
    // 重新加载推荐酒店
    this.loadRecommendHotels();
  },

  /**
   * 处理快捷标签切换
   */
  handleTagToggle(e: WechatMiniprogram.TouchEvent) {
    const tag = e.currentTarget.dataset.tag as string;
    const { selectedTags } = this.data;

    console.log('=== 首页标签点击 ===');
    console.log('点击的标签:', tag);
    console.log('点击前 selectedTags:', JSON.stringify(selectedTags));

    const index = selectedTags.indexOf(tag);
    if (index > -1) {
      // 已选中，取消选中
      selectedTags.splice(index, 1);
      console.log('取消选中，新数组:', JSON.stringify(selectedTags));
    } else {
      // 未选中，添加选中
      selectedTags.push(tag);
      console.log('添加选中，新数组:', JSON.stringify(selectedTags));
    }

    this.setData({
      selectedTags: [...selectedTags],
    }, () => {
      console.log('setData 完成后 data.selectedTags:', JSON.stringify(this.data.selectedTags));
    });
    
    // 不立即重新加载推荐酒店，只在点击"搜索酒店"按钮时才筛选
  },

  /**
   * GPS 定位
   */
  handleGpsLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('定位成功:', res);
        
        // 模拟根据经纬度匹配城市
        // 实际项目中需要调用地理编码 API
        const mockCity = this.mockCityFromLocation(res.latitude, res.longitude);
        
        this.setData({
          city: mockCity,
        });
        
        storage.saveRecentCity(mockCity);
        
        showSuccess(`定位到${mockCity}`);
      },
      fail: (error) => {
        console.error('定位失败:', error);
        wx.showModal({
          title: '定位失败',
          content: '请检查定位权限或手动选择城市',
          showCancel: false,
        });
      },
    });
  },

  /**
   * 模拟根据经纬度匹配城市
   * 实际项目中应该调用地理编码 API
   */
  mockCityFromLocation(latitude: number, longitude: number): string {
    // 简单的模拟逻辑
    if (latitude > 39 && latitude < 41 && longitude > 116 && longitude < 117) {
      return '北京';
    } else if (latitude > 30 && latitude < 32 && longitude > 121 && longitude < 122) {
      return '上海';
    } else if (latitude > 22 && latitude < 24 && longitude > 113 && longitude < 114) {
      return '广州';
    } else if (latitude > 22 && latitude < 23 && longitude > 113 && longitude < 115) {
      return '深圳';
    }
    
    // 默认返回北京
    return '北京';
  },

  /**
   * 处理搜索按钮点击
   */
  handleSearch() {
    const { city, keyword, checkIn, checkOut, starRating, priceRange, selectedTags } = this.data;

    // 构造查询参数
    const params: Record<string, string> = {
      city,
      checkIn,
      checkOut,
    };

    if (keyword) {
      params.keyword = keyword;
    }

    if (starRating > 0) {
      params.starRating = String(starRating);
    }

    // 解析价格区间并添加到参数中
    if (priceRange !== '不限') {
      const priceParams = this.parsePriceRange(priceRange);
      if (priceParams.minPrice !== undefined) {
        params.minPrice = String(priceParams.minPrice);
      }
      if (priceParams.maxPrice !== undefined) {
        params.maxPrice = String(priceParams.maxPrice);
      }
    }

    if (selectedTags.length > 0) {
      params.tags = selectedTags.join(',');
    }

    // 跳转到列表页
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    wx.navigateTo({
      url: `/pages/list/list?${queryString}`,
    });
  },

  /**
   * 处理酒店卡片点击
   */
  handleHotelClick(e: WechatMiniprogram.CustomEvent) {
    const hotel = e.detail.hotel as Hotel;
    const { checkIn, checkOut } = this.data;

    wx.navigateTo({
      url: `/pages/detail/detail?id=${hotel.id}&checkIn=${checkIn}&checkOut=${checkOut}`,
    });
  },
});
