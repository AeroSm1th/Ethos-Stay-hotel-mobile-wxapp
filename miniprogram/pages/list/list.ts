// pages/list/list.ts

import { Hotel, FilterCriteria } from '../../types/index';
import { hotelApi } from '../../services/api';
import {
  PAGE_SIZE,
  SORT_OPTIONS,
  STAR_OPTIONS,
  PRICE_OPTIONS,
  POPULAR_FACILITY_TAGS,
  ALL_CITIES,
} from '../../utils/constants';
import { calculateNights } from '../../utils/format';
import { showError } from '../../utils/toast';

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
  showFilterPanel: boolean;  // 是否显示筛选面板
  showCityPicker: boolean;   // 是否显示城市选择器
  popularCities: string[];   // 热门城市列表
  scrollTop: number;         // 滚动位置
}

/**
 * 酒店列表页
 */
Page<ListPageData, Record<string, never>>({
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
    showFilterPanel: false,
    showCityPicker: false,
    popularCities: ALL_CITIES,
    scrollTop: 0,
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
   * 页面显示（从其他页面返回时触发）
   */
  onShow() {
    // 恢复滚动位置
    const { scrollTop } = this.data;
    if (scrollTop > 0) {
      wx.pageScrollTo({
        scrollTop,
        duration: 0, // 立即恢复，不需要动画
      });
    }
  },

  /**
   * 页面隐藏（跳转到其他页面时触发）
   */
  onHide() {
    // 保存当前滚动位置
    const query = wx.createSelectorQuery();
    query.selectViewport().scrollOffset();
    query.exec((res) => {
      if (res && res[0]) {
        this.setData({
          scrollTop: res[0].scrollTop,
        });
      }
    });
  },

  /**
   * 加载酒店数据
   * @param append 是否追加到现有列表
   */
  async loadHotels(append: boolean) {
    const { filters, page, pageSize, hotels, sortBy, selectedTags } = this.data;

    console.log('========================================');
    console.log('列表页: 开始加载酒店数据');
    console.log('append:', append, 'page:', page);
    console.log('filters:', filters);
    console.log('========================================');

    // 设置加载状态
    if (append) {
      this.setData({ loadingMore: true });
    } else {
      this.setData({ loading: true, error: '' });
    }

    try {
      // 构造 API 参数
      const apiParams = {
        page,
        pageSize,
        keyword: filters.keyword || undefined,
        city: filters.city || undefined,
        starRating: filters.starRating || undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      };
      
      console.log('列表页: 调用 API,参数:', JSON.stringify(apiParams));
      
      // 调用 API 获取酒店列表
      const startTime = Date.now();
      const response = await hotelApi.getHotelList(apiParams);
      const endTime = Date.now();

      console.log(`列表页: API 调用成功,耗时 ${endTime - startTime}ms`);
      console.log('酒店列表响应:', response);
      console.log('返回酒店数量:', response.data?.length || 0);

      // 合并数据
      let allHotels = append ? [...this.data.allHotels, ...response.data] : response.data;
      
      // 如果有排序，对所有酒店进行排序
      if (sortBy && sortBy !== 'popular') {
        console.log('应用排序:', sortBy);
        allHotels = this.applySorting(allHotels, sortBy);
      }

      // 如果有标签筛选，应用筛选
      let displayHotels = allHotels;
      if (selectedTags.length > 0) {
        console.log('应用标签筛选:', selectedTags);
        displayHotels = allHotels.filter((hotel) => {
          if (!hotel.facilities || hotel.facilities.length === 0) {
            return false;
          }
          return selectedTags.every((tag) => hotel.facilities!.includes(tag));
        });
      }

      const hasMore = response.page < response.totalPages;

      // 提取快捷标签
      const quickTags = this.extractQuickTags(allHotels);

      console.log('列表页: 设置数据到页面');
      this.setData({
        hotels: displayHotels,
        allHotels,
        total: response.total,
        hasMore,
        loading: false,
        loadingMore: false,
        quickTags,
      });

      console.log('列表页: 数据设置完成');
      console.log('当前 loading 状态:', this.data.loading);
      console.log('显示酒店数量:', displayHotels.length);

      // 如果没有数据，显示提示
      if (response.total === 0) {
        this.setData({ error: '暂无符合条件的酒店' });
      }
      
      console.log('========================================');
    } catch (error: any) {
      console.error('========================================');
      console.error('列表页: 加载酒店列表失败!!!');
      console.error('错误详情:', error);
      console.error('错误类型:', typeof error);
      console.error('错误信息:', error.message || String(error));
      console.error('错误堆栈:', error.stack);
      console.error('========================================');

      this.setData({
        loading: false,
        loadingMore: false,
        error: error.message || '加载失败，请稍后重试',
      });

      showError('加载失败');
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
   * 返回上一页
   */
  onBack() {
    wx.navigateBack({
      fail: () => {
        // 如果无法返回,跳转到首页
        wx.redirectTo({
          url: '/pages/search/search',
        });
      },
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
   * 切换筛选面板显示/隐藏
   */
  toggleFilterPanel() {
    this.setData({
      showFilterPanel: !this.data.showFilterPanel,
    });
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
  handleCitySelect(e: any) {
    const { city } = e.currentTarget.dataset;
    console.log('选择城市:', city);

    this.setData({
      filters: {
        ...this.data.filters,
        city,
      },
      showCityPicker: false,
    });
  },

  /**
   * 处理入住日期变化
   */
  handleCheckInChange(e: any) {
    const checkIn = e.detail.value as string;
    const { filters } = this.data;

    console.log('入住日期变化:', checkIn);

    // 如果入住日期晚于或等于离店日期，不自动调整（让用户自己修改）
    this.setData({
      filters: {
        ...filters,
        checkIn,
      },
    });

    // 重新计算间夜数
    if (filters.checkOut) {
      const nights = calculateNights(checkIn, filters.checkOut);
      this.setData({ nights });
    }
  },

  /**
   * 处理离店日期变化
   */
  handleCheckOutChange(e: any) {
    const checkOut = e.detail.value as string;
    const { filters } = this.data;

    console.log('离店日期变化:', checkOut);

    this.setData({
      filters: {
        ...filters,
        checkOut,
      },
    });

    // 重新计算间夜数
    if (filters.checkIn) {
      const nights = calculateNights(filters.checkIn, checkOut);
      this.setData({ nights });
    }
  },

  /**
   * 处理关键词输入
   */
  handleKeywordInput(e: any) {
    const keyword = e.detail.value as string;
    console.log('关键词输入:', keyword);

    this.setData({
      filters: {
        ...this.data.filters,
        keyword,
      },
    });
  },

  /**
   * 应用筛选条件
   */
  applyFilters() {
    console.log('应用筛选条件:', this.data.filters);

    // 隐藏筛选面板
    this.setData({
      showFilterPanel: false,
      page: 1,
      hasMore: true,
    });

    // 重新加载酒店数据
    this.loadHotels(false);
  },

  /**
   * 切换排序方式
   */
  async handleSort(e: any) {
    const { sortby } = e.currentTarget.dataset;
    const { sortBy, allHotels } = this.data;

    // 如果点击的是当前排序方式,不做任何操作
    if (sortby === sortBy) {
      console.log('已经是当前排序方式,无需重复操作');
      return;
    }

    console.log('切换排序方式:', sortby);
    this.setData({ sortBy: sortby });

    // 如果是价格排序，需要加载所有数据
    if (sortby === 'price') {
      await this.loadAllHotelsAndSort(sortby);
    } else {
      // 其他排序方式
      // 如果已经加载了所有数据(hasMore=false),直接对现有数据排序
      // 否则,对当前已加载的数据排序
      if (allHotels.length > 0) {
        this.sortHotels(sortby);
      } else {
        // 如果没有数据,重新加载
        this.setData({ page: 1, hasMore: true });
        this.loadHotels(false);
      }
    }
  },

  /**
   * 加载所有酒店数据并排序
   */
  async loadAllHotelsAndSort(sortBy: string) {
    const { filters } = this.data;

    console.log('加载所有酒店数据进行排序');

    // 显示加载状态
    this.setData({ loading: true });

    try {
      // 第一步：先获取总数（使用小的 pageSize）
      const firstResponse = await hotelApi.getHotelList({
        page: 1,
        pageSize: 1,
        keyword: filters.keyword || undefined,
        city: filters.city || undefined,
        starRating: filters.starRating || undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });

      const totalCount = firstResponse.total;
      console.log('酒店总数:', totalCount);

      if (totalCount === 0) {
        this.setData({
          allHotels: [],
          hotels: [],
          total: 0,
          hasMore: false,
          loading: false,
          error: '暂无符合条件的酒店',
        });
        return;
      }

      // 第二步：一次性加载所有数据
      const response = await hotelApi.getHotelList({
        page: 1,
        pageSize: totalCount,
        keyword: filters.keyword || undefined,
        city: filters.city || undefined,
        starRating: filters.starRating || undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });

      console.log('加载完成，酒店数量:', response.data.length);

      // 对所有数据进行排序
      const sortedHotels = this.applySorting(response.data, sortBy);

      // 应用标签筛选
      const { selectedTags } = this.data;
      let displayHotels = sortedHotels;
      if (selectedTags.length > 0) {
        displayHotels = sortedHotels.filter((hotel) => {
          if (!hotel.facilities || hotel.facilities.length === 0) {
            return false;
          }
          return selectedTags.every((tag) => hotel.facilities!.includes(tag));
        });
      }

      // 提取快捷标签
      const quickTags = this.extractQuickTags(sortedHotels);

      // 更新数据
      this.setData({
        allHotels: sortedHotels,
        hotels: displayHotels,
        total: totalCount,
        hasMore: false, // 已加载所有数据
        loading: false,
        error: '',
        quickTags,
      });

      console.log('排序完成');
    } catch (error: any) {
      console.error('加载数据失败:', error);
      showError('排序失败');
      this.setData({ 
        loading: false,
        error: error.message || '加载失败，请稍后重试',
      });
    }
  },

  /**
   * 应用排序逻辑（不更新 state）
   */
  applySorting(hotels: Hotel[], sortBy: string): Hotel[] {
    const sortedHotels = [...hotels];

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

    return sortedHotels;
  },

  /**
   * 本地排序酒店列表
   */
  sortHotels(sortBy: string) {
    const { allHotels, selectedTags } = this.data;
    
    console.log('开始排序，排序方式:', sortBy);
    console.log('酒店总数:', allHotels.length);
    
    // 对所有酒店进行排序
    const sortedHotels = this.applySorting(allHotels, sortBy);

    // 如果有标签筛选，应用筛选
    let finalHotels = sortedHotels;
    if (selectedTags.length > 0) {
      console.log('应用标签筛选:', selectedTags);
      finalHotels = sortedHotels.filter((hotel) => {
        if (!hotel.facilities || hotel.facilities.length === 0) {
          return false;
        }
        return selectedTags.every((tag) => hotel.facilities!.includes(tag));
      });
      console.log('筛选后酒店数:', finalHotels.length);
    }

    // 一次性更新数据
    console.log('更新数据...');
    this.setData({ 
      allHotels: sortedHotels,
      hotels: finalHotels,
    });
    console.log('排序完成');
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
   * 优先显示热门标签，然后显示从酒店数据中提取的高频标签
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

    // 按出现次数排序
    const sortedFacilities = Object.entries(facilityCount)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);

    // 合并热门标签和提取的标签，去重
    const allTags = [...POPULAR_FACILITY_TAGS];
    
    // 添加从酒店数据中提取的高频标签（不在热门标签中的）
    sortedFacilities.forEach((facility) => {
      if (!allTags.includes(facility) && allTags.length < 20) {
        allTags.push(facility);
      }
    });

    // 返回前 15 个标签
    return allTags.slice(0, 15);
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
      this.setData({ 
        hotels: allHotels,
        total: allHotels.length,
      });
    } else {
      // 筛选包含所有选中标签的酒店
      const filteredHotels = allHotels.filter((hotel) => {
        if (!hotel.facilities || hotel.facilities.length === 0) {
          return false;
        }
        // 检查酒店是否包含所有选中的标签
        return tags.every((tag) => hotel.facilities!.includes(tag));
      });

      this.setData({ 
        hotels: filteredHotels,
        total: filteredHotels.length,
      });
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
