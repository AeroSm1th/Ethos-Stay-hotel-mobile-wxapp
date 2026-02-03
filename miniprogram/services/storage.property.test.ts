/**
 * 存储服务属性测试
 * Feature: wechat-miniprogram
 * 
 * 属性 14: 城市存储往返一致性
 * 验证需求: 7.1, 7.2
 * 
 * 属性 15: 收藏状态存储往返一致性
 * 验证需求: 7.3, 7.4
 * 
 * 属性 16: 浏览历史记录正确性
 * 验证需求: 7.5
 */

import * as fc from 'fast-check';
import { StorageService } from './storage';
import { Hotel } from '../types/index';
import { MAX_HISTORY_COUNT } from '../utils/constants';

// 模拟微信存储 API
const mockStorage: Map<string, string> = new Map();

(global as any).wx = {
  setStorageSync: jest.fn((key: string, value: string) => {
    mockStorage.set(key, value);
  }),
  getStorageSync: jest.fn((key: string) => {
    return mockStorage.get(key) || '';
  }),
  removeStorageSync: jest.fn((key: string) => {
    mockStorage.delete(key);
  }),
  clearStorageSync: jest.fn(() => {
    mockStorage.clear();
  }),
};

describe('存储服务属性测试', () => {
  let storageService: StorageService;

  beforeEach(() => {
    // 清空 mock 存储
    mockStorage.clear();
    jest.clearAllMocks();
    storageService = new StorageService();
  });

  /**
   * 属性 14: 城市存储往返一致性（Round-trip）
   * 对于任意城市名称，保存到本地存储后再读取，应该得到相同的城市名称
   * 验证需求: 7.1, 7.2
   */
  describe('Property 14: 城市存储往返一致性', () => {
    it('对于任意城市名称，存储后读取应该得到相同的值', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (city) => {
            // 保存城市
            storageService.saveRecentCity(city);

            // 读取城市
            const retrieved = storageService.getRecentCity();

            // 验证：读取的值应该等于保存的值
            expect(retrieved).toBe(city);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('对于中文城市名称，存储后读取应该保持一致', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('北京', '上海', '广州', '深圳', '杭州', '成都', '西安', '三亚'),
          (city) => {
            storageService.saveRecentCity(city);
            const retrieved = storageService.getRecentCity();
            expect(retrieved).toBe(city);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('多次保存不同城市，应该保留最后一次保存的值', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 10 }),
          (cities) => {
            // 依次保存多个城市
            cities.forEach(city => {
              storageService.saveRecentCity(city);
            });

            // 读取城市
            const retrieved = storageService.getRecentCity();

            // 验证：应该是最后一个城市
            expect(retrieved).toBe(cities[cities.length - 1]);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('保存空字符串后，读取应该返回 null', () => {
      storageService.saveRecentCity('');
      const retrieved = storageService.getRecentCity();
      expect(retrieved).toBe(null);
    });
  });

  /**
   * 属性 15: 收藏状态存储往返一致性（Round-trip）
   * 对于任意酒店 ID，添加到收藏列表后再读取，收藏列表应该包含该酒店 ID
   * 验证需求: 7.3, 7.4
   */
  describe('Property 15: 收藏状态存储往返一致性', () => {
    it('对于任意酒店 ID，添加收藏后应该能查询到', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          (hotelId) => {
            // 添加收藏
            storageService.addFavorite(hotelId);

            // 检查收藏状态
            const isFavorited = storageService.isFavorite(hotelId);

            // 验证：应该已收藏
            expect(isFavorited).toBe(true);

            // 验证：收藏列表应该包含该 ID
            const favorites = storageService.getFavorites();
            expect(favorites).toContain(hotelId);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('对于任意酒店 ID 数组，批量保存后应该能全部读取', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 100000 }), { minLength: 1, maxLength: 20 }),
          (hotelIds) => {
            // 去重
            const uniqueIds = Array.from(new Set(hotelIds));

            // 批量保存
            storageService.saveFavorites(uniqueIds);

            // 读取收藏列表
            const retrieved = storageService.getFavorites();

            // 验证：长度应该相同
            expect(retrieved.length).toBe(uniqueIds.length);

            // 验证：所有 ID 都应该存在
            uniqueIds.forEach(id => {
              expect(retrieved).toContain(id);
              expect(storageService.isFavorite(id)).toBe(true);
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it('添加收藏后移除，应该不再存在于收藏列表', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          (hotelId) => {
            // 添加收藏
            storageService.addFavorite(hotelId);
            expect(storageService.isFavorite(hotelId)).toBe(true);

            // 移除收藏
            storageService.removeFavorite(hotelId);

            // 验证：应该不再收藏
            expect(storageService.isFavorite(hotelId)).toBe(false);

            // 验证：收藏列表不应该包含该 ID
            const favorites = storageService.getFavorites();
            expect(favorites).not.toContain(hotelId);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('重复添加相同酒店，收藏列表中应该只有一个', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.integer({ min: 2, max: 10 }),
          (hotelId, repeatCount) => {
            // 重复添加多次
            for (let i = 0; i < repeatCount; i++) {
              storageService.addFavorite(hotelId);
            }

            // 验证：收藏列表中只有一个
            const favorites = storageService.getFavorites();
            const count = favorites.filter(id => id === hotelId).length;
            expect(count).toBe(1);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('移除不存在的收藏，不应该影响其他收藏', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 100000 }), { minLength: 2, maxLength: 10 }),
          fc.integer({ min: 100001, max: 200000 }),
          (existingIds, nonExistingId) => {
            // 确保 nonExistingId 不在 existingIds 中
            fc.pre(!existingIds.includes(nonExistingId));

            // 添加现有收藏
            const uniqueIds = Array.from(new Set(existingIds));
            storageService.saveFavorites(uniqueIds);

            // 移除不存在的收藏
            storageService.removeFavorite(nonExistingId);

            // 验证：现有收藏应该不受影响
            const favorites = storageService.getFavorites();
            expect(favorites.length).toBe(uniqueIds.length);
            uniqueIds.forEach(id => {
              expect(favorites).toContain(id);
            });
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * 属性 16: 浏览历史记录正确性
   * 对于任意酒店对象，添加到浏览历史后，历史列表应该包含该酒店（最多保留最近 10 条）
   * 验证需求: 7.5
   */
  describe('Property 16: 浏览历史记录正确性', () => {
    // 生成随机酒店对象
    const hotelArbitrary = fc.record({
      id: fc.integer({ min: 1, max: 100000 }),
      nameCn: fc.string({ minLength: 2, maxLength: 20 }),
      address: fc.string({ minLength: 5, maxLength: 50 }),
      starRating: fc.integer({ min: 1, max: 5 }),
    }) as fc.Arbitrary<Hotel>;

    it('对于任意酒店，保存后应该出现在历史记录的第一位', () => {
      fc.assert(
        fc.property(
          hotelArbitrary,
          (hotel) => {
            // 保存浏览历史
            storageService.saveHistory(hotel);

            // 读取历史记录
            const history = storageService.getHistory();

            // 验证：历史记录不为空
            expect(history.length).toBeGreaterThan(0);

            // 验证：该酒店应该在第一位
            expect(history[0].id).toBe(hotel.id);
            expect(history[0].nameCn).toBe(hotel.nameCn);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('浏览历史应该保持最近浏览的在前', () => {
      fc.assert(
        fc.property(
          fc.array(hotelArbitrary, { minLength: 2, maxLength: 5 }),
          (hotels) => {
            // 确保酒店 ID 不重复
            const uniqueHotels = hotels.filter((hotel, index, self) => 
              self.findIndex(h => h.id === hotel.id) === index,
            );

            fc.pre(uniqueHotels.length >= 2);

            // 依次保存浏览历史
            uniqueHotels.forEach(hotel => {
              storageService.saveHistory(hotel);
            });

            // 读取历史记录
            const history = storageService.getHistory();

            // 验证：最后浏览的应该在第一位
            expect(history[0].id).toBe(uniqueHotels[uniqueHotels.length - 1].id);

            // 验证：倒数第二个浏览的应该在第二位
            if (uniqueHotels.length >= 2) {
              expect(history[1].id).toBe(uniqueHotels[uniqueHotels.length - 2].id);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('浏览历史应该限制在最多 10 条', () => {
      fc.assert(
        fc.property(
          fc.array(hotelArbitrary, { minLength: 11, maxLength: 20 }),
          (hotels) => {
            // 确保酒店 ID 不重复
            const uniqueHotels = hotels.filter((hotel, index, self) => 
              self.findIndex(h => h.id === hotel.id) === index,
            );

            fc.pre(uniqueHotels.length > MAX_HISTORY_COUNT);

            // 依次保存浏览历史
            uniqueHotels.forEach(hotel => {
              storageService.saveHistory(hotel);
            });

            // 读取历史记录
            const history = storageService.getHistory();

            // 验证：历史记录不超过 MAX_HISTORY_COUNT
            expect(history.length).toBeLessThanOrEqual(MAX_HISTORY_COUNT);
            expect(history.length).toBe(MAX_HISTORY_COUNT);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('重复浏览同一酒店，应该移到最前面且不重复', () => {
      fc.assert(
        fc.property(
          fc.array(hotelArbitrary, { minLength: 3, maxLength: 5 }),
          fc.integer({ min: 0, max: 2 }),
          (hotels, repeatIndex) => {
            // 确保酒店 ID 不重复
            const uniqueHotels = hotels.filter((hotel, index, self) => 
              self.findIndex(h => h.id === hotel.id) === index,
            );

            fc.pre(uniqueHotels.length >= 3);
            fc.pre(repeatIndex < uniqueHotels.length);

            // 依次保存浏览历史
            uniqueHotels.forEach(hotel => {
              storageService.saveHistory(hotel);
            });

            // 再次浏览之前浏览过的酒店
            const repeatHotel = uniqueHotels[repeatIndex];
            storageService.saveHistory(repeatHotel);

            // 读取历史记录
            const history = storageService.getHistory();

            // 验证：该酒店应该在第一位
            expect(history[0].id).toBe(repeatHotel.id);

            // 验证：该酒店在历史中只出现一次
            const count = history.filter(h => h.id === repeatHotel.id).length;
            expect(count).toBe(1);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('空历史记录应该返回空数组', () => {
      const history = storageService.getHistory();
      expect(history).toEqual([]);
      expect(Array.isArray(history)).toBe(true);
    });
  });

  /**
   * 辅助属性测试：存储清除功能
   */
  describe('存储清除功能', () => {
    it('清除所有存储后，所有数据应该为空', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.array(fc.integer({ min: 1, max: 100000 }), { minLength: 1, maxLength: 5 }),
          (city, hotelIds) => {
            // 保存一些数据
            storageService.saveRecentCity(city);
            storageService.saveFavorites(hotelIds);

            // 清除所有存储
            storageService.clearAll();

            // 验证：所有数据应该为空
            expect(storageService.getRecentCity()).toBe(null);
            expect(storageService.getFavorites()).toEqual([]);
            expect(storageService.getHistory()).toEqual([]);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
