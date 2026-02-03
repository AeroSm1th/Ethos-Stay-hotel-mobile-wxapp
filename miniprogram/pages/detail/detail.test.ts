/**
 * 酒店详情页单元测试
 * 测试 API 请求构造和错误处理
 */

import { hotelApi } from '../../services/api';
import { Hotel } from '../../types/index';

// 模拟 wx API
const mockWxRequest = jest.fn();
const mockWxShowLoading = jest.fn();
const mockWxHideLoading = jest.fn();
const mockWxShowModal = jest.fn();
const mockWxShowToast = jest.fn();
const mockWxNavigateBack = jest.fn();

(global as any).wx = {
  request: mockWxRequest,
  showLoading: mockWxShowLoading,
  hideLoading: mockWxHideLoading,
  showModal: mockWxShowModal,
  showToast: mockWxShowToast,
  navigateBack: mockWxNavigateBack,
};

describe('酒店详情页 API 调用测试', () => {
  beforeEach(() => {
    // 重置所有 mock
    jest.clearAllMocks();
  });

  describe('API 请求构造', () => {
    it('应该使用正确的酒店 ID 构造请求 URL', async () => {
      const hotelId = 123;
      let capturedConfig: any;

      mockWxRequest.mockImplementation((config: any) => {
        capturedConfig = config;
        config.success({
          statusCode: 200,
          data: {
            id: hotelId,
            nameCn: '测试酒店',
            address: '测试地址',
            starRating: 4,
          },
          header: {},
        });
      });

      await hotelApi.getHotelDetail(hotelId);

      expect(mockWxRequest).toHaveBeenCalled();
      expect(capturedConfig.url).toContain(`/public/hotels/${hotelId}`);
      expect(capturedConfig.method).toBe('GET');
    });

    it('应该为不同的酒店 ID 构造不同的 URL', async () => {
      const configs: any[] = [];

      mockWxRequest.mockImplementation((config: any) => {
        configs.push(config);
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

      await hotelApi.getHotelDetail(1);
      await hotelApi.getHotelDetail(2);
      await hotelApi.getHotelDetail(999);

      expect(configs[0].url).toContain('/public/hotels/1');
      expect(configs[1].url).toContain('/public/hotels/2');
      expect(configs[2].url).toContain('/public/hotels/999');
    });

    it('应该设置正确的请求头', async () => {
      let capturedConfig: any;

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

      await hotelApi.getHotelDetail(1);

      expect(capturedConfig.header).toBeDefined();
      expect(capturedConfig.header['Content-Type']).toBe('application/json');
    });
  });

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      mockWxRequest.mockImplementation((config: any) => {
        if (config.fail) {
          config.fail({
            errMsg: 'request:fail',
          });
        }
      });

      await expect(hotelApi.getHotelDetail(1)).rejects.toMatchObject({
        errMsg: 'request:fail',
      });
      
      // 验证显示了错误提示
      expect(mockWxShowToast).toHaveBeenCalled();
    });

    it('应该处理 404 错误', async () => {
      mockWxRequest.mockImplementation((config: any) => {
        if (config.success) {
          config.success({
            statusCode: 404,
            data: { message: 'Not Found' },
            header: {},
          });
        }
      });

      await expect(hotelApi.getHotelDetail(99999)).rejects.toThrow('请求失败');
    });

    it('应该处理 500 服务器错误', async () => {
      mockWxRequest.mockImplementation((config: any) => {
        if (config.success) {
          config.success({
            statusCode: 500,
            data: { message: 'Internal Server Error' },
            header: {},
          });
        }
      });

      await expect(hotelApi.getHotelDetail(1)).rejects.toThrow('服务器错误');
    });

    it('应该处理超时错误', async () => {
      mockWxRequest.mockImplementation((config: any) => {
        if (config.fail) {
          config.fail({
            errMsg: 'request:fail timeout',
          });
        }
      });

      await expect(hotelApi.getHotelDetail(1)).rejects.toMatchObject({
        errMsg: 'request:fail timeout',
      });
      
      // 验证显示了超时提示
      expect(mockWxShowToast).toHaveBeenCalled();
    });

    it('应该处理无效的响应数据', async () => {
      mockWxRequest.mockImplementation((config: any) => {
        if (config.success) {
          config.success({
            statusCode: 200,
            data: null,
            header: {},
          });
        }
      });

      const result = await hotelApi.getHotelDetail(1);
      
      // 即使数据为 null，也应该返回（不抛出错误）
      expect(result).toBeNull();
    });
  });

  describe('成功响应处理', () => {
    it('应该正确解析酒店详情数据', async () => {
      const mockHotel: Hotel = {
        id: 1,
        nameCn: '测试酒店',
        nameEn: 'Test Hotel',
        address: '测试地址',
        starRating: 5,
        description: '这是一家测试酒店',
        facilities: ['免费WiFi', '停车场', '游泳池'],
        nearbyAttractions: ['景点1', '景点2'],
        roomTypes: [
          {
            id: 1,
            name: '标准间',
            price: 299,
            bedType: '大床',
            roomSize: 30,
            maxGuests: 2,
          },
          {
            id: 2,
            name: '豪华套房',
            price: 599,
            bedType: '大床',
            roomSize: 50,
            maxGuests: 3,
          },
        ],
        images: [
          {
            id: 1,
            imageUrl: 'https://example.com/image1.jpg',
            sortOrder: 1,
          },
          {
            id: 2,
            imageUrl: 'https://example.com/image2.jpg',
            sortOrder: 2,
          },
        ],
      };

      mockWxRequest.mockImplementation((config: any) => {
        config.success({
          statusCode: 200,
          data: mockHotel,
          header: {},
        });
      });

      const result = await hotelApi.getHotelDetail(1);

      expect(result).toEqual(mockHotel);
      expect(result.id).toBe(1);
      expect(result.nameCn).toBe('测试酒店');
      expect(result.roomTypes).toHaveLength(2);
      expect(result.images).toHaveLength(2);
    });

    it('应该处理缺少可选字段的酒店数据', async () => {
      const minimalHotel: Hotel = {
        id: 1,
        nameCn: '简单酒店',
        address: '简单地址',
        starRating: 3,
      };

      mockWxRequest.mockImplementation((config: any) => {
        config.success({
          statusCode: 200,
          data: minimalHotel,
          header: {},
        });
      });

      const result = await hotelApi.getHotelDetail(1);

      expect(result).toEqual(minimalHotel);
      expect(result.id).toBe(1);
      expect(result.nameCn).toBe('简单酒店');
      expect(result.roomTypes).toBeUndefined();
      expect(result.images).toBeUndefined();
    });

    it('应该处理空的房型和图片数组', async () => {
      const hotelWithEmptyArrays: Hotel = {
        id: 1,
        nameCn: '测试酒店',
        address: '测试地址',
        starRating: 4,
        roomTypes: [],
        images: [],
      };

      mockWxRequest.mockImplementation((config: any) => {
        config.success({
          statusCode: 200,
          data: hotelWithEmptyArrays,
          header: {},
        });
      });

      const result = await hotelApi.getHotelDetail(1);

      expect(result.roomTypes).toEqual([]);
      expect(result.images).toEqual([]);
    });
  });

  describe('边界情况', () => {
    it('应该处理酒店 ID 为 0 的情况', async () => {
      mockWxRequest.mockImplementation((config: any) => {
        config.success({
          statusCode: 400,
          data: { message: 'Invalid hotel ID' },
          header: {},
        });
      });

      await expect(hotelApi.getHotelDetail(0)).rejects.toThrow();
    });

    it('应该处理负数酒店 ID', async () => {
      mockWxRequest.mockImplementation((config: any) => {
        config.success({
          statusCode: 400,
          data: { message: 'Invalid hotel ID' },
          header: {},
        });
      });

      await expect(hotelApi.getHotelDetail(-1)).rejects.toThrow();
    });

    it('应该处理非常大的酒店 ID', async () => {
      const largeId = 999999999;
      let capturedConfig: any;

      mockWxRequest.mockImplementation((config: any) => {
        capturedConfig = config;
        config.success({
          statusCode: 404,
          data: { message: 'Hotel not found' },
          header: {},
        });
      });

      await expect(hotelApi.getHotelDetail(largeId)).rejects.toThrow();
      expect(capturedConfig.url).toContain(`/public/hotels/${largeId}`);
    });
  });
});
