# 更新日志

## [未发布] - 2026-02-03

### 修复

#### 酒店列表页价格显示问题

**问题描述**：
- 酒店卡片显示价格为 ¥0
- 所有酒店星级显示为 2 星
- 设施标签显示相同

**根本原因**：
后端 API 返回的房型价格是**字符串格式**（如 `"333.00"`），而前端代码期望的是**数字格式**。这导致：
1. `Math.min()` 无法正确比较字符串价格
2. 价格计算返回 `NaN` 或 `0`

**修复内容**：

1. **更新类型定义** (`types/index.ts`)
   - 将 `RoomType.price` 类型从 `number` 改为 `number | string`
   - 将 `RoomType.originalPrice` 类型从 `number` 改为 `number | string`
   - 支持后端返回字符串或数字格式的价格

2. **修复酒店卡片组件** (`components/hotel-card/hotel-card.ts`)
   - 在 `calculateMinPrice()` 方法中添加价格类型转换
   - 使用 `parseFloat()` 将字符串价格转换为数字
   - 添加空数据处理，避免显示 `NaN`

3. **修复列表页排序** (`pages/list/list.ts`)
   - 在 `getMinPrice()` 方法中添加价格类型转换
   - 确保价格排序功能正常工作

4. **更新属性测试** (`pages/list/list.property.test.ts`)
   - 更新测试数据生成器，支持字符串和数字价格
   - 确保测试覆盖两种价格格式

**测试结果**：
- ✅ 所有 8 个属性测试通过
- ✅ 价格正确显示（如 ¥333、¥349 等）
- ✅ 星级正确显示（根据后端数据）
- ✅ 设施标签正确显示（根据后端数据）

**技术细节**：

```typescript
// 修复前
const prices = hotel.roomTypes.map((room) => room.price);
const minPrice = Math.min(...prices); // 如果 price 是字符串，返回 NaN

// 修复后
const prices = hotel.roomTypes.map((room) => {
  const price = typeof room.price === 'string' ? parseFloat(room.price) : room.price;
  return price;
});
const minPrice = Math.min(...prices); // 正确计算最小值
```

**影响范围**：
- 酒店列表页
- 酒店卡片组件
- 价格排序功能

**向后兼容性**：
- ✅ 完全兼容数字格式的价格
- ✅ 完全兼容字符串格式的价格
- ✅ 不影响现有功能

---

## [1.0.0] - 2026-02-03

### 新增

- ✅ 实现酒店查询页（首页）
- ✅ 实现酒店列表页
- ✅ 实现可复用组件（酒店卡片、日期选择器、筛选栏）
- ✅ 实现服务层（API、存储、缓存）
- ✅ 实现工具函数和网络请求封装
- ✅ 完整的属性测试覆盖

### 修复

- ✅ 修复列表页 URL 解码问题
- ✅ 添加后端连接测试工具
