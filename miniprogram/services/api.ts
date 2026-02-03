/**
 * API 服务层
 * 封装所有后端 API 调用
 */

import { request } from '../utils/request';
import { Hotel, HotelListResponse } from '../types/index';

/**
 * 酒店 API 服务类
 */
export class HotelApiService {
  /**
   * 获取酒店列表
   * @param params 查询参数
   * @returns Promise<HotelListResponse>
   */
  async getHotelList(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    city?: string;
    starRating?: number;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<HotelListResponse> {
    return request.get<HotelListResponse>('/public/hotels', params);
  }

  /**
   * 获取酒店详情
   * @param id 酒店 ID
   * @returns Promise<Hotel>
   */
  async getHotelDetail(id: number): Promise<Hotel> {
    return request.get<Hotel>(`/public/hotels/${id}`);
  }
}

/**
 * 创建默认 API 服务实例
 */
export const hotelApi = new HotelApiService();
