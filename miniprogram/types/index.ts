/**
 * 全局类型定义文件
 * 定义小程序中使用的所有数据模型接口
 */

// ==================== 实体类型 ====================

/**
 * 酒店实体
 */
export interface Hotel {
  id: number;                    // 酒店 ID
  nameCn: string;                // 中文名称
  nameEn?: string;               // 英文名称
  address: string;               // 地址
  starRating: number;            // 星级 (1-5)
  openingDate?: string;          // 开业日期
  description?: string;          // 酒店介绍
  facilities?: string[];         // 设施列表
  nearbyAttractions?: string[];  // 附近景点
  transportation?: string[];     // 交通信息
  status?: string;               // 状态
  roomTypes?: RoomType[];        // 房型列表
  images?: HotelImage[];         // 图片列表
}

/**
 * 房型实体
 */
export interface RoomType {
  id: number;                    // 房型 ID
  name: string;                  // 房型名称
  price: number;                 // 价格
  originalPrice?: number;        // 原价
  discountType?: string;         // 折扣类型
  discountValue?: number;        // 折扣值
  discountDescription?: string;  // 折扣描述
  maxGuests?: number;            // 最大入住人数
  bedType?: string;              // 床型
  roomSize?: number;             // 房间面积
  amenities?: string[];          // 房间设施
  imageUrl?: string;             // 房型图片
}

/**
 * 酒店图片实体
 */
export interface HotelImage {
  id: number;                    // 图片 ID
  imageUrl: string;              // 图片 URL
  sortOrder: number;             // 排序
  description?: string;          // 图片描述
}

// ==================== 筛选和查询类型 ====================

/**
 * 筛选条件
 */
export interface FilterCriteria {
  city: string;                  // 城市
  keyword: string;               // 搜索关键词
  checkIn: string;               // 入住日期 (YYYY-MM-DD)
  checkOut: string;              // 离店日期 (YYYY-MM-DD)
  starRating: number;            // 星级筛选
  minPrice?: number;             // 最低价格
  maxPrice?: number;             // 最高价格
  facilities?: string[];         // 设施筛选
}

// ==================== API 响应类型 ====================

/**
 * 酒店列表响应
 */
export interface HotelListResponse {
  data: Hotel[];                 // 酒店列表
  page: number;                  // 当前页码
  pageSize: number;              // 每页数量
  total: number;                 // 总数
  totalPages: number;            // 总页数
}

/**
 * 酒店详情响应
 */
export interface HotelDetailResponse extends Hotel {}

// ==================== 页面数据接口 ====================

/**
 * 查询页（首页）数据接口
 */
export interface SearchPageData {
  city: string;                  // 当前选择的城市
  keyword: string;               // 搜索关键词
  checkIn: string;               // 入住日期 (YYYY-MM-DD)
  checkOut: string;              // 离店日期 (YYYY-MM-DD)
  starRating: number;            // 星级筛选
  priceRange: string;            // 价格区间
  selectedTags: string[];        // 选中的设施标签
  bannerHotels: Hotel[];         // Banner 酒店列表
  recommendHotels: Hotel[];      // 推荐酒店列表
  loading: boolean;              // 加载状态
}

/**
 * 列表页数据接口
 */
export interface ListPageData {
  hotels: Hotel[];               // 酒店列表
  total: number;                 // 总数
  page: number;                  // 当前页码
  pageSize: number;              // 每页数量
  hasMore: boolean;              // 是否有更多数据
  loading: boolean;              // 加载状态
  loadingMore: boolean;          // 加载更多状态
  sortBy: string;                // 排序方式
  filters: FilterCriteria;       // 筛选条件
  quickTags: string[];           // 快捷标签
  selectedTags: string[];        // 选中的标签
}

/**
 * 详情页数据接口
 */
export interface DetailPageData {
  hotel: Hotel | null;           // 酒店详情
  loading: boolean;              // 加载状态
  checkIn: string;               // 入住日期
  checkOut: string;              // 离店日期
  nights: number;                // 间夜数
  collected: boolean;            // 收藏状态
  showNavHeader: boolean;        // 是否显示顶部导航栏
  currentImageIndex: number;     // 当前图片索引
}

// ==================== 组件属性接口 ====================

/**
 * 酒店卡片组件属性
 */
export interface HotelCardProps {
  hotel: Hotel;                  // 酒店数据
  showPrice: boolean;            // 是否显示价格
  onClick?: () => void;          // 点击回调
}

/**
 * 日期选择器组件属性
 */
export interface DatePickerProps {
  value: string;                 // 当前日期
  minDate?: string;              // 最小日期
  maxDate?: string;              // 最大日期
  onChange: (date: string) => void; // 日期变化回调
}

/**
 * 筛选栏组件属性
 */
export interface FilterBarProps {
  filters: FilterCriteria;       // 当前筛选条件
  onChange: (filters: FilterCriteria) => void; // 筛选变化回调
}

// ==================== 缓存相关类型 ====================

/**
 * 缓存项
 */
export interface CacheItem<T> {
  data: T;                       // 缓存数据
  timestamp: number;             // 时间戳
  expiry: number;                // 过期时间（毫秒）
}
