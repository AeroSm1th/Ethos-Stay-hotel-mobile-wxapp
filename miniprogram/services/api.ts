/**
 * API 服务层
 * 封装所有后端 API 调用
 */

import { request } from '../utils/request';
import { Hotel, HotelListResponse } from '../types/index';
import { cache } from './cache';
import { requestDeduplicator } from '../utils/performance';

/**
 * 酒店 API 服务类
 */
export class HotelApiService {
  /**
   * 获取酒店列表
   * @param params 查询参数
   * @param useCache 是否使用缓存，默认为 true
   * @returns Promise<HotelListResponse>
   */
  async getHotelList(
    params: {
      page?: number;
      pageSize?: number;
      keyword?: string;
      city?: string;
      starRating?: number;
      minPrice?: number;
      maxPrice?: number;
    },
    useCache = true,
  ): Promise<HotelListResponse> {
    // 生成缓存键
    const cacheKey = this.generateCacheKey('hotel-list', params);

    // 尝试从缓存获取
    if (useCache) {
      const cachedData = cache.get<HotelListResponse>(cacheKey);
      if (cachedData) {
        console.log('从缓存获取酒店列表:', cacheKey);
        return cachedData;
      }
    }

    // 使用请求去重，避免重复请求
    const data = await requestDeduplicator.execute(cacheKey, async () => {
      console.log('从网络获取酒店列表:', cacheKey);
      return request.get<HotelListResponse>('/public/hotels', params);
    });

    // 保存到缓存（5 分钟过期）
    cache.set(cacheKey, data, 5 * 60 * 1000);

    return data;
  }

  /**
   * 获取酒店详情
   * @param id 酒店 ID
   * @param useCache 是否使用缓存，默认为 true
   * @returns Promise<Hotel>
   */
  async getHotelDetail(id: number, useCache = true): Promise<Hotel> {
    // 生成缓存键
    const cacheKey = `hotel-detail-${id}`;

    // 尝试从缓存获取
    if (useCache) {
      const cachedData = cache.get<Hotel>(cacheKey);
      if (cachedData) {
        console.log('从缓存获取酒店详情:', cacheKey);
        return cachedData;
      }
    }

    // 使用请求去重，避免重复请求
    const data = await requestDeduplicator.execute(cacheKey, async () => {
      console.log('从网络获取酒店详情:', cacheKey);
      return request.get<Hotel>(`/public/hotels/${id}`);
    });

    // 保存到缓存（5 分钟过期）
    cache.set(cacheKey, data, 5 * 60 * 1000);

    return data;
  }

  /**
   * 生成缓存键
   * @param prefix 前缀
   * @param params 参数对象
   * @returns 缓存键
   */
  private generateCacheKey(prefix: string, params: Record<string, any>): string {
    // 将参数对象转换为排序后的字符串
    const sortedParams = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `${prefix}-${sortedParams}`;
  }
}

/**
 * 创建默认 API 服务实例
 */
export const hotelApi = new HotelApiService();
