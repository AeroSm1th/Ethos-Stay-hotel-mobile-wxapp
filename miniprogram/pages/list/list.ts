// pages/list/list.ts

import { Hotel, FilterCriteria } from '../../types/index';
import { hotelApi } from '../../services/api';
import { PAGE_SIZE, SORT_OPTIONS } from '../../utils/constants';
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
    if (options.minPrice) {
      filters.minPrice = parseInt(options.minPrice);
    }
    if (options.maxPrice) {
      filters.maxPrice = parseInt(options.maxPrice);
    }

    // 计算间夜数
    const nights = filters.checkIn && filters.checkOut
      ? calculateNights(filters.checkIn, filters.checkOut)
      : 1;

    this.setData({
      filters,
      nights,
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
    const prices = hotel.roomTypes.map((room) => room.price);
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

    console.log('点击标签:', tag);

    // 切换标签选中状态
    let newSelectedTags: string[];
    if (selectedTags.includes(tag)) {
      // 取消选中
      newSelectedTags = selectedTags.filter((t) => t !== tag);
    } else {
      // 选中
      newSelectedTags = [...selectedTags, tag];
    }

    this.setData({ selectedTags: newSelectedTags });

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
});
