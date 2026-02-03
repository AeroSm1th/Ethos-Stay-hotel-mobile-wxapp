/**
 * 网络请求封装
 * 封装微信小程序的 wx.request，提供统一的错误处理和拦截器
 */

import { API_BASE_URL, REQUEST_TIMEOUT } from './constants';

/**
 * 请求配置接口
 */
export interface RequestConfig {
  url: string;                           // 请求 URL
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // 请求方法
  data?: any;                            // 请求数据
  header?: Record<string, string>;       // 请求头
  timeout?: number;                      // 超时时间
}

/**
 * 请求响应接口
 */
export interface RequestResponse<T = any> {
  data: T;                               // 响应数据
  statusCode: number;                    // 状态码
  header: Record<string, string>;        // 响应头
}

/**
 * 网络请求类
 */
export class Request {
  private baseURL: string;
  private timeout: number;

  /**
   * 构造函数
   * @param config 配置对象
   */
  constructor(config: { baseURL: string; timeout?: number }) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || REQUEST_TIMEOUT;
  }

  /**
   * 发起请求
   * @param config 请求配置
   * @returns Promise<T>
   */
  async request<T>(config: RequestConfig): Promise<T> {
    // 请求拦截器
    const finalConfig = this.beforeRequest(config);

    return new Promise<T>((resolve, reject) => {
      wx.request({
        url: finalConfig.url,
        method: finalConfig.method || 'GET',
        data: finalConfig.data,
        header: finalConfig.header || {},
        timeout: finalConfig.timeout || this.timeout,
        success: (res: any) => {
          try {
            // 响应拦截器
            const data = this.afterResponse(res);
            resolve(data as T);
          } catch (error) {
            reject(error);
          }
        },
        fail: (error: any) => {
          // 错误处理
          this.handleError(error);
          reject(error);
        },
      });
    });
  }

  /**
   * GET 请求
   * @param url 请求路径
   * @param params 查询参数
   * @returns Promise<T>
   */
  async get<T>(url: string, params?: any): Promise<T> {
    // 构造查询字符串
    let queryString = '';
    if (params) {
      const queryParams: string[] = [];
      Object.keys(params).forEach(key => {
        const value = params[key];
        // 过滤掉 undefined 和 null
        if (value !== undefined && value !== null && value !== '') {
          queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      });
      if (queryParams.length > 0) {
        queryString = '?' + queryParams.join('&');
      }
    }

    return this.request<T>({
      url: url + queryString,
      method: 'GET',
    });
  }

  /**
   * POST 请求
   * @param url 请求路径
   * @param data 请求数据
   * @returns Promise<T>
   */
  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
    });
  }

  /**
   * 请求拦截器
   * @param config 请求配置
   * @returns 处理后的请求配置
   */
  private beforeRequest(config: RequestConfig): RequestConfig {
    // 拼接完整 URL
    const fullUrl = config.url.startsWith('http') 
      ? config.url 
      : this.baseURL + config.url;

    // 设置默认请求头
    const header = {
      'Content-Type': 'application/json',
      ...config.header,
    };

    return {
      ...config,
      url: fullUrl,
      header,
    };
  }

  /**
   * 响应拦截器
   * @param response 响应对象
   * @returns 处理后的数据
   */
  private afterResponse<T>(response: RequestResponse<T>): T {
    const { statusCode, data } = response;

    // 成功响应 (2xx)
    if (statusCode >= 200 && statusCode < 300) {
      return data;
    }

    // 客户端错误 (4xx)
    if (statusCode >= 400 && statusCode < 500) {
      throw new Error(`请求失败，状态码: ${statusCode}`);
    }

    // 服务器错误 (5xx)
    if (statusCode >= 500) {
      throw new Error(`服务器错误，状态码: ${statusCode}`);
    }

    // 其他错误
    throw new Error(`未知错误，状态码: ${statusCode}`);
  }

  /**
   * 错误处理
   * @param error 错误对象
   */
  private handleError(error: any): void {
    console.error('网络请求失败:', error);

    // 显示错误提示
    let message = '网络请求失败';

    if (error.errMsg) {
      if (error.errMsg.includes('timeout')) {
        message = '请求超时，请稍后重试';
      } else if (error.errMsg.includes('fail')) {
        message = '无法连接到服务器，请检查网络连接';
      }
    }

    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000,
    });
  }
}

/**
 * 创建默认请求实例
 */
export const request = new Request({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
});

/**
 * 导出便捷方法
 */
export const get = <T>(url: string, params?: any) => request.get<T>(url, params);
export const post = <T>(url: string, data?: any) => request.post<T>(url, data);

