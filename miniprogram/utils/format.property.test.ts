/**
 * 数据格式化工具属性测试
 * Feature: wechat-miniprogram, Property 1: 间夜数计算正确性
 * 验证需求: 2.4
 */

import * as fc from 'fast-check';
import { calculateNights, formatDate, formatPrice, getStarRating, getRatingLabel, parsePriceRange } from './format';

describe('格式化工具属性测试', () => {
  /**
   * 属性 1: 间夜数计算正确性
   * 对于任意有效的入住日期和离店日期，计算出的间夜数应该等于两个日期之间的天数差
   * 验证需求: 2.4
   */
  describe('Property 1: 间夜数计算正确性', () => {
    it('对于任意有效日期对，间夜数应该等于日期差', () => {
      fc.assert(
        fc.property(
          // 生成有效的日期对：入住日期和离店日期
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          fc.integer({ min: 1, max: 365 }), // 间隔天数
          (checkInDate, daysOffset) => {
            // 构造入住日期字符串
            const checkIn = formatDate(checkInDate, 'YYYY-MM-DD');
            
            // 构造离店日期（入住日期 + 偏移天数）
            const checkOutDate = new Date(checkInDate);
            checkOutDate.setDate(checkOutDate.getDate() + daysOffset);
            const checkOut = formatDate(checkOutDate, 'YYYY-MM-DD');

            // 计算间夜数
            const nights = calculateNights(checkIn, checkOut);

            // 验证：间夜数应该等于偏移天数
            expect(nights).toBe(daysOffset);
          },
        ),
        { numRuns: 100 }, // 运行 100 次迭代
      );
    });

    it('对于相同日期，间夜数应该为 0', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          (date) => {
            const dateStr = formatDate(date, 'YYYY-MM-DD');
            const nights = calculateNights(dateStr, dateStr);
            expect(nights).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('对于任意日期对，间夜数应该是非负整数', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          fc.integer({ min: 0, max: 365 }),
          (checkInDate, daysOffset) => {
            const checkIn = formatDate(checkInDate, 'YYYY-MM-DD');
            const checkOutDate = new Date(checkInDate);
            checkOutDate.setDate(checkOutDate.getDate() + daysOffset);
            const checkOut = formatDate(checkOutDate, 'YYYY-MM-DD');

            const nights = calculateNights(checkIn, checkOut);

            // 验证：间夜数应该是非负整数
            expect(nights).toBeGreaterThanOrEqual(0);
            expect(Number.isInteger(nights)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * 辅助属性测试：日期格式化
   */
  describe('日期格式化属性测试', () => {
    it('对于任意日期，格式化后应该符合 YYYY-MM-DD 格式', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
          (date) => {
            const formatted = formatDate(date, 'YYYY-MM-DD');
            
            // 验证格式：YYYY-MM-DD
            expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            
            // 验证可以被解析回日期
            const parsed = new Date(formatted);
            expect(parsed.getFullYear()).toBe(date.getFullYear());
            expect(parsed.getMonth()).toBe(date.getMonth());
            expect(parsed.getDate()).toBe(date.getDate());
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * 辅助属性测试：价格格式化
   */
  describe('价格格式化属性测试', () => {
    it('对于任意非负价格，格式化后应该以 ¥ 开头', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          (price) => {
            const formatted = formatPrice(price);
            expect(formatted).toMatch(/^¥\d+$/);
            expect(formatted).toBe(`¥${price}`);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * 辅助属性测试：星级标签
   */
  describe('星级标签属性测试', () => {
    it('对于 1-5 的星级，应该返回对应的中文标签', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (rating) => {
            const label = getStarRating(rating);
            expect(label).toMatch(/星级$/);
            expect(['一星级', '二星级', '三星级', '四星级', '五星级']).toContain(label);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('对于无效星级，应该返回"未评级"', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 6, max: 100 }),
          (rating) => {
            const label = getStarRating(rating);
            expect(label).toBe('未评级');
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * 辅助属性测试：评分标签
   */
  describe('评分标签属性测试', () => {
    it('对于任意评分，应该返回有效的标签', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 5 }),
          (score) => {
            const label = getRatingLabel(score);
            expect(['非常好', '很好', '好', '一般', '较差']).toContain(label);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('评分越高，标签应该越好', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 4.9 }),
          (score) => {
            const label1 = getRatingLabel(score);
            const label2 = getRatingLabel(score + 0.1);
            
            const labelOrder = ['较差', '一般', '好', '很好', '非常好'];
            const index1 = labelOrder.indexOf(label1);
            const index2 = labelOrder.indexOf(label2);
            
            // 评分更高的标签索引应该 >= 当前标签索引
            expect(index2).toBeGreaterThanOrEqual(index1);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * 辅助属性测试：价格区间解析
   */
  describe('价格区间解析属性测试', () => {
    it('应该正确解析"不限"', () => {
      const result = parsePriceRange('不限');
      expect(result).toEqual({});
    });

    it('应该正确解析"以下"格式', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          (price) => {
            const result = parsePriceRange(`¥${price}以下`);
            expect(result).toEqual({ maxPrice: price });
          },
        ),
        { numRuns: 100 },
      );
    });

    it('应该正确解析"以上"格式', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          (price) => {
            const result = parsePriceRange(`¥${price}以上`);
            expect(result).toEqual({ minPrice: price });
          },
        ),
        { numRuns: 100 },
      );
    });

    it('应该正确解析价格区间格式', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5000 }),
          fc.integer({ min: 1, max: 5000 }),
          (price1, price2) => {
            const minPrice = Math.min(price1, price2);
            const maxPrice = Math.max(price1, price2);
            
            const result = parsePriceRange(`¥${minPrice}-${maxPrice}`);
            expect(result).toEqual({ minPrice, maxPrice });
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});

