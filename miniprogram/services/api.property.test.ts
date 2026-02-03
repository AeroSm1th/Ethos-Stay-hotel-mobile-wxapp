/**
 * API 服务属性测试
 * Feature: wechat-miniprogram
 * 
 * 属性 3: API 请求参数正确性
 * 验证需求: 3.1, 5.4
 * 
 * 属性 7: 酒店详情 API 请求正确性
 * 验证需求: 4.1
 */

import * as fc from 'fast-check';
import { HotelApiService } from './api';

// 模拟 wx.request
const mockWxRequest = jest.fn();
(global as any).wx = {
  request: mockWxRequest,
  showToast: jest.fn(),
};

describe('API 服务属性测试', () => {
  let apiService: HotelApiService;
  let capturedConfig: any;

  beforeEach(() => {
    // 重置 mock
    mockWxRequest.mockClear();
    capturedConfig = null;

    // 拦截 wx.request 调用，捕获配置
    mockWxRequest.mockImplementation((config: any) => {
      capturedConfig = config;
      // 模拟成功响应
      config.success({
        statusCode: 200,
        data: { data: [], page: 1, pageSize: 10, total: 0, totalPages: 0 },
        header: {},
      });
    });

    apiService = new HotelApiService();
  });

  /**
   * 属性 3: API 请求参数正确性
   * 对于任意有效的查询参数集合，系统构造的 API 请求应该包含所有非空参数
   * 验证需求: 3.1, 5.4
   */
  describe('Property 3: API 请求参数正确性', () => {
    it('对于任意查询参数，请求 URL 应该包含所有非空参数', async () => {
      await fc.assert(
        fc.asyncProperty(
          // 生成随机查询参数
          fc.record({
            page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
            pageSize: fc.option(fc.integer({ min: 1, max: 50 }), { nil: undefined }),
            keyword: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
            city: fc.option(fc.constantFrom('北京', '上海', '广州', '深圳', '杭州'), { nil: undefined }),
            starRating: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
            minPrice: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: undefined }),
            maxPrice: fc.option(fc.integer({ min: 100, max: 5000 }), { nil: undefined }),
          }),
          async (params) => {
            // 调用 API
            await apiService.getHotelList(params);

            // 验证请求被调用
            expect(mockWxRequest).toHaveBeenCalled();

            // 获取请求 URL
            const requestUrl = capturedConfig.url;
            expect(requestUrl).toContain('/public/hotels');

            // 验证所有非空参数都在 URL 中
            Object.entries(params).forEach(([key, value]) => {
              if (value !== undefined && value !== null && value !== '') {
                expect(requestUrl).toContain(`${key}=${encodeURIComponent(value)}`);
              }
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it('对于空参数对象，应该只请求基础 URL', async () => {
      await apiService.getHotelList({});

      expect(mockWxRequest).toHaveBeenCalled();
      const requestUrl = capturedConfig.url;
      
      // URL 应该包含基础路径，但不应该有查询参数
      expect(requestUrl).toContain('/public/hotels');
      expect(requestUrl).not.toContain('?');
    });

    it('对于包含 undefined 和 null 的参数，应该过滤掉这些参数', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 1, max: 5 }),
          async (keyword, starRating) => {
            // 包含 undefined 和 null 的参数
            await apiService.getHotelList({
              keyword,
              starRating,
              city: undefined,
              minPrice: null as any,
              maxPrice: undefined,
            });

            const requestUrl = capturedConfig.url;

            // 应该包含非空参数
            expect(requestUrl).toContain(`keyword=${encodeURIComponent(keyword)}`);
            expect(requestUrl).toContain(`starRating=${starRating}`);

            // 不应该包含空参数
            expect(requestUrl).not.toContain('city=');
            expect(requestUrl).not.toContain('minPrice=');
            expect(requestUrl).not.toContain('maxPrice=');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('对于任意城市和关键词，应该正确编码特殊字符', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          async (keyword) => {
            await apiService.getHotelList({ keyword });

            const requestUrl = capturedConfig.url;
            
            // URL 应该包含编码后的关键词
            expect(requestUrl).toContain('keyword=');
            
            // 验证特殊字符被正确编码
            if (keyword.includes(' ')) {
              expect(requestUrl).toContain('%20');
            }
            if (keyword.includes('&')) {
              expect(requestUrl).toContain('%26');
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * 属性 7: 酒店详情 API 请求正确性
   * 对于任意有效的酒店 ID，系统应该发起到 /api/public/hotels/:id 的 GET 请求
   * 验证需求: 4.1
   */
  describe('Property 7: 酒店详情 API 请求正确性', () => {
    beforeEach(() => {
      // 为详情请求设置不同的响应
      mockWxRequest.mockImplementation((config: any) => {
        capturedConfig = config;
        config.success({
          statusCode: 200,
          data: {
            id: 1,
            nameCn: '测试酒店',
            address: '测试地址',
            starRating: 4,
          },
          header: {},
        });
      });
    });

    it('对于任意酒店 ID，应该请求正确的详情 URL', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 100000 }),
          async (hotelId) => {
            // 调用详情 API
            await apiService.getHotelDetail(hotelId);

            // 验证请求被调用
            expect(mockWxRequest).toHaveBeenCalled();

            // 验证 URL 格式
            const requestUrl = capturedConfig.url;
            expect(requestUrl).toContain('/public/hotels/');
            expect(requestUrl).toContain(`/public/hotels/${hotelId}`);

            // 验证请求方法
            expect(capturedConfig.method).toBe('GET');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('对于任意酒店 ID，URL 中不应该包含查询参数', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 100000 }),
          async (hotelId) => {
            await apiService.getHotelDetail(hotelId);

            const requestUrl = capturedConfig.url;
            
            // 详情请求不应该有查询参数
            const urlParts = requestUrl.split('?');
            expect(urlParts.length).toBe(1);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('对于不同的酒店 ID，应该请求不同的 URL', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 100000 }),
          fc.integer({ min: 1, max: 100000 }),
          async (id1, id2) => {
            // 跳过相同 ID 的情况
            fc.pre(id1 !== id2);

            // 请求第一个酒店
            await apiService.getHotelDetail(id1);
            const url1 = capturedConfig.url;

            // 请求第二个酒店
            await apiService.getHotelDetail(id2);
            const url2 = capturedConfig.url;

            // 两个 URL 应该不同
            expect(url1).not.toBe(url2);
            expect(url1).toContain(`/${id1}`);
            expect(url2).toContain(`/${id2}`);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * 辅助属性测试：请求方法正确性
   */
  describe('请求方法正确性', () => {
    it('getHotelList 应该使用 GET 方法', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
            keyword: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
          }),
          async (params) => {
            await apiService.getHotelList(params);
            expect(capturedConfig.method).toBe('GET');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('getHotelDetail 应该使用 GET 方法', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 100000 }),
          async (hotelId) => {
            await apiService.getHotelDetail(hotelId);
            expect(capturedConfig.method).toBe('GET');
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * 辅助属性测试：请求头正确性
   */
  describe('请求头正确性', () => {
    it('所有请求应该包含 Content-Type 头', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 100000 }),
          async (hotelId) => {
            await apiService.getHotelDetail(hotelId);
            expect(capturedConfig.header).toBeDefined();
            expect(capturedConfig.header['Content-Type']).toBe('application/json');
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
