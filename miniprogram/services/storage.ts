/**
 * 本地存储服务
 * 管理小程序的本地存储数据
 */

import { Hotel } from '../types/index';
import { STORAGE_KEYS, MAX_HISTORY_COUNT } from '../utils/constants';

/**
 * 存储服务类
 */
export class StorageService {
  /**
   * 保存最近选择的城市
   * @param city 城市名称
   */
  saveRecentCity(city: string): void {
    try {
      wx.setStorageSync(STORAGE_KEYS.RECENT_CITY, city);
    } catch (error) {
      console.error('保存城市失败:', error);
    }
  }

  /**
   * 获取最近选择的城市
   * @returns 城市名称，如果没有则返回 null
   */
  getRecentCity(): string | null {
    try {
      const city = wx.getStorageSync(STORAGE_KEYS.RECENT_CITY);
      return city || null;
    } catch (error) {
      console.error('获取城市失败:', error);
      return null;
    }
  }

  /**
   * 保存收藏的酒店 ID 列表
   * @param hotelIds 酒店 ID 数组
   */
  saveFavorites(hotelIds: number[]): void {
    try {
      wx.setStorageSync(STORAGE_KEYS.FAVORITES, JSON.stringify(hotelIds));
    } catch (error) {
      console.error('保存收藏失败:', error);
    }
  }

  /**
   * 获取收藏的酒店 ID 列表
   * @returns 酒店 ID 数组
   */
  getFavorites(): number[] {
    try {
      const data = wx.getStorageSync(STORAGE_KEYS.FAVORITES);
      if (!data) {
        return [];
      }
      const favorites = JSON.parse(data);
      return Array.isArray(favorites) ? favorites : [];
    } catch (error) {
      console.error('获取收藏失败:', error);
      return [];
    }
  }

  /**
   * 添加收藏
   * @param hotelId 酒店 ID
   */
  addFavorite(hotelId: number): void {
    try {
      const favorites = this.getFavorites();
      
      // 如果已经收藏，不重复添加
      if (favorites.includes(hotelId)) {
        return;
      }

      favorites.push(hotelId);
      this.saveFavorites(favorites);
    } catch (error) {
      console.error('添加收藏失败:', error);
    }
  }

  /**
   * 移除收藏
   * @param hotelId 酒店 ID
   */
  removeFavorite(hotelId: number): void {
    try {
      const favorites = this.getFavorites();
      const index = favorites.indexOf(hotelId);
      
      if (index > -1) {
        favorites.splice(index, 1);
        this.saveFavorites(favorites);
      }
    } catch (error) {
      console.error('移除收藏失败:', error);
    }
  }

  /**
   * 检查是否已收藏
   * @param hotelId 酒店 ID
   * @returns 是否已收藏
   */
  isFavorite(hotelId: number): boolean {
    try {
      const favorites = this.getFavorites();
      return favorites.includes(hotelId);
    } catch (error) {
      console.error('检查收藏状态失败:', error);
      return false;
    }
  }

  /**
   * 保存浏览历史
   * @param hotel 酒店对象
   */
  saveHistory(hotel: Hotel): void {
    try {
      const history = this.getHistory();
      
      // 移除已存在的相同酒店（避免重复）
      const filteredHistory = history.filter(h => h.id !== hotel.id);
      
      // 将新酒店添加到开头
      filteredHistory.unshift(hotel);
      
      // 限制历史记录数量
      const limitedHistory = filteredHistory.slice(0, MAX_HISTORY_COUNT);
      
      wx.setStorageSync(STORAGE_KEYS.HISTORY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('保存浏览历史失败:', error);
    }
  }

  /**
   * 获取浏览历史
   * @returns 酒店数组（最近浏览的在前）
   */
  getHistory(): Hotel[] {
    try {
      const data = wx.getStorageSync(STORAGE_KEYS.HISTORY);
      if (!data) {
        return [];
      }
      const history = JSON.parse(data);
      return Array.isArray(history) ? history : [];
    } catch (error) {
      console.error('获取浏览历史失败:', error);
      return [];
    }
  }

  /**
   * 清除所有存储数据
   */
  clearAll(): void {
    try {
      wx.clearStorageSync();
    } catch (error) {
      console.error('清除存储失败:', error);
    }
  }

  /**
   * 清除指定键的数据
   * @param key 存储键名
   */
  clear(key: string): void {
    try {
      wx.removeStorageSync(key);
    } catch (error) {
      console.error(`清除存储 ${key} 失败:`, error);
    }
  }
}

/**
 * 创建默认存储服务实例
 */
export const storage = new StorageService();
