/**
 * 缓存服务
 * 管理数据缓存，减少网络请求
 */

import { CacheItem } from '../types/index';
import { CACHE_EXPIRY, STORAGE_KEYS } from '../utils/constants';

/**
 * 缓存服务类
 */
export class CacheService {
  private cache: Map<string, CacheItem<any>>;

  constructor() {
    this.cache = new Map();
    // 从本地存储恢复缓存
    this.loadFromStorage();
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param expiry 过期时间（毫秒），默认 5 分钟
   */
  set<T>(key: string, data: T, expiry: number = CACHE_EXPIRY): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry,
    };

    // 保存到内存缓存
    this.cache.set(key, cacheItem);

    // 保存到本地存储
    this.saveToStorage(key, cacheItem);
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存数据，如果不存在或已过期则返回 null
   */
  get<T>(key: string): T | null {
    // 先从内存缓存获取
    let cacheItem: CacheItem<any> | undefined = this.cache.get(key);

    // 如果内存中没有，尝试从本地存储获取
    if (!cacheItem) {
      const loadedItem = this.loadFromStorageByKey(key);
      if (loadedItem) {
        cacheItem = loadedItem;
        this.cache.set(key, cacheItem);
      }
    }

    // 如果缓存不存在
    if (!cacheItem) {
      return null;
    }

    // 检查是否过期
    if (!this.isValid(key)) {
      this.clear(key);
      return null;
    }

    return cacheItem.data as T;
  }

  /**
   * 清除缓存
   * @param key 缓存键，如果不传则清除所有缓存
   */
  clear(key?: string): void {
    if (key) {
      // 清除指定缓存
      this.cache.delete(key);
      this.removeFromStorage(key);
    } else {
      // 清除所有缓存
      this.cache.clear();
      this.clearAllFromStorage();
    }
  }

  /**
   * 检查缓存是否有效
   * @param key 缓存键
   * @returns 是否有效
   */
  isValid(key: string): boolean {
    const cacheItem = this.cache.get(key);

    if (!cacheItem) {
      return false;
    }

    const now = Date.now();
    const age = now - cacheItem.timestamp;

    return age < cacheItem.expiry;
  }

  /**
   * 从本地存储加载缓存
   */
  private loadFromStorage(): void {
    try {
      const keys = this.getAllCacheKeys();
      
      keys.forEach(key => {
        const cacheItem = this.loadFromStorageByKey(key);
        if (cacheItem) {
          this.cache.set(key, cacheItem);
        }
      });
    } catch (error) {
      console.error('从本地存储加载缓存失败:', error);
    }
  }

  /**
   * 从本地存储加载指定键的缓存
   * @param key 缓存键
   * @returns 缓存项，如果不存在则返回 null
   */
  private loadFromStorageByKey(key: string): CacheItem<any> | null {
    try {
      const storageKey = this.getStorageKey(key);
      const data = wx.getStorageSync(storageKey);
      
      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      console.error(`从本地存储加载缓存 ${key} 失败:`, error);
      return null;
    }
  }

  /**
   * 保存缓存到本地存储
   * @param key 缓存键
   * @param cacheItem 缓存项
   */
  private saveToStorage(key: string, cacheItem: CacheItem<any>): void {
    try {
      const storageKey = this.getStorageKey(key);
      wx.setStorageSync(storageKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.error(`保存缓存 ${key} 到本地存储失败:`, error);
    }
  }

  /**
   * 从本地存储移除缓存
   * @param key 缓存键
   */
  private removeFromStorage(key: string): void {
    try {
      const storageKey = this.getStorageKey(key);
      wx.removeStorageSync(storageKey);
    } catch (error) {
      console.error(`从本地存储移除缓存 ${key} 失败:`, error);
    }
  }

  /**
   * 清除本地存储中的所有缓存
   */
  private clearAllFromStorage(): void {
    try {
      const keys = this.getAllCacheKeys();
      
      keys.forEach(key => {
        const storageKey = this.getStorageKey(key);
        wx.removeStorageSync(storageKey);
      });
    } catch (error) {
      console.error('清除本地存储中的所有缓存失败:', error);
    }
  }

  /**
   * 获取所有缓存键
   * @returns 缓存键数组
   */
  private getAllCacheKeys(): string[] {
    try {
      const info = wx.getStorageInfoSync();
      const keys = info.keys || [];
      
      // 过滤出缓存键（以 CACHE_PREFIX 开头）
      return keys
        .filter(key => key.startsWith(STORAGE_KEYS.CACHE_PREFIX))
        .map(key => key.replace(STORAGE_KEYS.CACHE_PREFIX, ''));
    } catch (error) {
      console.error('获取所有缓存键失败:', error);
      return [];
    }
  }

  /**
   * 获取存储键
   * @param key 缓存键
   * @returns 存储键
   */
  private getStorageKey(key: string): string {
    return STORAGE_KEYS.CACHE_PREFIX + key;
  }
}

/**
 * 创建默认缓存服务实例
 */
export const cache = new CacheService();
