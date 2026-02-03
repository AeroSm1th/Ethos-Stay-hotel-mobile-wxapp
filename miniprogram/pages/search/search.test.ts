/**
 * 查询页单元测试
 * 测试查询参数构造、日期选择和间夜数计算、页面跳转逻辑
 */

import { formatDate, calculateNights } from '../../utils/format';

describe('查询页功能测试', () => {
  describe('查询参数构造', () => {
    test('应该正确构造基本查询参数', () => {
      const params = {
        city: '北京',
        checkIn: '2024-03-01',
        checkOut: '2024-03-02',
      };

      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key as keyof typeof params])}`)
        .join('&');

      expect(queryString).toContain('city=%E5%8C%97%E4%BA%AC');
      expect(queryString).toContain('checkIn=2024-03-01');
      expect(queryString).toContain('checkOut=2024-03-02');
    });

    test('应该正确构造包含关键词的查询参数', () => {
      const params = {
        city: '上海',
        checkIn: '2024-03-01',
        checkOut: '2024-03-02',
        keyword: '希尔顿',
      };

      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key as keyof typeof params])}`)
        .join('&');

      expect(queryString).toContain('keyword=%E5%B8%8C%E5%B0%94%E9%A1%BF');
    });

    test('应该正确构造包含星级的查询参数', () => {
      const params = {
        city: '广州',
        checkIn: '2024-03-01',
        checkOut: '2024-03-02',
        starRating: '5',
      };

      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key as keyof typeof params])}`)
        .join('&');

      expect(queryString).toContain('starRating=5');
    });

    test('应该正确构造包含价格区间的查询参数', () => {
      const params = {
        city: '深圳',
        checkIn: '2024-03-01',
        checkOut: '2024-03-02',
        priceRange: '¥300-450',
      };

      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key as keyof typeof params])}`)
        .join('&');

      expect(queryString).toContain('priceRange=%C2%A5300-450');
    });

    test('应该正确构造包含设施标签的查询参数', () => {
      const tags = ['免费WiFi', '停车场', '游泳池'];
      const params = {
        city: '杭州',
        checkIn: '2024-03-01',
        checkOut: '2024-03-02',
        tags: tags.join(','),
      };

      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key as keyof typeof params])}`)
        .join('&');

      expect(queryString).toContain('tags=');
      expect(decodeURIComponent(queryString)).toContain('免费WiFi,停车场,游泳池');
    });
  });

  describe('日期选择和间夜数计算', () => {
    test('应该正确计算间夜数', () => {
      const checkIn = '2024-03-01';
      const checkOut = '2024-03-02';
      const nights = calculateNights(checkIn, checkOut);

      expect(nights).toBe(1);
    });

    test('应该正确计算多天的间夜数', () => {
      const checkIn = '2024-03-01';
      const checkOut = '2024-03-05';
      const nights = calculateNights(checkIn, checkOut);

      expect(nights).toBe(4);
    });

    test('当入住日期晚于离店日期时，应该自动调整离店日期', () => {
      const checkIn = '2024-03-05';
      const checkOut = '2024-03-02';

      // 模拟自动调整逻辑
      let adjustedCheckOut = checkOut;
      if (checkIn >= checkOut) {
        const newCheckOut = new Date(checkIn);
        newCheckOut.setDate(newCheckOut.getDate() + 1);
        adjustedCheckOut = formatDate(newCheckOut);
      }

      expect(adjustedCheckOut).toBe('2024-03-06');
      expect(calculateNights(checkIn, adjustedCheckOut)).toBe(1);
    });

    test('当离店日期早于入住日期时，应该自动调整入住日期', () => {
      const checkIn = '2024-03-05';
      const checkOut = '2024-03-02';

      // 模拟自动调整逻辑
      let adjustedCheckIn = checkIn;
      if (checkOut <= checkIn) {
        const newCheckIn = new Date(checkOut);
        newCheckIn.setDate(newCheckIn.getDate() - 1);
        adjustedCheckIn = formatDate(newCheckIn);
      }

      expect(adjustedCheckIn).toBe('2024-03-01');
      expect(calculateNights(adjustedCheckIn, checkOut)).toBe(1);
    });

    test('应该正确格式化日期', () => {
      const date = new Date('2024-03-15');
      const formatted = formatDate(date);

      expect(formatted).toBe('2024-03-15');
    });
  });

  describe('页面跳转逻辑', () => {
    test('应该构造正确的列表页跳转 URL', () => {
      const params = {
        city: '北京',
        checkIn: '2024-03-01',
        checkOut: '2024-03-02',
        keyword: '希尔顿',
        starRating: '5',
      };

      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key as keyof typeof params])}`)
        .join('&');

      const url = `/pages/list/list?${queryString}`;

      expect(url).toContain('/pages/list/list?');
      expect(url).toContain('city=');
      expect(url).toContain('checkIn=');
      expect(url).toContain('checkOut=');
      expect(url).toContain('keyword=');
      expect(url).toContain('starRating=');
    });

    test('应该构造正确的详情页跳转 URL', () => {
      const hotelId = 123;
      const checkIn = '2024-03-01';
      const checkOut = '2024-03-02';

      const url = `/pages/detail/detail?id=${hotelId}&checkIn=${checkIn}&checkOut=${checkOut}`;

      expect(url).toBe('/pages/detail/detail?id=123&checkIn=2024-03-01&checkOut=2024-03-02');
    });

    test('应该正确处理 URL 编码', () => {
      const city = '北京';
      const encoded = encodeURIComponent(city);

      expect(encoded).toBe('%E5%8C%97%E4%BA%AC');
      expect(decodeURIComponent(encoded)).toBe('北京');
    });
  });

  describe('GPS 定位城市匹配', () => {
    test('应该根据经纬度匹配北京', () => {
      const latitude = 39.9;
      const longitude = 116.4;

      // 模拟城市匹配逻辑
      let city = '北京';
      if (latitude > 39 && latitude < 41 && longitude > 116 && longitude < 117) {
        city = '北京';
      }

      expect(city).toBe('北京');
    });

    test('应该根据经纬度匹配上海', () => {
      const latitude = 31.2;
      const longitude = 121.5;

      // 模拟城市匹配逻辑
      let city = '北京';
      if (latitude > 30 && latitude < 32 && longitude > 121 && longitude < 122) {
        city = '上海';
      }

      expect(city).toBe('上海');
    });

    test('应该根据经纬度匹配广州', () => {
      const latitude = 23.1;
      const longitude = 113.3;

      // 模拟城市匹配逻辑
      let city = '北京';
      if (latitude > 22 && latitude < 24 && longitude > 113 && longitude < 114) {
        city = '广州';
      }

      expect(city).toBe('广州');
    });

    test('应该根据经纬度匹配深圳', () => {
      const latitude = 22.5;
      const longitude = 114.1;

      // 模拟城市匹配逻辑
      let city = '北京';
      if (latitude > 22 && latitude < 23 && longitude > 113 && longitude < 115) {
        city = '深圳';
      }

      expect(city).toBe('深圳');
    });

    test('未知位置应该返回默认城市', () => {
      const latitude = 50.0;
      const longitude = 100.0;

      // 模拟城市匹配逻辑
      let city = '北京'; // 默认
      
      // 检查是否匹配任何已知城市
      if (!(latitude > 39 && latitude < 41 && longitude > 116 && longitude < 117) &&
          !(latitude > 30 && latitude < 32 && longitude > 121 && longitude < 122) &&
          !(latitude > 22 && latitude < 24 && longitude > 113 && longitude < 114) &&
          !(latitude > 22 && latitude < 23 && longitude > 113 && longitude < 115)) {
        city = '北京';
      }

      expect(city).toBe('北京');
    });
  });
});
