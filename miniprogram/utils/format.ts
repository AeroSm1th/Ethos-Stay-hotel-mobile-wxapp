/**
 * 数据格式化工具函数
 * 提供日期、价格、星级等数据的格式化功能
 */

/**
 * 格式化日期
 * @param date 日期对象或日期字符串
 * @param format 格式字符串，默认 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 计算间夜数
 * @param checkIn 入住日期 (YYYY-MM-DD)
 * @param checkOut 离店日期 (YYYY-MM-DD)
 * @returns 间夜数
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // 计算时间差（毫秒）
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();

  // 转换为天数
  const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return nights;
}

/**
 * 格式化价格
 * @param price 价格数字
 * @returns 格式化后的价格字符串，如 "¥299"
 */
export function formatPrice(price: number): string {
  return `¥${price}`;
}

/**
 * 获取星级标签
 * @param rating 星级数字 (1-5)
 * @returns 星级标签字符串，如 "五星级"
 */
export function getStarRating(rating: number): string {
  const starMap: Record<number, string> = {
    1: '一星级',
    2: '二星级',
    3: '三星级',
    4: '四星级',
    5: '五星级'
  };

  return starMap[rating] || '未评级';
}

/**
 * 获取评分标签
 * @param score 评分数字 (0-5)
 * @returns 评分标签字符串
 */
export function getRatingLabel(score: number): string {
  if (score >= 4.5) {
    return '非常好';
  } else if (score >= 4.0) {
    return '很好';
  } else if (score >= 3.5) {
    return '好';
  } else if (score >= 3.0) {
    return '一般';
  } else {
    return '较差';
  }
}

/**
 * 解析价格区间
 * @param range 价格区间字符串，如 "¥150-300"
 * @returns 包含 minPrice 和 maxPrice 的对象
 */
export function parsePriceRange(range: string): { minPrice?: number; maxPrice?: number } {
  // 处理 "不限" 的情况
  if (range === '不限') {
    return {};
  }

  // 处理 "¥150以下" 的情况
  if (range.includes('以下')) {
    const match = range.match(/¥?(\d+)以下/);
    if (match) {
      return { maxPrice: parseInt(match[1]) };
    }
  }

  // 处理 "¥600以上" 的情况
  if (range.includes('以上')) {
    const match = range.match(/¥?(\d+)以上/);
    if (match) {
      return { minPrice: parseInt(match[1]) };
    }
  }

  // 处理 "¥150-300" 的情况
  const match = range.match(/¥?(\d+)-(\d+)/);
  if (match) {
    return {
      minPrice: parseInt(match[1]),
      maxPrice: parseInt(match[2])
    };
  }

  return {};
}

