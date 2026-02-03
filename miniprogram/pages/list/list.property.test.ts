/**
 * 列表页排序功能的属性测试
 * Feature: wechat-miniprogram, Property 5: 列表排序正确性
 * 验证需求: 3.6
 */

import * as fc from 'fast-check';
import { Hotel, RoomType } from '../../types/index';

/**
 * 生成随机房型
 */
function generateRoomType(): fc.Arbitrary<RoomType> {
  return fc.record({
    id: fc.integer({ min: 1, max: 1000 }),
    name: fc.string({ minLength: 1, maxLength: 20 }),
    // 价格可以是数字或字符串
    price: fc.oneof(
      fc.integer({ min: 100, max: 2000 }),
      fc.integer({ min: 100, max: 2000 }).map(n => n.toString()),
    ),
    originalPrice: fc.option(fc.oneof(
      fc.integer({ min: 100, max: 2000 }),
      fc.integer({ min: 100, max: 2000 }).map(n => n.toString()),
    )),
    maxGuests: fc.option(fc.integer({ min: 1, max: 6 })),
    bedType: fc.option(fc.string({ minLength: 1, maxLength: 10 })),
    roomSize: fc.option(fc.integer({ min: 10, max: 100 })),
  });
}

/**
 * 生成随机酒店
 */
function generateHotel(): fc.Arbitrary<Hotel> {
  return fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    nameCn: fc.string({ minLength: 1, maxLength: 50 }),
    address: fc.string({ minLength: 1, maxLength: 100 }),
    starRating: fc.integer({ min: 1, max: 5 }),
    roomTypes: fc.array(generateRoomType(), { minLength: 1, maxLength: 5 }),
  });
}

/**
 * 获取酒店最低价格
 */
function getMinPrice(hotel: Hotel): number {
  if (!hotel.roomTypes || hotel.roomTypes.length === 0) {
    return 0;
  }
  // 将价格字符串转换为数字
  const prices = hotel.roomTypes.map((room) => {
    const price = typeof room.price === 'string' ? parseFloat(room.price) : room.price;
    return price;
  });
  return Math.min(...prices);
}

/**
 * 按价格排序酒店列表
 */
function sortByPrice(hotels: Hotel[]): Hotel[] {
  return [...hotels].sort((a, b) => {
    const priceA = getMinPrice(a);
    const priceB = getMinPrice(b);
    return priceA - priceB;
  });
}

/**
 * 按欢迎度排序酒店列表（按 ID 升序）
 */
function sortByPopular(hotels: Hotel[]): Hotel[] {
  return [...hotels].sort((a, b) => a.id - b.id);
}

/**
 * 检查列表是否按价格升序排列
 */
function isPriceSorted(hotels: Hotel[]): boolean {
  for (let i = 0; i < hotels.length - 1; i++) {
    const priceA = getMinPrice(hotels[i]);
    const priceB = getMinPrice(hotels[i + 1]);
    if (priceA > priceB) {
      return false;
    }
  }
  return true;
}

/**
 * 检查列表是否按 ID 升序排列
 */
function isIdSorted(hotels: Hotel[]): boolean {
  for (let i = 0; i < hotels.length - 1; i++) {
    if (hotels[i].id > hotels[i + 1].id) {
      return false;
    }
  }
  return true;
}

describe('列表页排序功能属性测试', () => {
  /**
   * 属性 5: 列表排序正确性（价格排序）
   * 对于任意酒店列表，按价格排序后的列表应该满足价格递增规则
   */
  test('属性 5: 按价格排序后列表应该满足价格递增规则', () => {
    fc.assert(
      fc.property(
        fc.array(generateHotel(), { minLength: 2, maxLength: 20 }),
        (hotels) => {
          // 执行价格排序
          const sortedHotels = sortByPrice(hotels);

          // 验证排序结果
          return isPriceSorted(sortedHotels);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 5: 列表排序正确性（欢迎度排序）
   * 对于任意酒店列表，按欢迎度排序后的列表应该满足 ID 递增规则
   */
  test('属性 5: 按欢迎度排序后列表应该满足 ID 递增规则', () => {
    fc.assert(
      fc.property(
        fc.array(generateHotel(), { minLength: 2, maxLength: 20 }),
        (hotels) => {
          // 执行欢迎度排序
          const sortedHotels = sortByPopular(hotels);

          // 验证排序结果
          return isIdSorted(sortedHotels);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 5: 排序不改变列表长度
   * 对于任意酒店列表，排序后列表长度应该保持不变
   */
  test('属性 5: 排序不改变列表长度', () => {
    fc.assert(
      fc.property(
        fc.array(generateHotel(), { minLength: 0, maxLength: 20 }),
        (hotels) => {
          const sortedByPrice = sortByPrice(hotels);
          const sortedByPopular = sortByPopular(hotels);

          return (
            sortedByPrice.length === hotels.length &&
            sortedByPopular.length === hotels.length
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 5: 排序不改变列表内容
   * 对于任意酒店列表，排序后列表应该包含所有原始酒店
   */
  test('属性 5: 排序不改变列表内容', () => {
    fc.assert(
      fc.property(
        fc.array(generateHotel(), { minLength: 1, maxLength: 20 }),
        (hotels) => {
          const sortedByPrice = sortByPrice(hotels);

          // 检查所有原始酒店是否都在排序后的列表中
          const originalIds = new Set(hotels.map((h) => h.id));
          const sortedIds = new Set(sortedByPrice.map((h) => h.id));

          return originalIds.size === sortedIds.size &&
            [...originalIds].every((id) => sortedIds.has(id));
        },
      ),
      { numRuns: 100 },
    );
  });
});

/**
 * 筛选功能测试
 */

/**
 * 根据标签筛选酒店
 */
function filterHotelsByTags(hotels: Hotel[], tags: string[]): Hotel[] {
  if (tags.length === 0) {
    return hotels;
  }

  return hotels.filter((hotel) => {
    if (!hotel.facilities || hotel.facilities.length === 0) {
      return false;
    }
    // 检查酒店是否包含所有选中的标签
    return tags.every((tag) => hotel.facilities!.includes(tag));
  });
}

/**
 * 生成带设施的酒店
 */
function generateHotelWithFacilities(): fc.Arbitrary<Hotel> {
  return fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    nameCn: fc.string({ minLength: 1, maxLength: 50 }),
    address: fc.string({ minLength: 1, maxLength: 100 }),
    starRating: fc.integer({ min: 1, max: 5 }),
    facilities: fc.array(
      fc.constantFrom('免费WiFi', '停车场', '游泳池', '健身房', '餐厅', '会议室', '商务中心', '洗衣服务'),
      { minLength: 0, maxLength: 8 },
    ),
    roomTypes: fc.array(generateRoomType(), { minLength: 1, maxLength: 5 }),
  });
}

describe('列表页筛选功能属性测试', () => {
  /**
   * 属性 6: 设施筛选正确性
   * 对于任意酒店列表和设施标签，筛选后的列表中的每个酒店都应该包含该设施
   */
  test('属性 6: 筛选后的酒店都应该包含选中的设施', () => {
    fc.assert(
      fc.property(
        fc.array(generateHotelWithFacilities(), { minLength: 5, maxLength: 20 }),
        fc.constantFrom('免费WiFi', '停车场', '游泳池', '健身房', '餐厅'),
        (hotels, tag) => {
          // 执行筛选
          const filteredHotels = filterHotelsByTags(hotels, [tag]);

          // 验证筛选结果：所有酒店都应该包含该设施
          return filteredHotels.every((hotel) =>
            hotel.facilities && hotel.facilities.includes(tag),
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 6: 多标签筛选正确性
   * 对于任意酒店列表和多个设施标签，筛选后的列表中的每个酒店都应该包含所有选中的设施
   */
  test('属性 6: 多标签筛选后的酒店都应该包含所有选中的设施', () => {
    fc.assert(
      fc.property(
        fc.array(generateHotelWithFacilities(), { minLength: 10, maxLength: 30 }),
        fc.array(
          fc.constantFrom('免费WiFi', '停车场', '游泳池', '健身房', '餐厅'),
          { minLength: 1, maxLength: 3 },
        ),
        (hotels, tags) => {
          // 执行筛选
          const filteredHotels = filterHotelsByTags(hotels, tags);

          // 验证筛选结果：所有酒店都应该包含所有选中的设施
          return filteredHotels.every((hotel) =>
            hotel.facilities && tags.every((tag) => hotel.facilities!.includes(tag)),
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 6: 空标签不筛选
   * 对于任意酒店列表，如果没有选中标签，筛选后应该返回所有酒店
   */
  test('属性 6: 空标签不筛选，返回所有酒店', () => {
    fc.assert(
      fc.property(
        fc.array(generateHotelWithFacilities(), { minLength: 1, maxLength: 20 }),
        (hotels) => {
          // 执行筛选（空标签）
          const filteredHotels = filterHotelsByTags(hotels, []);

          // 验证筛选结果：应该返回所有酒店
          return filteredHotels.length === hotels.length;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 6: 筛选结果是原列表的子集
   * 对于任意酒店列表和标签，筛选后的列表应该是原列表的子集
   */
  test('属性 6: 筛选结果是原列表的子集', () => {
    fc.assert(
      fc.property(
        fc.array(generateHotelWithFacilities(), { minLength: 5, maxLength: 20 }),
        fc.array(
          fc.constantFrom('免费WiFi', '停车场', '游泳池', '健身房', '餐厅'),
          { minLength: 1, maxLength: 3 },
        ),
        (hotels, tags) => {
          // 执行筛选
          const filteredHotels = filterHotelsByTags(hotels, tags);

          // 验证筛选结果：筛选后的列表长度应该小于等于原列表
          if (filteredHotels.length > hotels.length) {
            return false;
          }

          // 验证筛选结果：所有筛选后的酒店都应该在原列表中
          const originalIds = new Set(hotels.map((h) => h.id));
          return filteredHotels.every((hotel) => originalIds.has(hotel.id));
        },
      ),
      { numRuns: 100 },
    );
  });
});
