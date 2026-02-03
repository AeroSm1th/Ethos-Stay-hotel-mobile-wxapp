/**
 * 缓存服务属性测试
 * Feature: wechat-miniprogram
 * 
 * 属性 17: 缓存数据往返一致性（Round-trip）
 * 验证需求: 7.6, 7.7
 */

import * as fc from 'fast-check';
import { CacheService } from './cache';
import { CACHE_EXPIRY } from '../utils/constants';

// 模拟微信存储 API
const mockStorage: Map<string, string> = new Map();
const mockStorageInfo = { keys: [] as string[] };

(global as any).wx = {
  setStorageSync: jest.fn((key: string, value: string) => {
    mockStorage.set(key, value);
    if (!mockStorageInfo.keys.includes(key)) {
      mockStorageInfo.keys.push(key);
    }
  }),
  getStorageSync: jest.fn((key: string) => {
    return mockStorage.get(key) || '';
  }),
  removeStorageSync: jest.fn((key: string) => {
    mockStorage.delete(key);
    mockStorageInfo.keys = mockStorageInfo.keys.filter(k => k !== key);
  }),
  clearStorageSync: jest.fn(() => {
    mockStorage.clear();
    mockStorageInfo.keys = [];
  }),
  getStorageInfoSync: jest.fn(() => {
    return { keys: Array.from(mockStorageInfo.keys) };
  })
};

describe('缓存服务属性测试', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    // 清空 mock 存储
    mockStorage.clear();
    mockStorageInfo.keys = [];
    jest.clearAllMocks();
    cacheService = new CacheService();
  });

  /**
   * 属性 17: 缓存数据往返一致性（Round-trip）
   * 对于任意数据对象和缓存键，设置缓存后在有效期内读取，应该得到相同的数据对象
   * 验证需求: 7.6, 7.7
   */
  describe('Property 17: 缓存数据往返一致性', () => {
    it('对于任意字符串数据，缓存后读取应该得到相同的值', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          (key, data) => {
            // 设置缓存
            cacheService.set(key, data);

            // 读取缓存
            const retrieved = cacheService.get<string>(key);

            // 验证：读取的值应该等于保存的值
            expect(retrieved).toBe(data);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于任意数字数据，缓存后读取应该得到相同的值', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: -1000000, max: 1000000 }),
          (key, data) => {
            cacheService.set(key, data);
            const retrieved = cacheService.get<number>(key);
            expect(retrieved).toBe(data);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于任意对象数据，缓存后读取应该得到相同的值', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.record({
            id: fc.integer({ min: 1, max: 100000 }),
            name: fc.string({ minLength: 1, maxLength: 20 }),
            value: fc.float({ min: 0, max: 1000 })
          }),
          (key, data) => {
            cacheService.set(key, data);
            const retrieved = cacheService.get<typeof data>(key);
            
            expect(retrieved).not.toBeNull();
            expect(retrieved?.id).toBe(data.id);
            expect(retrieved?.name).toBe(data.name);
            expect(retrieved?.value).toBeCloseTo(data.value, 5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于任意数组数据，缓存后读取应该得到相同的值', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 0, maxLength: 20 }),
          (key, data) => {
            cacheService.set(key, data);
            const retrieved = cacheService.get<number[]>(key);
            
            expect(retrieved).not.toBeNull();
            expect(retrieved).toEqual(data);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于任意布尔值数据，缓存后读取应该得到相同的值', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.boolean(),
          (key, data) => {
            cacheService.set(key, data);
            const retrieved = cacheService.get<boolean>(key);
            expect(retrieved).toBe(data);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于嵌套对象数据，缓存后读取应该保持结构一致', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.record({
            user: fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              name: fc.string({ minLength: 1, maxLength: 20 })
            }),
            items: fc.array(fc.integer({ min: 1, max: 100 }), { maxLength: 10 }),
            metadata: fc.record({
              timestamp: fc.integer({ min: 0, max: Date.now() }),
              version: fc.string({ minLength: 1, maxLength: 10 })
            })
          }),
          (key, data) => {
            cacheService.set(key, data);
            const retrieved = cacheService.get<typeof data>(key);
            
            expect(retrieved).not.toBeNull();
            expect(retrieved?.user.id).toBe(data.user.id);
            expect(retrieved?.user.name).toBe(data.user.name);
            expect(retrieved?.items).toEqual(data.items);
            expect(retrieved?.metadata.timestamp).toBe(data.metadata.timestamp);
            expect(retrieved?.metadata.version).toBe(data.metadata.version);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * 缓存过期测试
   */
  describe('缓存过期测试', () => {
    it('对于已过期的缓存，读取应该返回 null', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (key, data) => {
            // 设置缓存，过期时间为 0（立即过期）
            cacheService.set(key, data, 0);

            // 等待一小段时间确保过期
            const start = Date.now();
            while (Date.now() - start < 10) {
              // 忙等待
            }

            // 读取缓存
            const retrieved = cacheService.get<string>(key);

            // 验证：应该返回 null
            expect(retrieved).toBeNull();
          }
        ),
        { numRuns: 50 } // 减少运行次数，因为有等待时间
      );
    });

    it('对于未过期的缓存，isValid 应该返回 true', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.integer({ min: 1000, max: 10000 }),
          (key, data, expiry) => {
            // 设置缓存
            cacheService.set(key, data, expiry);

            // 验证：缓存应该有效
            expect(cacheService.isValid(key)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于已过期的缓存，isValid 应该返回 false', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (key, data) => {
            // 设置缓存，过期时间为 0
            cacheService.set(key, data, 0);

            // 等待一小段时间
            const start = Date.now();
            while (Date.now() - start < 10) {
              // 忙等待
            }

            // 验证：缓存应该无效
            expect(cacheService.isValid(key)).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * 缓存清除测试
   */
  describe('缓存清除测试', () => {
    it('清除指定缓存后，该缓存应该不存在', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (key, data) => {
            // 设置缓存
            cacheService.set(key, data);
            expect(cacheService.get(key)).toBe(data);

            // 清除缓存
            cacheService.clear(key);

            // 验证：缓存应该不存在
            expect(cacheService.get(key)).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('清除指定缓存不应该影响其他缓存', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.tuple(
              fc.string({ minLength: 1, maxLength: 50 }),
              fc.string({ minLength: 1, maxLength: 100 })
            ),
            { minLength: 2, maxLength: 5 }
          ),
          fc.integer({ min: 0, max: 4 }),
          (cacheItems, clearIndex) => {
            // 确保索引有效
            fc.pre(clearIndex < cacheItems.length);

            // 确保键不重复
            const keys = cacheItems.map(([key]) => key);
            const uniqueKeys = new Set(keys);
            fc.pre(uniqueKeys.size === keys.length);

            // 设置所有缓存
            cacheItems.forEach(([key, data]) => {
              cacheService.set(key, data);
            });

            // 清除指定缓存
            const [clearKey] = cacheItems[clearIndex];
            cacheService.clear(clearKey);

            // 验证：被清除的缓存不存在
            expect(cacheService.get(clearKey)).toBeNull();

            // 验证：其他缓存仍然存在
            cacheItems.forEach(([key, data], index) => {
              if (index !== clearIndex) {
                expect(cacheService.get(key)).toBe(data);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('清除所有缓存后，所有缓存应该不存在', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.tuple(
              fc.string({ minLength: 1, maxLength: 50 }),
              fc.string({ minLength: 1, maxLength: 100 })
            ),
            { minLength: 1, maxLength: 10 }
          ),
          (cacheItems) => {
            // 确保键不重复
            const keys = cacheItems.map(([key]) => key);
            const uniqueKeys = new Set(keys);
            fc.pre(uniqueKeys.size === keys.length);

            // 设置所有缓存
            cacheItems.forEach(([key, data]) => {
              cacheService.set(key, data);
            });

            // 清除所有缓存
            cacheService.clear();

            // 验证：所有缓存应该不存在
            cacheItems.forEach(([key]) => {
              expect(cacheService.get(key)).toBeNull();
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * 缓存覆盖测试
   */
  describe('缓存覆盖测试', () => {
    it('多次设置相同键的缓存，应该保留最后一次的值', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 2, maxLength: 10 }),
          (key, values) => {
            // 依次设置多个值
            values.forEach(value => {
              cacheService.set(key, value);
            });

            // 读取缓存
            const retrieved = cacheService.get<string>(key);

            // 验证：应该是最后一个值
            expect(retrieved).toBe(values[values.length - 1]);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * 不存在的缓存测试
   */
  describe('不存在的缓存测试', () => {
    it('读取不存在的缓存应该返回 null', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (key) => {
            // 读取不存在的缓存
            const retrieved = cacheService.get(key);

            // 验证：应该返回 null
            expect(retrieved).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('检查不存在的缓存，isValid 应该返回 false', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (key) => {
            // 验证：不存在的缓存应该无效
            expect(cacheService.isValid(key)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * 自定义过期时间测试
   */
  describe('自定义过期时间测试', () => {
    it('对于任意过期时间，缓存应该在过期前有效', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.integer({ min: 100, max: 10000 }),
          (key, data, expiry) => {
            // 设置缓存
            cacheService.set(key, data, expiry);

            // 立即读取
            const retrieved = cacheService.get<string>(key);

            // 验证：应该能读取到数据
            expect(retrieved).toBe(data);
            expect(cacheService.isValid(key)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
