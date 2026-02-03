/**
 * 全局常量配置文件
 * 定义小程序中使用的所有常量
 */

// ==================== API 配置 ====================

/**
 * API 基础地址
 * 注意：需要根据实际后端部署地址修改
 */
export const API_BASE_URL = 'http://localhost:3000/api';

// ==================== 分页配置 ====================

/**
 * 每页数量
 */
export const PAGE_SIZE = 10;

// ==================== 缓存配置 ====================

/**
 * 缓存过期时间（5分钟）
 */
export const CACHE_EXPIRY = 5 * 60 * 1000;

// ==================== 城市配置 ====================

/**
 * 热门城市列表
 */
export const POPULAR_CITIES = [
  '北京', '上海', '广州', '深圳', '杭州', '成都',
  '西安', '三亚', '南京', '武汉', '厦门', '青岛',
  '重庆', '苏州', '长沙', '昆明',
];

// ==================== 筛选选项配置 ====================

/**
 * 星级选项
 */
export const STAR_OPTIONS = [
  { value: 0, label: '不限' },
  { value: 1, label: '一星级' },
  { value: 2, label: '二星级' },
  { value: 3, label: '三星级' },
  { value: 4, label: '四星级' },
  { value: 5, label: '五星级' },
];

/**
 * 价格区间选项
 */
export const PRICE_OPTIONS = [
  '不限',
  '¥150以下',
  '¥150-300',
  '¥300-450',
  '¥450-600',
  '¥600以上',
];

/**
 * 排序选项
 */
export const SORT_OPTIONS = [
  { key: 'popular', label: '欢迎度排序' },
  { key: 'distance', label: '位置距离' },
  { key: 'price', label: '价格/星级' },
];

// ==================== 本地存储键名 ====================

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  RECENT_CITY: 'recent_city',           // 最近选择的城市
  FAVORITES: 'favorites',               // 收藏的酒店 ID 列表
  HISTORY: 'browse_history',            // 浏览历史
  CACHE_PREFIX: 'cache_',                // 缓存前缀
};

// ==================== 日期配置 ====================

/**
 * 日期格式
 */
export const DATE_FORMAT = 'YYYY-MM-DD';

/**
 * 默认入住日期偏移（今天）
 */
export const DEFAULT_CHECKIN_OFFSET = 0;

/**
 * 默认离店日期偏移（明天）
 */
export const DEFAULT_CHECKOUT_OFFSET = 1;

// ==================== 网络配置 ====================

/**
 * 请求超时时间（10秒）
 */
export const REQUEST_TIMEOUT = 10000;

// ==================== 浏览历史配置 ====================

/**
 * 最大浏览历史记录数
 */
export const MAX_HISTORY_COUNT = 10;

// ==================== UI 配置 ====================

/**
 * 导航栏显示阈值（滚动距离）
 */
export const NAV_HEADER_THRESHOLD = 200;

/**
 * 主题色
 */
export const THEME_COLOR = '#0086f6';
