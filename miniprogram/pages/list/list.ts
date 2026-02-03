// pages/list/list.ts

import { Hotel, FilterCriteria } from '../../types/index';
import { hotelApi } from '../../services/api';
import { PAGE_SIZE, SORT_OPTIONS, STAR_OPTIONS, PRICE_OPTIONS } from '../../utils/constants';
import { calculateNights } from '../../utils/format';

/**
 * 列表页数据接口
 */
interface ListPageData {
  hotels: Hotel[];           // 酒店列表
  total: number;             // 总数
  page: number;              // 当前页码
  pageSize: number;          // 每页数量
  hasMore: boolean;          // 是否有更多数据
  loading: boolean;          // 加载状态
  loadingMore: boolean;      // 加载更多状态
  error: string;             // 错误信息
  filters: FilterCriteria;   // 筛选条件
  nights: number;            // 间夜数
  sortBy: string;            // 排序方式
  sortOptions: typeof SORT_OPTIONS; // 排序选项
  quickTags: string[];       // 快捷标签
  selectedTags: string[];    // 选中的标签
  allHotels: Hotel[];        // 所有酒店（用于筛选）
  starOptions: typeof STAR_OPTIONS; // 星级选项
  priceOptions: typeof PRICE_OPTIONS; // 价格选项
  selectedStarRating: number; // 选中的星级
  selectedPriceRange: string; // 选中的价格区间
}

/**
 * 酒店列表页
 */
Page<ListPageData, {}>({
  data: {
    hotels: [],
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    hasMore: true,
    loading: false,
    loadingMore: false,
    error: '',
    filters: {
      city: '',
      keyword: '',
      checkIn: '',
      checkOut: '',
      starRating: 0,
    },
    nights: 1,
    sortBy: 'popular',
    sortOptions: SORT_OPTIONS,
    quickTags: [],
    selectedTags: [],
    allHotels: [],
    starOptions: STAR_OPTIONS,
    priceOptions: PRICE_OPTIONS,
    selectedStarRating: 0,
    selectedPriceRange: '不限',
  },

  /**
   * 页面加载
   */
  onLoad(options: Record<string, string>) {
    console.log('列表页加载，参数:', options);

    // 解析 URL 查询参数（需要解码 URL 编码的参数）
    const filters: FilterCriteria = {
      city: options.city ? decodeURIComponent(options.city) : '',
      keyword: options.keyword ? decodeURIComponent(options.keyword) : '',
      checkIn: options.checkIn || '',
      checkOut: options.checkOut || '',
      starRating: options.starRating ? parseInt(options.starRating) : 0,
    };

    // 解析价格区间
    let selectedPriceRange = '不限';
    if (options.minPrice) {
      filters.minPrice = parseInt(options.minPrice);
    }
    if (options.maxPrice) {
      filters.maxPrice = parseInt(options.maxPrice);
    }
    // 根据 minPrice 和 maxPrice 反推价格区间字符串
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      selectedPriceRange = this.getPriceRangeLabel(filters.minPrice, filters.maxPrice);
    }

    // 解析设施标签
    let selectedTags: string[] = [];
    if (options.tags) {
      selectedTags = decodeURIComponent(options.tags).split(',').filter(tag => tag.trim());
    }

    // 计算间夜数
    const nights = filters.checkIn && filters.checkOut
      ? calculateNights(filters.checkIn, filters.checkOut)
      : 1;

    console.log('列表页初始化数据:');
    console.log('  selectedStarRating:', filters.starRating || 0);
    console.log('  selectedPriceRange:', selectedPriceRange);
    console.log('  selectedTags:', selectedTags);
    console.log('  starOptions:', STAR_OPTIONS);
    console.log('  priceOptions:', PRICE_OPTIONS);

    this.setData({
      filters,
      nights,
      selectedTags,
      selectedStarRating: filters.starRating || 0,
      selectedPriceRange,
    });

    // 加载酒店数据
    this.loadHotels(false);
  },

  /**
   * 加载酒店数据
   * @param append 是否追加到现有列表
   */
  async loadHotels(append: boolean) {
    const { filters, page, pageSize, hotels } = this.data;

    // 设置加载状态
    if (append) {
      this.setData({ loadingMore: true });
    } else {
      this.setData({ loading: true, error: '' });
      wx.showLoading({ title: '加载中...' });
    }

    try {
      // 调用 API 获取酒店列表
      const response = await hotelApi.getHotelList({
        page,
        pageSize,
        keyword: filters.keyword || undefined,
        city: filters.city || undefined,
        starRating: filters.starRating || undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });

      console.log('酒店列表响应:', response);

      // 更新数据
      const newHotels = append ? [...hotels, ...response.data] : response.data;
      const hasMore = response.page < response.totalPages;

      // 保存所有酒店数据（用于筛选）
      const allHotels = append ? [...this.data.allHotels, ...response.data] : response.data;

      // 提取快捷标签
      const quickTags = this.extractQuickTags(allHotels);

      this.setData({
        hotels: newHotels,
        allHotels,
        total: response.total,
        hasMore,
        loading: false,
        loadingMore: false,
        quickTags,
      });

      // 如果没有数据，显示提示
      if (response.total === 0) {
        this.setData({ error: '暂无符合条件的酒店' });
      }
    } catch (error: any) {
      console.error('加载酒店列表失败:', error);

      this.setData({
        loading: false,
        loadingMore: false,
        error: error.message || '加载失败，请稍后重试',
      });

      wx.showToast({
        title: '加载失败',
        icon: 'none',
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('下拉刷新');

    // 重置分页状态
    this.setData({
      page: 1,
      hasMore: true,
    });

    // 重新加载数据
    this.loadHotels(false).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 触底加载更多
   */
  onReachBottom() {
    console.log('触底加载更多');

    const { hasMore, loadingMore } = this.data;

    // 如果没有更多数据或正在加载，则不处理
    if (!hasMore || loadingMore) {
      return;
    }

    // 增加页码
    this.setData({
      page: this.data.page + 1,
    });

    // 加载下一页数据
    this.loadHotels(true);
  },

  /**
   * 点击酒店卡片，跳转到详情页
   */
  handleHotelClick(e: any) {
    const { hotel } = e.detail;
    const { filters } = this.data;

    console.log('点击酒店:', hotel);

    // 跳转到详情页，传递酒店 ID 和查询参数
    wx.navigateTo({
      url: `/pages/detail/detail?id=${hotel.id}&checkIn=${filters.checkIn}&checkOut=${filters.checkOut}`,
    });
  },

  /**
   * 显示筛选条件修改弹窗
   */
  showFilterModal() {
    // 使用 wx.showModal 或自定义弹窗组件
    // 这里简化实现，直接跳转回查询页
    const { filters } = this.data;

    wx.navigateBack({
      success: () => {
        // 返回查询页后，查询页会保留之前的筛选条件
      },
      fail: () => {
        // 如果无法返回（比如是从分享进入的），则跳转到查询页
        wx.redirectTo({
          url: `/pages/search/search?city=${filters.city}&checkIn=${filters.checkIn}&checkOut=${filters.checkOut}`,
        });
      },
    });
  },

  /**
   * 切换排序方式
   */
  handleSort(e: any) {
    const { sortby } = e.currentTarget.dataset;
    console.log('切换排序方式:', sortby);

    this.setData({ sortBy: sortby });

    // 执行本地排序
    this.sortHotels(sortby);
  },

  /**
   * 本地排序酒店列表
   */
  sortHotels(sortBy: string) {
    const { hotels } = this.data;
    let sortedHotels = [...hotels];

    switch (sortBy) {
      case 'popular':
        // 欢迎度排序（按 ID 升序，模拟欢迎度）
        sortedHotels.sort((a, b) => a.id - b.id);
        break;

      case 'distance':
        // 位置距离排序（按 ID 升序，模拟距离）
        sortedHotels.sort((a, b) => a.id - b.id);
        break;

      case 'price':
        // 价格/星级排序（按最低价格升序）
        sortedHotels.sort((a, b) => {
          const priceA = this.getMinPrice(a);
          const priceB = this.getMinPrice(b);
          return priceA - priceB;
        });
        break;

      default:
        break;
    }

    this.setData({ hotels: sortedHotels });
  },

  /**
   * 获取酒店最低价格
   */
  getMinPrice(hotel: Hotel): number {
    if (!hotel.roomTypes || hotel.roomTypes.length === 0) {
      return 0;
    }
    // 将价格字符串转换为数字
    const prices = hotel.roomTypes.map((room) => {
      const price = typeof room.price === 'string' ? parseFloat(room.price) : room.price;
      return price;
    });
    return Math.min(...prices);
  },

  /**
   * 提取快捷标签（从酒店设施中提取常见设施）
   */
  extractQuickTags(hotels: Hotel[]): string[] {
    const facilityCount: Record<string, number> = {};

    // 统计所有设施出现的次数
    hotels.forEach((hotel) => {
      if (hotel.facilities && hotel.facilities.length > 0) {
        hotel.facilities.forEach((facility) => {
          facilityCount[facility] = (facilityCount[facility] || 0) + 1;
        });
      }
    });

    // 按出现次数排序，取前 6 个
    const sortedFacilities = Object.entries(facilityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map((entry) => entry[0]);

    return sortedFacilities;
  },

  /**
   * 点击快捷标签
   */
  handleTagClick(e: any) {
    const { tag } = e.currentTarget.dataset;
    const { selectedTags } = this.data;

    console.log('=== 列表页标签点击 ===');
    console.log('点击的标签:', tag);
    console.log('点击前 selectedTags:', JSON.stringify(selectedTags));

    // 切换标签选中状态
    let newSelectedTags: string[];
    if (selectedTags.includes(tag)) {
      // 取消选中
      newSelectedTags = selectedTags.filter((t) => t !== tag);
      console.log('取消选中，新数组:', JSON.stringify(newSelectedTags));
    } else {
      // 选中
      newSelectedTags = [...selectedTags, tag];
      console.log('添加选中，新数组:', JSON.stringify(newSelectedTags));
    }

    this.setData({ selectedTags: newSelectedTags }, () => {
      console.log('setData 完成后 data.selectedTags:', JSON.stringify(this.data.selectedTags));
    });

    // 执行筛选
    this.filterHotelsByTags(newSelectedTags);
  },

  /**
   * 根据标签筛选酒店
   */
  filterHotelsByTags(tags: string[]) {
    const { allHotels } = this.data;

    if (tags.length === 0) {
      // 没有选中标签，显示所有酒店
      this.setData({ hotels: allHotels });
    } else {
      // 筛选包含所有选中标签的酒店
      const filteredHotels = allHotels.filter((hotel) => {
        if (!hotel.facilities || hotel.facilities.length === 0) {
          return false;
        }
        // 检查酒店是否包含所有选中的标签
        return tags.every((tag) => hotel.facilities!.includes(tag));
      });

      this.setData({ hotels: filteredHotels });
    }
  },

  /**
   * 根据 minPrice 和 maxPrice 反推价格区间字符串
   */
  getPriceRangeLabel(minPrice?: number, maxPrice?: number): string {
    if (minPrice === undefined && maxPrice === undefined) {
      return '不限';
    }
    if (maxPrice !== undefined && minPrice === undefined) {
      return `¥${maxPrice}以下`;
    }
    if (minPrice !== undefined && maxPrice === undefined) {
      return `¥${minPrice}以上`;
    }
    return `¥${minPrice}-${maxPrice}`;
  },

  /**
   * 处理星级选择
   */
  handleStarSelect(e: any) {
    const { value } = e.currentTarget.dataset;
    const starRating = parseInt(value);

    console.log('选择星级:', starRating);

    this.setData({
      selectedStarRating: starRating,
      filters: {
        ...this.data.filters,
        starRating,
      },
      page: 1,
      hasMore: true,
    });

    // 重新加载酒店数据
    this.loadHotels(false);
  },

  /**
   * 处理价格区间选择
   */
  handlePriceSelect(e: any) {
    const { value } = e.currentTarget.dataset;
    const priceRange = value as string;

    console.log('选择价格区间:', priceRange);

    // 解析价格区间
    const priceParams = this.parsePriceRange(priceRange);

    this.setData({
      selectedPriceRange: priceRange,
      filters: {
        ...this.data.filters,
        minPrice: priceParams.minPrice,
        maxPrice: priceParams.maxPrice,
      },
      page: 1,
      hasMore: true,
    });

    // 重新加载酒店数据
    this.loadHotels(false);
  },

  /**
   * 解析价格区间字符串
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
});
