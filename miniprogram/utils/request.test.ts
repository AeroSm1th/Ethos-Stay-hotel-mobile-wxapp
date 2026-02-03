/**
 * 网络请求工具单元测试
 */

import { Request } from './request';

describe('Request 网络请求工具', () => {
  let request: Request;

  beforeEach(() => {
    request = new Request({
      baseURL: 'https://api.example.com',
      timeout: 5000,
    });
  });

  describe('URL 构造测试', () => {
    it('应该正确拼接基础 URL 和请求路径', () => {
      const config = (request as any).beforeRequest({
        url: '/hotels',
        method: 'GET',
      });

      expect(config.url).toBe('https://api.example.com/hotels');
    });

    it('应该保持完整 URL 不变', () => {
      const config = (request as any).beforeRequest({
        url: 'https://other-api.com/hotels',
        method: 'GET',
      });

      expect(config.url).toBe('https://other-api.com/hotels');
    });

    it('应该正确构造带查询参数的 GET 请求 URL', () => {
      // 模拟 get 方法的查询字符串构造逻辑
      const params = {
        city: '北京',
        page: 1,
        pageSize: 10,
      };

      const queryParams: string[] = [];
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      });
      const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';

      expect(queryString).toContain('city=%E5%8C%97%E4%BA%AC');
      expect(queryString).toContain('page=1');
      expect(queryString).toContain('pageSize=10');
    });
  });

  describe('参数传递测试', () => {
    it('应该过滤掉 undefined 和 null 参数', () => {
      const params = {
        city: '北京',
        keyword: undefined,
        page: 1,
        empty: null,
        zero: 0,
      };

      const queryParams: string[] = [];
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      });

      const queryString = queryParams.join('&');
      expect(queryString).toContain('city=');
      expect(queryString).toContain('page=');
      expect(queryString).toContain('zero=');
      expect(queryString).not.toContain('keyword');
      expect(queryString).not.toContain('empty');
    });

    it('应该正确编码特殊字符', () => {
      const params = {
        keyword: '酒店 & 宾馆',
      };

      const value = encodeURIComponent(params.keyword);
      expect(value).toBe('%E9%85%92%E5%BA%97%20%26%20%E5%AE%BE%E9%A6%86');
    });

    it('应该设置默认请求头', () => {
      const config = (request as any).beforeRequest({
        url: '/hotels',
        method: 'POST',
      });

      expect(config.header).toHaveProperty('Content-Type', 'application/json');
    });

    it('应该合并自定义请求头', () => {
      const config = (request as any).beforeRequest({
        url: '/hotels',
        method: 'POST',
        header: {
          'Authorization': 'Bearer token123',
        },
      });

      expect(config.header).toHaveProperty('Content-Type', 'application/json');
      expect(config.header).toHaveProperty('Authorization', 'Bearer token123');
    });
  });

  describe('错误处理测试', () => {
    it('应该处理 4xx 客户端错误', () => {
      const response = {
        statusCode: 404,
        data: null,
        header: {},
      };

      expect(() => {
        (request as any).afterResponse(response);
      }).toThrow('请求失败，状态码: 404');
    });

    it('应该处理 5xx 服务器错误', () => {
      const response = {
        statusCode: 500,
        data: null,
        header: {},
      };

      expect(() => {
        (request as any).afterResponse(response);
      }).toThrow('服务器错误，状态码: 500');
    });

    it('应该正确处理成功响应 (2xx)', () => {
      const response = {
        statusCode: 200,
        data: { message: 'success' },
        header: {},
      };

      const result = (request as any).afterResponse(response);
      expect(result).toEqual({ message: 'success' });
    });

    it('应该识别超时错误', () => {
      const error = {
        errMsg: 'request:fail timeout',
      };

      // 模拟 wx.showToast
      const mockShowToast = jest.fn();
      (global as any).wx = {
        showToast: mockShowToast,
      };

      (request as any).handleError(error);

      expect(mockShowToast).toHaveBeenCalledWith({
        title: '请求超时，请稍后重试',
        icon: 'none',
        duration: 2000,
      });
    });

    it('应该识别网络连接错误', () => {
      const error = {
        errMsg: 'request:fail',
      };

      // 模拟 wx.showToast
      const mockShowToast = jest.fn();
      (global as any).wx = {
        showToast: mockShowToast,
      };

      (request as any).handleError(error);

      expect(mockShowToast).toHaveBeenCalledWith({
        title: '无法连接到服务器，请检查网络连接',
        icon: 'none',
        duration: 2000,
      });
    });
  });
});

