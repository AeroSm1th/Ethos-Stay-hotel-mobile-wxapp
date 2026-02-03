/**
 * 价格区间解析功能测试
 * 测试 parsePriceRange 方法是否正确解析各种价格区间格式
 */

describe('价格区间解析功能测试', () => {
  /**
   * 解析价格区间字符串
   * @param priceRange 价格区间字符串（如 "¥150-300"）
   * @returns { minPrice?: number, maxPrice?: number }
   */
  function parsePriceRange(priceRange: string): { minPrice?: number; maxPrice?: number } {
    if (priceRange === '不限') {
      return {};
    }

    // 匹配 "¥150以下"
    const belowMatch = priceRange.match(/¥(\d+)以下/);
    if (belowMatch) {
      return { maxPrice: parseInt(belowMatch[1]) };
    }

    // 匹配 "¥600以上"
    const aboveMatch = priceRange.match(/¥(\d+)以上/);
    if (aboveMatch) {
      return { minPrice: parseInt(aboveMatch[1]) };
    }

    // 匹配 "¥150-300"
    const rangeMatch = priceRange.match(/¥(\d+)-(\d+)/);
    if (rangeMatch) {
      return {
        minPrice: parseInt(rangeMatch[1]),
        maxPrice: parseInt(rangeMatch[2]),
      };
    }

    return {};
  }

  describe('基本价格区间解析', () => {
    test('应该正确解析"不限"', () => {
      const result = parsePriceRange('不限');
      expect(result).toEqual({});
    });

    test('应该正确解析"¥150以下"', () => {
      const result = parsePriceRange('¥150以下');
      expect(result).toEqual({ maxPrice: 150 });
    });

    test('应该正确解析"¥600以上"', () => {
      const result = parsePriceRange('¥600以上');
      expect(result).toEqual({ minPrice: 600 });
    });

    test('应该正确解析"¥150-300"', () => {
      const result = parsePriceRange('¥150-300');
      expect(result).toEqual({ minPrice: 150, maxPrice: 300 });
    });

    test('应该正确解析"¥300-450"', () => {
      const result = parsePriceRange('¥300-450');
      expect(result).toEqual({ minPrice: 300, maxPrice: 450 });
    });

    test('应该正确解析"¥450-600"', () => {
      const result = parsePriceRange('¥450-600');
      expect(result).toEqual({ minPrice: 450, maxPrice: 600 });
    });
  });

  describe('边界情况测试', () => {
    test('应该正确处理空字符串', () => {
      const result = parsePriceRange('');
      expect(result).toEqual({});
    });

    test('应该正确处理无效格式', () => {
      const result = parsePriceRange('无效格式');
      expect(result).toEqual({});
    });

    test('应该正确处理大数字', () => {
      const result = parsePriceRange('¥1000-2000');
      expect(result).toEqual({ minPrice: 1000, maxPrice: 2000 });
    });

    test('应该正确处理"¥0以下"', () => {
      const result = parsePriceRange('¥0以下');
      expect(result).toEqual({ maxPrice: 0 });
    });

    test('应该正确处理"¥0以上"', () => {
      const result = parsePriceRange('¥0以上');
      expect(result).toEqual({ minPrice: 0 });
    });
  });

  describe('所有标准价格选项', () => {
    const PRICE_OPTIONS = [
      '不限',
      '¥150以下',
      '¥150-300',
      '¥300-450',
      '¥450-600',
      '¥600以上',
    ];

    test('应该能够解析所有标准价格选项', () => {
      const results = PRICE_OPTIONS.map(option => ({
        option,
        parsed: parsePriceRange(option),
      }));

      expect(results).toEqual([
        { option: '不限', parsed: {} },
        { option: '¥150以下', parsed: { maxPrice: 150 } },
        { option: '¥150-300', parsed: { minPrice: 150, maxPrice: 300 } },
        { option: '¥300-450', parsed: { minPrice: 300, maxPrice: 450 } },
        { option: '¥450-600', parsed: { minPrice: 450, maxPrice: 600 } },
        { option: '¥600以上', parsed: { minPrice: 600 } },
      ]);
    });

    test('所有解析结果都应该是有效的对象', () => {
      PRICE_OPTIONS.forEach(option => {
        const result = parsePriceRange(option);
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      });
    });

    test('解析结果中的价格应该都是数字', () => {
      PRICE_OPTIONS.forEach(option => {
        const result = parsePriceRange(option);
        if (result.minPrice !== undefined) {
          expect(typeof result.minPrice).toBe('number');
          expect(result.minPrice).toBeGreaterThanOrEqual(0);
        }
        if (result.maxPrice !== undefined) {
          expect(typeof result.maxPrice).toBe('number');
          expect(result.maxPrice).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('价格区间逻辑验证', () => {
    test('区间价格中 minPrice 应该小于 maxPrice', () => {
      const rangeOptions = ['¥150-300', '¥300-450', '¥450-600'];
      
      rangeOptions.forEach(option => {
        const result = parsePriceRange(option);
        if (result.minPrice !== undefined && result.maxPrice !== undefined) {
          expect(result.minPrice).toBeLessThan(result.maxPrice);
        }
      });
    });

    test('"以下"选项应该只有 maxPrice', () => {
      const result = parsePriceRange('¥150以下');
      expect(result.minPrice).toBeUndefined();
      expect(result.maxPrice).toBeDefined();
    });

    test('"以上"选项应该只有 minPrice', () => {
      const result = parsePriceRange('¥600以上');
      expect(result.minPrice).toBeDefined();
      expect(result.maxPrice).toBeUndefined();
    });

    test('"不限"选项应该没有任何价格限制', () => {
      const result = parsePriceRange('不限');
      expect(result.minPrice).toBeUndefined();
      expect(result.maxPrice).toBeUndefined();
      expect(Object.keys(result).length).toBe(0);
    });
  });
});
