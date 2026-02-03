# 常见问题文档 (FAQ)

本文档整理了易宿酒店微信小程序开发和使用过程中的常见问题及解决方案。

## 目录

- [环境配置问题](#环境配置问题)
- [开发工具问题](#开发工具问题)
- [网络请求问题](#网络请求问题)
- [数据处理问题](#数据处理问题)
- [样式布局问题](#样式布局问题)
- [性能优化问题](#性能优化问题)
- [测试相关问题](#测试相关问题)
- [部署发布问题](#部署发布问题)

---

## 环境配置问题

### Q1: 如何安装微信开发者工具？

**A**: 

1. 访问[微信开发者工具下载页面](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 根据操作系统选择对应版本下载
3. 安装并打开微信开发者工具
4. 使用微信扫码登录

**参考链接**：
- [微信开发者工具官方文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html)

---

### Q2: 如何配置 TypeScript 环境？

**A**:

1. 安装 TypeScript 依赖：
```bash
npm install --save-dev typescript
```

2. 创建 `tsconfig.json` 文件：
```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "typeRoots": ["./typings", "./node_modules/@types"]
  },
  "include": ["miniprogram/**/*"],
  "exclude": ["node_modules"]
}
```

3. 安装微信小程序类型定义：
```bash
npm install --save-dev miniprogram-api-typings
```

4. 在微信开发者工具中启用 TypeScript 编译：
   - 详情 -> 本地设置 -> 使用 npm 模块 -> 勾选

**参考链接**：
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [miniprogram-api-typings](https://github.com/wechat-miniprogram/api-typings)

---

### Q3: 如何配置 ESLint？

**A**:

1. 安装 ESLint 和相关插件：
```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

2. 创建 `.eslintrc.js` 文件：
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  }
};
```

3. 在 `package.json` 中添加脚本：
```json
{
  "scripts": {
    "lint": "eslint miniprogram/**/*.ts",
    "lint:fix": "eslint miniprogram/**/*.ts --fix"
  }
}
```

**参考链接**：
- [ESLint 官方文档](https://eslint.org/)
- [TypeScript ESLint](https://typescript-eslint.io/)

---

## 开发工具问题

### Q4: 微信开发者工具无法打开项目？

**A**:

**可能原因**：
1. 项目目录不正确
2. 缺少必要的配置文件
3. AppID 配置错误

**解决方案**：

1. 确保项目目录包含以下文件：
   - `project.config.json`
   - `app.json`
   - `app.ts` 或 `app.js`

2. 检查 `project.config.json` 配置：
```json
{
  "miniprogramRoot": "miniprogram/",
  "compileType": "miniprogram",
  "appid": "your-appid"
}
```

3. 如果没有 AppID，可以使用测试号：
   - 点击"使用测试号"
   - 或在微信公众平台注册小程序获取 AppID

---

### Q5: 代码编译报错？

**A**:

**常见错误**：

1. **TypeScript 编译错误**：
   - 检查 `tsconfig.json` 配置
   - 确保安装了 `miniprogram-api-typings`
   - 运行 `npm install` 重新安装依赖

2. **语法错误**：
   - 检查代码语法
   - 使用 ESLint 检查代码规范
   - 查看控制台错误信息

3. **模块导入错误**：
   - 检查导入路径是否正确
   - 确保模块已导出
   - 使用相对路径导入

**解决方案**：

1. 清除缓存：
   - 工具 -> 清除缓存 -> 清除所有缓存

2. 重新编译：
   - 点击"编译"按钮
   - 或使用快捷键 Ctrl+B (Windows) / Cmd+B (Mac)

3. 查看详细错误信息：
   - 打开控制台查看错误堆栈
   - 根据错误信息定位问题

---

### Q6: 如何调试代码？

**A**:

1. **使用 console.log**：
```typescript
console.log('调试信息', data);
```

2. **使用断点调试**：
   - 在代码行号左侧点击设置断点
   - 运行代码，程序会在断点处暂停
   - 查看变量值和调用栈

3. **使用 Sources 面板**：
   - 打开调试器 -> Sources
   - 查看源代码和变量
   - 单步执行代码

4. **使用 Network 面板**：
   - 查看网络请求
   - 检查请求参数和响应数据
   - 分析请求耗时

**参考链接**：
- [微信开发者工具调试指南](https://developers.weixin.qq.com/miniprogram/dev/devtools/debug.html)

---

## 网络请求问题

### Q7: 小程序无法请求后端接口？

**A**:

**可能原因**：
1. 后端服务未启动
2. API 地址配置错误
3. 域名校验未关闭
4. 跨域问题

**解决方案**：

1. **确保后端服务已启动**：
```bash
cd hotel-management/backend
npm run start:dev
```

2. **检查 API 地址配置**：
```typescript
// miniprogram/utils/constants.ts
export const API_BASE_URL = 'http://localhost:3000/api';
```

3. **关闭域名校验**（开发环境）：
   - 详情 -> 本地设置 -> 勾选"不校验合法域名..."

4. **配置合法域名**（生产环境）：
   - 登录[微信公众平台](https://mp.weixin.qq.com/)
   - 开发 -> 开发管理 -> 开发设置 -> 服务器域名
   - 添加 request 合法域名

5. **检查网络请求**：
   - 打开 Network 面板
   - 查看请求状态和响应数据
   - 检查请求 URL 是否正确

**参考链接**：
- [网络请求文档](https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html)

---

### Q8: 请求超时怎么办？

**A**:

**可能原因**：
1. 网络环境差
2. 后端响应慢
3. 超时时间设置过短

**解决方案**：

1. **增加超时时间**：
```typescript
wx.request({
  url: 'https://...',
  timeout: 10000, // 10 秒
  success: (res) => {},
  fail: (error) => {}
});
```

2. **添加重试机制**：
```typescript
async function requestWithRetry(url: string, maxRetries: number = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await request.get(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * (i + 1)); // 指数退避
    }
  }
}
```

3. **显示友好提示**：
```typescript
wx.showToast({
  title: '请求超时，请稍后重试',
  icon: 'none'
});
```

---

### Q9: 如何处理网络错误？

**A**:

**统一错误处理**：

```typescript
class Request {
  async request<T>(config: RequestConfig): Promise<T> {
    try {
      const response = await wx.request(config);
      if (response.statusCode === 200) {
        return response.data as T;
      } else {
        throw new Error(`请求失败: ${response.statusCode}`);
      }
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  private handleError(error: any): void {
    let message = '请求失败';
    
    if (error.errMsg) {
      if (error.errMsg.includes('timeout')) {
        message = '请求超时，请稍后重试';
      } else if (error.errMsg.includes('fail')) {
        message = '网络连接失败，请检查网络';
      }
    }
    
    wx.showToast({
      title: message,
      icon: 'none'
    });
  }
}
```

---

## 数据处理问题

### Q10: 日期格式化问题？

**A**:

**问题描述**：日期在 iOS 和 Android 上显示不一致

**解决方案**：

1. **统一使用 YYYY-MM-DD 格式**：
```typescript
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

2. **避免使用不兼容的格式**：
```typescript
// ❌ 不推荐
new Date('2024/01/01'); // iOS 可能不支持

// ✅ 推荐
new Date('2024-01-01'); // 兼容性好
```

3. **使用 Date 对象方法**：
```typescript
const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();
```

---

### Q11: 如何处理空数据？

**A**:

**使用可选链和空值合并**：

```typescript
// ✅ 推荐
const price = hotel.roomTypes?.[0]?.price ?? 0;
const name = hotel.nameCn || '未知酒店';
const facilities = hotel.facilities ?? [];

// ❌ 不推荐
const price = hotel.roomTypes[0].price; // 可能报错
```

**检查数据有效性**：

```typescript
if (hotel && hotel.roomTypes && hotel.roomTypes.length > 0) {
  const price = hotel.roomTypes[0].price;
}
```

**提供默认值**：

```typescript
interface Hotel {
  id: number;
  nameCn: string;
  facilities?: string[];
}

const defaultHotel: Hotel = {
  id: 0,
  nameCn: '未知酒店',
  facilities: []
};
```

---

### Q12: 如何计算间夜数？

**A**:

```typescript
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// 使用示例
const nights = calculateNights('2024-01-01', '2024-01-03'); // 2
```

**注意事项**：
- 确保日期格式正确（YYYY-MM-DD）
- 离店日期必须晚于入住日期
- 使用 Math.ceil 向上取整

---

## 样式布局问题

### Q13: CSS 变量不生效？

**A**:

**可能原因**：
1. 基础库版本过低
2. 微信版本不支持

**解决方案**：

1. **设置最低基础库版本**：
```json
// project.config.json
{
  "libVersion": "2.9.0"
}
```

2. **使用 WXSS 预处理器**：
```wxss
/* 定义变量 */
:root {
  --primary-color: #0086f6;
  --text-color: #333;
}

/* 使用变量 */
.button {
  background-color: var(--primary-color);
  color: var(--text-color);
}
```

3. **提供降级方案**：
```wxss
.button {
  background-color: #0086f6; /* 降级方案 */
  background-color: var(--primary-color); /* 优先使用变量 */
}
```

---

### Q14: rpx 单位适配问题？

**A**:

**rpx 单位说明**：
- rpx 是微信小程序的响应式单位
- 规定屏幕宽度为 750rpx
- 1rpx = 屏幕宽度 / 750

**使用建议**：

1. **宽度使用 rpx**：
```wxss
.container {
  width: 750rpx; /* 全屏宽度 */
  padding: 30rpx; /* 响应式内边距 */
}
```

2. **字体使用 px**：
```wxss
.text {
  font-size: 14px; /* 固定字体大小 */
}
```

3. **边框使用 px**：
```wxss
.border {
  border: 1px solid #eee; /* 1px 边框 */
}
```

4. **处理安全区域**：
```wxss
.bottom-bar {
  padding-bottom: constant(safe-area-inset-bottom); /* iOS < 11.2 */
  padding-bottom: env(safe-area-inset-bottom); /* iOS >= 11.2 */
}
```

**参考链接**：
- [WXSS 文档](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxss.html)

---

### Q15: 如何实现响应式布局？

**A**:

**使用 Flex 布局**：

```wxss
.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.item {
  flex: 1;
}
```

**使用媒体查询**：

```wxss
/* 小屏幕 */
@media (max-width: 375px) {
  .container {
    padding: 20rpx;
  }
}

/* 大屏幕 */
@media (min-width: 768px) {
  .container {
    padding: 40rpx;
  }
}
```

**使用百分比**：

```wxss
.image {
  width: 100%;
  height: auto;
}
```

---

## 性能优化问题

### Q16: 如何优化小程序启动速度？

**A**:

**优化方案**：

1. **减小包体积**：
   - 清理未使用的代码和资源
   - 压缩图片
   - 使用分包加载

2. **延迟加载**：
```typescript
onLoad() {
  // 立即加载关键数据
  this.loadCriticalData();
  
  // 延迟加载非关键数据
  setTimeout(() => {
    this.loadNonCriticalData();
  }, 500);
}
```

3. **使用缓存**：
```typescript
async loadData() {
  // 先从缓存读取
  const cached = cacheService.get('data');
  if (cached) {
    this.setData({ data: cached });
  }
  
  // 再从网络加载
  const data = await api.getData();
  this.setData({ data });
  cacheService.set('data', data);
}
```

4. **优化首屏渲染**：
   - 减少首屏数据量
   - 使用骨架屏
   - 避免复杂计算

---

### Q17: 如何优化列表性能？

**A**:

**优化方案**：

1. **使用分页加载**：
```typescript
onReachBottom() {
  if (this.data.hasMore && !this.data.loadingMore) {
    this.loadMore();
  }
}
```

2. **使用图片懒加载**：
```xml
<image src="{{imageUrl}}" lazy-load="{{true}}" />
```

3. **减少 setData 调用**：
```typescript
// ❌ 不推荐：多次 setData
this.setData({ loading: true });
this.setData({ data: newData });
this.setData({ loading: false });

// ✅ 推荐：合并 setData
this.setData({
  loading: false,
  data: newData
});
```

4. **使用虚拟列表**（数据量大时）：
   - 只渲染可见区域的列表项
   - 使用第三方组件库

---

### Q18: 如何优化图片加载？

**A**:

**优化方案**：

1. **使用图片懒加载**：
```xml
<image 
  src="{{imageUrl}}" 
  lazy-load="{{true}}"
  mode="aspectFill"
/>
```

2. **压缩图片**：
   - 使用 webp 格式
   - 压缩图片质量
   - 使用适当的尺寸

3. **使用占位图**：
```xml
<image 
  src="{{imageUrl || '/images/placeholder.png'}}"
  mode="aspectFill"
/>
```

4. **使用 CDN**：
   - 将图片上传到 CDN
   - 使用 CDN 地址

---

## 测试相关问题

### Q19: 如何运行测试？

**A**:

**运行所有测试**：
```bash
npm test
```

**运行特定测试文件**：
```bash
npm test -- format.test.ts
```

**运行测试并监听文件变化**：
```bash
npm run test:watch
```

**生成测试覆盖率报告**：
```bash
npm run test:coverage
```

**查看覆盖率报告**：
- 打开 `coverage/lcov-report/index.html`

---

### Q20: 测试失败怎么办？

**A**:

**常见问题**：

1. **wx is not defined**：
   - 添加 wx API mock
   - 在 `test/setup.ts` 中定义全局 wx 对象

2. **模块导入错误**：
   - 检查导入路径
   - 确保模块已导出

3. **异步测试超时**：
   - 增加超时时间
   - 使用 async/await

**调试测试**：

1. **使用 console.log**：
```typescript
it('should work', () => {
  console.log('调试信息', data);
  expect(data).toBe(expected);
});
```

2. **使用 --verbose 选项**：
```bash
npm test -- --verbose
```

3. **单独运行失败的测试**：
```bash
npm test -- --testNamePattern="测试名称"
```

---

## 部署发布问题

### Q21: 如何发布小程序？

**A**:

**发布流程**：

1. **代码审查**：
   - 运行 ESLint 检查
   - 运行所有测试
   - 检查代码质量

2. **配置生产环境**：
```typescript
// 修改 API 地址为生产环境
export const API_BASE_URL = 'https://your-domain.com/api';
```

3. **上传代码**：
   - 点击"上传"按钮
   - 填写版本号和备注
   - 等待上传完成

4. **提交审核**：
   - 登录[微信公众平台](https://mp.weixin.qq.com/)
   - 开发管理 -> 版本管理
   - 选择开发版本 -> 提交审核
   - 填写审核信息

5. **发布上线**：
   - 审核通过后
   - 点击"发布"按钮
   - 确认发布

**参考链接**：
- [小程序发布流程](https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/release.html)

---

### Q22: 审核被拒怎么办？

**A**:

**常见拒绝原因**：

1. **功能不完整**：
   - 补充缺失的功能
   - 完善用户体验

2. **违反规范**：
   - 查看审核意见
   - 修改违规内容
   - 重新提交审核

3. **服务类目不符**：
   - 修改服务类目
   - 提供相关资质

4. **测试账号问题**：
   - 提供有效的测试账号
   - 确保测试账号可用

**申诉流程**：
- 如果认为审核有误
- 可以点击"申诉"
- 说明情况并提供证据

---

## 其他问题

### Q23: 如何获取帮助？

**A**:

**官方资源**：
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信开放社区](https://developers.weixin.qq.com/community/develop/mixflow)
- [微信小程序 API 文档](https://developers.weixin.qq.com/miniprogram/dev/api/)

**社区资源**：
- [GitHub Issues](https://github.com/wechat-miniprogram)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/wechat-miniprogram)
- [掘金](https://juejin.cn/tag/%E5%B0%8F%E7%A8%8B%E5%BA%8F)

**项目文档**：
- [README.md](../README.md)
- [功能模块文档](./MODULES.md)
- [开发日志](./CHANGELOG.md)

---

### Q24: 如何贡献代码？

**A**:

**贡献流程**：

1. **Fork 仓库**：
   - 在 GitHub 上 Fork 本仓库

2. **克隆代码**：
```bash
git clone <your-fork-url>
cd hotel-mobile-wxapp
```

3. **创建分支**：
```bash
git checkout -b feature/your-feature
```

4. **开发功能**：
   - 编写代码
   - 编写测试
   - 运行测试

5. **提交代码**：
```bash
git add .
git commit -m "feat: 添加某个功能"
git push origin feature/your-feature
```

6. **创建 Pull Request**：
   - 在 GitHub 上创建 PR
   - 填写 PR 描述
   - 等待审核

**代码规范**：
- 遵循 TypeScript 规范
- 通过 ESLint 检查
- 编写单元测试
- 使用约定式提交

---

**如果您的问题没有在此列出，请：**

1. 查看[官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
2. 在[微信开放社区](https://developers.weixin.qq.com/community/)搜索
3. 提交 [GitHub Issue](https://github.com/your-repo/issues)

**最后更新时间**：2024-01-15
