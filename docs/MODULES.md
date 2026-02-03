# 功能模块文档

本文档详细描述易宿酒店微信小程序的各个功能模块，包括实现思路、关键代码解析和使用说明。

## 目录

- [1. 酒店查询页（首页）](#1-酒店查询页首页)
- [2. 酒店列表页](#2-酒店列表页)
- [3. 酒店详情页](#3-酒店详情页)
- [4. 服务层](#4-服务层)
- [5. 工具函数](#5-工具函数)
- [6. 可复用组件](#6-可复用组件)

---

## 1. 酒店查询页（首页）

### 1.1 功能概述

酒店查询页是小程序的首页，提供完整的酒店查询功能，包括：

- 城市选择（热门城市列表）
- 日期选择（入住/离店日期，自动计算间夜数）
- 关键词搜索（位置、品牌、酒店名称）
- 筛选条件（星级、价格区间）
- 快捷标签（常见设施）
- GPS 定位（自动获取当前城市）
- 酒店 Banner（顶部广告位）
- 推荐酒店（横向滚动列表）

### 1.2 实现思路

#### 数据结构

```typescript
interface SearchPageData {
  city: string;              // 当前选择的城市
  keyword: string;           // 搜索关键词
  checkIn: string;           // 入住日期 (YYYY-MM-DD)
  checkOut: string;          // 离店日期 (YYYY-MM-DD)
  nights: number;            // 间夜数
  starRating: number;        // 星级筛选
  priceRange: string;        // 价格区间
  selectedTags: string[];    // 选中的设施标签
  showCityPicker: boolean;   // 是否显示城市选择器
  showDatePicker: boolean;   // 是否显示日期选择器
  datePickerType: string;    // 日期选择器类型（checkIn/checkOut）
  bannerHotels: Hotel[];     // Banner 酒店列表
  recommendHotels: Hotel[];  // 推荐酒店列表
  loading: boolean;          // 加载状态
}
```

#### 核心逻辑

1. **页面初始化**：
   - 从本地存储读取上次选择的城市
   - 设置默认日期（今天和明天）
   - 加载推荐酒店数据

2. **城市选择**：
   - 显示热门城市列表弹窗
   - 用户选择后保存到本地存储
   - 更新页面显示

3. **日期选择**：
   - 使用自定义日期选择器组件
   - 自动计算间夜数
   - 确保离店日期晚于入住日期

4. **GPS 定位**：
   - 调用 `wx.getLocation` 获取经纬度
   - 根据经纬度模拟城市匹配（实际项目可接入地图 API）
   - 处理定位权限和错误

5. **查询跳转**：
   - 收集所有查询条件
   - 构造 URL 参数
   - 跳转到列表页

### 1.3 关键代码解析

#### 页面加载

```typescript
onLoad() {
  // 从本地存储读取上次选择的城市
  const recentCity = storageService.getRecentCity();
  if (recentCity) {
    this.setData({ city: recentCity });
  }

  // 设置默认日期
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  this.setData({
    checkIn: formatDate(today),
    checkOut: formatDate(tomorrow),
    nights: 1
  });

  // 加载推荐酒店
  this.loadRecommendHotels();
}
```

#### 城市选择

```typescript
// 显示城市选择器
handleCityClick() {
  this.setData({ showCityPicker: true });
}

// 选择城市
handleCitySelect(e: any) {
  const city = e.detail.city;
  this.setData({ 
    city,
    showCityPicker: false 
  });
  // 保存到本地存储
  storageService.saveRecentCity(city);
}
```

#### 日期选择

```typescript
// 显示日期选择器
handleDateClick(e: any) {
  const type = e.currentTarget.dataset.type;
  this.setData({
    showDatePicker: true,
    datePickerType: type
  });
}

// 选择日期
handleDateSelect(e: any) {
  const date = e.detail.date;
  const type = this.data.datePickerType;
  
  if (type === 'checkIn') {
    this.setData({ checkIn: date });
    // 如果入住日期晚于离店日期，自动调整离店日期
    if (date >= this.data.checkOut) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      this.setData({ checkOut: formatDate(nextDay) });
    }
  } else {
    this.setData({ checkOut: date });
  }
  
  // 计算间夜数
  const nights = calculateNights(this.data.checkIn, this.data.checkOut);
  this.setData({ nights, showDatePicker: false });
}
```

#### GPS 定位

```typescript
handleGpsLocation() {
  wx.getLocation({
    type: 'gcj02',
    success: (res) => {
      // 根据经纬度模拟城市匹配
      const city = this.getCityByLocation(res.latitude, res.longitude);
      this.setData({ city });
      storageService.saveRecentCity(city);
      showToast('定位成功');
    },
    fail: () => {
      showToast('定位失败，请手动选择城市', 'error');
    }
  });
}

// 根据经纬度获取城市（简化版）
getCityByLocation(lat: number, lng: number): string {
  // 实际项目中应该调用地图 API
  // 这里简化处理，返回默认城市
  return '上海';
}
```

#### 查询跳转

```typescript
handleSearch() {
  // 构造查询参数
  const params: any = {
    city: this.data.city,
    checkIn: this.data.checkIn,
    checkOut: this.data.checkOut,
    nights: this.data.nights
  };
  
  if (this.data.keyword) {
    params.keyword = this.data.keyword;
  }
  
  if (this.data.starRating > 0) {
    params.starRating = this.data.starRating;
  }
  
  if (this.data.priceRange !== '不限') {
    const { minPrice, maxPrice } = parsePriceRange(this.data.priceRange);
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
  }
  
  if (this.data.selectedTags.length > 0) {
    params.facilities = this.data.selectedTags.join(',');
  }
  
  // 跳转到列表页
  wx.navigateTo({
    url: `/pages/list/list?${new URLSearchParams(params).toString()}`
  });
}
```

### 1.4 使用说明

1. **城市选择**：点击城市名称，从热门城市列表中选择
2. **日期选择**：点击日期，使用日期选择器选择入住和离店日期
3. **关键词搜索**：输入位置、品牌或酒店名称
4. **筛选条件**：选择星级和价格区间
5. **快捷标签**：点击常见设施标签快速筛选
6. **GPS 定位**：点击定位图标自动获取当前城市
7. **查询按钮**：点击"查询"按钮跳转到列表页

---

## 2. 酒店列表页

### 2.1 功能概述

酒店列表页展示符合查询条件的酒店列表，提供：

- 酒店列表展示（卡片式布局）
- 筛选条件展示和修改
- 排序功能（欢迎度、位置距离、价格/星级）
- 快捷标签筛选（设施筛选）
- 分页加载（上滑加载更多）
- 下拉刷新
- 空状态提示
- 错误处理和重试

### 2.2 实现思路

#### 数据结构

```typescript
interface ListPageData {
  hotels: Hotel[];           // 酒店列表
  total: number;             // 总数
  page: number;              // 当前页码
  pageSize: number;          // 每页数量
  hasMore: boolean;          // 是否有更多数据
  loading: boolean;          // 加载状态
  loadingMore: boolean;      // 加载更多状态
  sortBy: string;            // 排序方式
  filters: FilterCriteria;   // 筛选条件
  quickTags: string[];       // 快捷标签
  selectedTags: string[];    // 选中的标签
  showFilterModal: boolean;  // 是否显示筛选弹窗
}
```

#### 核心逻辑

1. **页面加载**：
   - 解析 URL 查询参数
   - 初始化筛选条件
   - 加载第一页数据

2. **数据加载**：
   - 调用 API 获取酒店列表
   - 处理分页逻辑
   - 更新页面状态

3. **排序功能**：
   - 本地排序（不重新请求 API）
   - 支持多种排序方式
   - 高亮当前排序

4. **筛选功能**：
   - 快捷标签筛选
   - 筛选条件修改
   - 重新加载数据

5. **分页加载**：
   - 监听触底事件
   - 加载下一页数据
   - 追加到列表

6. **下拉刷新**：
   - 重置页码
   - 重新加载第一页
   - 清空列表

### 2.3 关键代码解析

#### 页面加载

```typescript
onLoad(options: any) {
  // 解析查询参数
  const filters: FilterCriteria = {
    city: options.city || '',
    keyword: options.keyword || '',
    checkIn: options.checkIn || '',
    checkOut: options.checkOut || '',
    starRating: parseInt(options.starRating) || 0,
    minPrice: parseInt(options.minPrice) || undefined,
    maxPrice: parseInt(options.maxPrice) || undefined,
    facilities: options.facilities ? options.facilities.split(',') : []
  };
  
  this.setData({ filters });
  
  // 加载数据
  this.loadHotels(false);
}
```

#### 数据加载

```typescript
async loadHotels(append: boolean) {
  if (this.data.loading || this.data.loadingMore) return;
  
  this.setData({ 
    loading: !append,
    loadingMore: append 
  });
  
  try {
    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize,
      ...this.data.filters
    };
    
    const response = await hotelApi.getHotelList(params);
    
    const hotels = append 
      ? [...this.data.hotels, ...response.data]
      : response.data;
    
    const hasMore = this.data.page < response.totalPages;
    
    this.setData({
      hotels,
      total: response.total,
      hasMore,
      loading: false,
      loadingMore: false
    });
    
    // 提取快捷标签
    this.extractQuickTags(hotels);
  } catch (error) {
    showToast('加载失败，请重试', 'error');
    this.setData({ 
      loading: false,
      loadingMore: false 
    });
  }
}
```

#### 排序功能

```typescript
handleSort(e: any) {
  const sortBy = e.currentTarget.dataset.sort;
  this.setData({ sortBy });
  
  let hotels = [...this.data.hotels];
  
  switch (sortBy) {
    case 'popular':
      // 按 ID 排序（模拟欢迎度）
      hotels.sort((a, b) => a.id - b.id);
      break;
    case 'distance':
      // 按地址排序（模拟距离）
      hotels.sort((a, b) => a.address.localeCompare(b.address));
      break;
    case 'price':
      // 按最低价格排序
      hotels.sort((a, b) => {
        const priceA = a.roomTypes?.[0]?.price || 0;
        const priceB = b.roomTypes?.[0]?.price || 0;
        return priceA - priceB;
      });
      break;
  }
  
  this.setData({ hotels });
}
```

#### 快捷标签筛选

```typescript
// 提取快捷标签
extractQuickTags(hotels: Hotel[]) {
  const facilitySet = new Set<string>();
  hotels.forEach(hotel => {
    hotel.facilities?.forEach(facility => {
      facilitySet.add(facility);
    });
  });
  const quickTags = Array.from(facilitySet).slice(0, 10);
  this.setData({ quickTags });
}

// 点击标签筛选
handleTagClick(e: any) {
  const tag = e.currentTarget.dataset.tag;
  const selectedTags = [...this.data.selectedTags];
  
  const index = selectedTags.indexOf(tag);
  if (index > -1) {
    selectedTags.splice(index, 1);
  } else {
    selectedTags.push(tag);
  }
  
  this.setData({ selectedTags });
  this.filterByTags();
}

// 按标签筛选
filterByTags() {
  if (this.data.selectedTags.length === 0) {
    // 显示所有酒店
    return;
  }
  
  const filteredHotels = this.data.hotels.filter(hotel => {
    return this.data.selectedTags.every(tag => 
      hotel.facilities?.includes(tag)
    );
  });
  
  this.setData({ hotels: filteredHotels });
}
```

#### 分页加载

```typescript
onReachBottom() {
  if (this.data.hasMore && !this.data.loadingMore) {
    this.setData({ page: this.data.page + 1 });
    this.loadHotels(true);
  }
}
```

#### 下拉刷新

```typescript
onPullDownRefresh() {
  this.setData({ 
    page: 1,
    hotels: [],
    selectedTags: []
  });
  this.loadHotels(false);
  wx.stopPullDownRefresh();
}
```

### 2.4 使用说明

1. **查看列表**：滚动查看酒店列表
2. **排序**：点击排序按钮选择排序方式
3. **筛选**：点击快捷标签筛选酒店
4. **修改条件**：点击顶部筛选条件修改查询参数
5. **加载更多**：滚动到底部自动加载下一页
6. **刷新**：下拉刷新重新加载数据
7. **查看详情**：点击酒店卡片跳转到详情页

---

## 3. 酒店详情页

### 3.1 功能概述

酒店详情页展示酒店的完整信息，包括：

- 图片轮播（支持左右滑动）
- 基本信息（名称、星级、地址、评分）
- 特色标签（设施、开业年份、附近景点）
- 日期选择（修改入住/离店日期）
- 房型列表（按价格排序）
- 房型详情（名称、床型、面积、人数、价格）
- 顶部导航栏（滚动显示）
- 收藏功能（本地存储）
- 分享功能（微信分享）
- 滚动到房型列表

### 3.2 实现思路

#### 数据结构

```typescript
interface DetailPageData {
  hotel: Hotel | null;       // 酒店详情
  loading: boolean;          // 加载状态
  checkIn: string;           // 入住日期
  checkOut: string;          // 离店日期
  nights: number;            // 间夜数
  collected: boolean;        // 收藏状态
  showNavHeader: boolean;    // 是否显示顶部导航栏
  currentImageIndex: number; // 当前图片索引
  showDatePicker: boolean;   // 是否显示日期选择器
  datePickerType: string;    // 日期选择器类型
}
```

#### 核心逻辑

1. **页面加载**：
   - 解析 URL 参数获取酒店 ID
   - 调用 API 获取酒店详情
   - 读取收藏状态
   - 保存浏览历史

2. **图片轮播**：
   - 使用 swiper 组件
   - 支持左右滑动
   - 显示图片指示器

3. **日期选择**：
   - 显示当前日期和间夜数
   - 提供修改入口
   - 更新 URL 参数

4. **房型列表**：
   - 按价格从低到高排序
   - 显示房型详情
   - 支持滚动到房型区域

5. **收藏功能**：
   - 读取本地存储
   - 切换收藏状态
   - 保存到本地存储

6. **分享功能**：
   - 实现 onShareAppMessage
   - 配置分享标题和图片
   - 传递酒店 ID

### 3.3 关键代码解析

#### 页面加载

```typescript
async onLoad(options: any) {
  const hotelId = parseInt(options.id);
  const checkIn = options.checkIn || formatDate(new Date());
  const checkOut = options.checkOut || formatDate(new Date(Date.now() + 86400000));
  const nights = calculateNights(checkIn, checkOut);
  
  this.setData({ 
    checkIn, 
    checkOut, 
    nights 
  });
  
  // 读取收藏状态
  const collected = storageService.isFavorite(hotelId);
  this.setData({ collected });
  
  // 加载酒店详情
  await this.loadHotelDetail(hotelId);
  
  // 保存浏览历史
  if (this.data.hotel) {
    storageService.saveHistory(this.data.hotel);
  }
}

async loadHotelDetail(id: number) {
  this.setData({ loading: true });
  
  try {
    const hotel = await hotelApi.getHotelDetail(id);
    
    // 房型按价格排序
    if (hotel.roomTypes) {
      hotel.roomTypes.sort((a, b) => a.price - b.price);
    }
    
    this.setData({ 
      hotel,
      loading: false 
    });
  } catch (error) {
    showToast('加载失败', 'error');
    this.setData({ loading: false });
  }
}
```

#### 页面滚动

```typescript
onPageScroll(e: any) {
  const scrollTop = e.scrollTop;
  const showNavHeader = scrollTop > 200;
  
  if (showNavHeader !== this.data.showNavHeader) {
    this.setData({ showNavHeader });
  }
}
```

#### 收藏功能

```typescript
handleCollect() {
  const hotelId = this.data.hotel?.id;
  if (!hotelId) return;
  
  const collected = !this.data.collected;
  this.setData({ collected });
  
  if (collected) {
    storageService.addFavorite(hotelId);
    showToast('收藏成功');
  } else {
    storageService.removeFavorite(hotelId);
    showToast('已取消收藏');
  }
}
```

#### 分享功能

```typescript
onShareAppMessage() {
  const hotel = this.data.hotel;
  if (!hotel) return {};
  
  return {
    title: hotel.nameCn,
    path: `/pages/detail/detail?id=${hotel.id}`,
    imageUrl: hotel.images?.[0]?.imageUrl || ''
  };
}
```

#### 滚动到房型列表

```typescript
scrollToRooms() {
  wx.pageScrollTo({
    selector: '#room-list',
    duration: 300
  });
}
```

### 3.4 使用说明

1. **查看图片**：左右滑动查看酒店图片
2. **查看信息**：滚动查看酒店基本信息和特色标签
3. **修改日期**：点击日期修改入住和离店日期
4. **查看房型**：滚动到房型列表查看所有房型
5. **收藏酒店**：点击收藏按钮收藏或取消收藏
6. **分享酒店**：点击分享按钮分享给好友
7. **返回列表**：点击返回按钮返回列表页

---

## 4. 服务层

### 4.1 API 服务 (services/api.ts)

#### 功能概述

API 服务封装所有后端接口调用，提供统一的数据访问接口。

#### 核心方法

```typescript
class HotelApiService {
  // 获取酒店列表
  async getHotelList(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    city?: string;
    starRating?: number;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<HotelListResponse> {
    const response = await request.get<HotelListResponse>(
      '/public/hotels',
      params
    );
    return response;
  }

  // 获取酒店详情
  async getHotelDetail(id: number): Promise<Hotel> {
    const response = await request.get<Hotel>(
      `/public/hotels/${id}`
    );
    return response;
  }
}

export const hotelApi = new HotelApiService();
```

### 4.2 存储服务 (services/storage.ts)

#### 功能概述

存储服务管理本地存储数据，包括城市记忆、收藏、浏览历史。

#### 核心方法

```typescript
class StorageService {
  // 保存最近选择的城市
  saveRecentCity(city: string): void {
    wx.setStorageSync('recent_city', city);
  }
  
  // 获取最近选择的城市
  getRecentCity(): string | null {
    return wx.getStorageSync('recent_city') || null;
  }
  
  // 添加收藏
  addFavorite(hotelId: number): void {
    const favorites = this.getFavorites();
    if (!favorites.includes(hotelId)) {
      favorites.push(hotelId);
      wx.setStorageSync('favorites', JSON.stringify(favorites));
    }
  }
  
  // 移除收藏
  removeFavorite(hotelId: number): void {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(hotelId);
    if (index > -1) {
      favorites.splice(index, 1);
      wx.setStorageSync('favorites', JSON.stringify(favorites));
    }
  }
  
  // 检查是否已收藏
  isFavorite(hotelId: number): boolean {
    const favorites = this.getFavorites();
    return favorites.includes(hotelId);
  }
  
  // 保存浏览历史
  saveHistory(hotel: Hotel): void {
    const history = this.getHistory();
    // 移除重复项
    const filtered = history.filter(h => h.id !== hotel.id);
    // 添加到开头
    filtered.unshift(hotel);
    // 只保留最近 10 条
    const limited = filtered.slice(0, 10);
    wx.setStorageSync('history', JSON.stringify(limited));
  }
}

export const storageService = new StorageService();
```

### 4.3 缓存服务 (services/cache.ts)

#### 功能概述

缓存服务管理数据缓存，减少网络请求，提高性能。

#### 核心方法

```typescript
class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  // 设置缓存
  set<T>(key: string, data: T, expiry: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }
  
  // 获取缓存
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (!this.isValid(key)) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }
  
  // 检查缓存是否有效
  isValid(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    const now = Date.now();
    return now - item.timestamp < item.expiry;
  }
  
  // 清除缓存
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const cacheService = new CacheService();
```

---

## 5. 工具函数

### 5.1 网络请求封装 (utils/request.ts)

#### 功能概述

封装微信小程序的网络请求，提供统一的错误处理和拦截器。

#### 核心实现

```typescript
class Request {
  private baseURL: string;
  private timeout: number;
  
  constructor(config: { baseURL: string; timeout?: number }) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;
  }
  
  async request<T>(config: RequestConfig): Promise<T> {
    const url = this.baseURL + config.url;
    
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: config.method || 'GET',
        data: config.data,
        header: config.header || {},
        timeout: this.timeout,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data as T);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }
  
  async get<T>(url: string, params?: any): Promise<T> {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>({
      url: url + queryString,
      method: 'GET'
    });
  }
  
  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({
      url,
      method: 'POST',
      data
    });
  }
}

export const request = new Request({
  baseURL: API_BASE_URL,
  timeout: 10000
});
```

### 5.2 数据格式化 (utils/format.ts)

#### 功能概述

提供数据格式化工具函数，包括日期、价格、星级等。

#### 核心函数

```typescript
// 格式化日期
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
}

// 计算间夜数
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// 格式化价格
export function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

// 获取星级标签
export function getStarRating(rating: number): string {
  const stars = ['', '经济型', '舒适型', '高档型', '豪华型', '奢华型'];
  return stars[rating] || '';
}

// 解析价格区间
export function parsePriceRange(range: string): { minPrice?: number; maxPrice?: number } {
  if (range === '不限') return {};
  
  const match = range.match(/¥?(\d+)(?:-(\d+)|以下|以上)/);
  if (!match) return {};
  
  const [, min, max] = match;
  
  if (range.includes('以下')) {
    return { maxPrice: parseInt(min) };
  } else if (range.includes('以上')) {
    return { minPrice: parseInt(min) };
  } else {
    return { 
      minPrice: parseInt(min),
      maxPrice: parseInt(max)
    };
  }
}
```

---

## 6. 可复用组件

### 6.1 酒店卡片组件 (components/hotel-card)

#### 功能概述

酒店卡片组件用于展示酒店基本信息，可在列表页和推荐列表中复用。

#### 属性定义

```typescript
properties: {
  hotel: {
    type: Object,
    value: null
  },
  showPrice: {
    type: Boolean,
    value: true
  }
}
```

#### 使用示例

```xml
<hotel-card 
  hotel="{{hotel}}" 
  showPrice="{{true}}"
  bind:tap="handleCardClick"
/>
```

### 6.2 日期选择器组件 (components/date-picker)

#### 功能概述

日期选择器组件提供日期选择功能，支持最小日期和最大日期限制。

#### 属性定义

```typescript
properties: {
  value: {
    type: String,
    value: ''
  },
  minDate: {
    type: String,
    value: ''
  },
  maxDate: {
    type: String,
    value: ''
  }
}
```

#### 使用示例

```xml
<date-picker 
  value="{{checkIn}}"
  minDate="{{today}}"
  bind:change="handleDateChange"
/>
```

### 6.3 筛选栏组件 (components/filter-bar)

#### 功能概述

筛选栏组件提供筛选条件选择，包括星级和价格区间。

#### 属性定义

```typescript
properties: {
  filters: {
    type: Object,
    value: {}
  }
}
```

#### 使用示例

```xml
<filter-bar 
  filters="{{filters}}"
  bind:change="handleFilterChange"
/>
```

---

## 总结

本文档详细介绍了易宿酒店微信小程序的各个功能模块，包括：

1. **酒店查询页**：提供完整的查询功能和推荐展示
2. **酒店列表页**：展示酒店列表，支持排序、筛选、分页
3. **酒店详情页**：展示酒店详细信息，支持收藏和分享
4. **服务层**：封装 API 调用、本地存储、数据缓存
5. **工具函数**：提供网络请求、数据格式化等工具
6. **可复用组件**：酒店卡片、日期选择器、筛选栏

每个模块都包含了实现思路、关键代码解析和使用说明，方便开发者理解和维护。
