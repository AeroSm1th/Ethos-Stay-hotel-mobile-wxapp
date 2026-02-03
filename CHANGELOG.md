# 更新日志

## [未发布]

### 修复
- **hotel-card 组件方法定义错误** (2026-02-03)
  - 修复了 `calculateMinPrice is not a function` 错误
  - 将 `calculateMinPrice` 方法从组件顶层移到 `methods` 对象中
  - 微信小程序组件的方法必须定义在 `methods` 对象中才能被正确调用
  - 相关文件：`miniprogram/components/hotel-card/hotel-card.ts`

- **首页选项卡筛选功能** (2026-02-03)
  - 修复了星级、价格、设施选项卡点击后没有实际筛选效果的问题
  - 现在点击任何筛选选项卡后，推荐酒店列表会立即根据筛选条件重新加载
  - 用户可以实时看到筛选效果，提升了用户体验
  - 相关文件：`miniprogram/pages/search/search.ts`

- **酒店列表价格显示问题** (2026-02-03)
  - 修复了价格显示为 ¥0 的问题
  - 使用 WXS (WeiXin Script) 直接在模板中计算价格，避免 TypeScript 编译问题
  - 支持后端返回的字符串格式价格（如 "333.00"）
  - 相关文件：
    - `miniprogram/components/hotel-card/hotel-card.wxs` (新建)
    - `miniprogram/components/hotel-card/hotel-card.wxml`
    - `miniprogram/components/hotel-card/hotel-card.ts`
    - `miniprogram/types/index.ts`

- **列表页 URL 解码问题** (2026-02-03)
  - 修复了城市名称显示为 URL 编码格式（如 `%E4%B8%8A%E6%B5%B7`）的问题
  - 在 `list.ts` 的 `onLoad` 方法中添加 `decodeURIComponent()` 解码
  - 相关文件：`miniprogram/pages/list/list.ts`

### 新增
- **酒店列表页** (2026-02-03)
  - 实现了完整的酒店列表页功能
  - 支持列表数据加载、筛选条件展示、排序功能
  - 支持快捷标签筛选、分页加载、下拉刷新
  - 支持点击跳转详情页
  - 编写了完整的属性测试（8 个测试全部通过）
  - 相关文件：
    - `miniprogram/pages/list/list.ts`
    - `miniprogram/pages/list/list.wxml`
    - `miniprogram/pages/list/list.wxss`
    - `miniprogram/pages/list/list.json`
    - `miniprogram/pages/list/list.property.test.ts`

### 工具
- **后端连接测试工具** (2026-02-03)
  - 创建了 `test-backend.js` 用于测试后端 API 连接
  - 创建了 `README_BACKEND_CONFIG.md` 配置文档
  - 创建了 `debug-hotel-data.js` 调试工具
  - 创建了 `TROUBLESHOOTING.md` 故障排除文档
  - 创建了 `force-recompile.md` 强制重新编译指南

## 技术说明

### WXS vs TypeScript
在微信小程序中，WXS (WeiXin Script) 是一种在 WXML 模板中运行的脚本语言。与 TypeScript 相比：

**优势：**
- 直接在模板中执行，不依赖 TypeScript 编译
- 性能更好，避免了编译和运行时的转换
- 更可靠，不受微信开发者工具编译缓存影响

**使用场景：**
- 数据格式转换（如字符串转数字）
- 简单的计算逻辑（如价格计算）
- 模板中的数据处理

### 筛选功能实现
首页的筛选功能采用了实时筛选的方式：
1. 用户点击星级/价格/设施选项卡
2. 更新页面状态
3. 立即调用 `loadRecommendHotels()` 重新加载推荐酒店
4. 根据当前筛选条件构造 API 请求参数
5. 显示筛选后的酒店列表

这种方式提供了更好的用户体验，用户可以立即看到筛选效果。

### 后端数据格式
后端返回的酒店数据中，价格字段是字符串格式（如 `"333.00"`），需要在前端转换为数字格式才能正确显示。我们使用 WXS 的 `parseFloat()` 函数来处理这个转换。

## 测试覆盖
- 查询页单元测试：18 个测试全部通过
- 列表页属性测试：8 个测试全部通过
- 酒店卡片属性测试：通过
- API 服务属性测试：通过
- 缓存服务属性测试：通过
- 存储服务属性测试：通过
- 格式化工具属性测试：通过
