# 易宿酒店微信小程序

## 项目简介

易宿酒店微信小程序是基于微信原生框架开发的酒店预订应用，提供酒店查询、列表展示、详情查看等核心功能。

## 技术栈

- **框架**: 微信小程序原生框架
- **语言**: TypeScript
- **样式**: WXSS (携程蓝色主题)
- **代码规范**: ESLint
- **后端**: hotel-management 项目提供的公开 API

## 项目结构

```
miniprogram/
├── pages/              # 页面目录
│   ├── search/         # 酒店查询页（首页）
│   ├── list/           # 酒店列表页
│   └── detail/         # 酒店详情页
├── components/         # 组件目录
├── services/           # 服务层
├── utils/              # 工具函数
├── types/              # 类型定义
├── app.ts              # 小程序入口
├── app.json            # 小程序配置
└── app.wxss            # 全局样式
```

## 功能列表

- [ ] 酒店查询（城市、日期、关键词、筛选条件）
- [ ] 酒店列表展示（分页、排序、筛选）
- [ ] 酒店详情查看（图片轮播、房型列表、收藏、分享）
- [ ] 本地存储（城市记忆、收藏、浏览历史）
- [ ] 数据缓存（减少网络请求）

## 安装和运行

### 前置要求

1. 安装微信开发者工具
2. 安装 Node.js (v14+)
3. 启动 hotel-management 后端服务

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd hotel-mobile-wxapp
```

2. 安装依赖
```bash
npm install
```

3. 配置后端 API 地址
在 `miniprogram/utils/constants.ts` 中配置后端地址：
```typescript
export const API_BASE_URL = 'http://localhost:3000/api';
```

4. 使用微信开发者工具打开项目
- 打开微信开发者工具
- 选择"导入项目"
- 选择项目目录 `hotel-mobile-wxapp`
- 填入 AppID（测试号或正式 AppID）

5. 编译运行
- 点击"编译"按钮
- 在模拟器中查看效果

## 开发规范

### 代码风格

- 使用 TypeScript 编写代码
- 遵循 ESLint 规范
- 使用 2 空格缩进
- 使用单引号
- 函数和变量使用驼峰命名

### 提交规范

使用约定式提交（Conventional Commits）：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```bash
git commit -m "feat: 实现酒店查询页"
git commit -m "fix: 修复日期选择器问题"
```

### 目录规范

- `pages/`: 页面文件，每个页面一个文件夹
- `components/`: 可复用组件
- `services/`: 业务逻辑和 API 调用
- `utils/`: 工具函数
- `types/`: TypeScript 类型定义

## API 接口说明

### 后端接口

后端服务由 hotel-management 项目提供，主要接口：

1. **获取酒店列表**
   - 接口: `GET /api/public/hotels`
   - 参数: `page`, `pageSize`, `keyword`, `city`, `starRating`, `minPrice`, `maxPrice`
   - 返回: 酒店列表和分页信息

2. **获取酒店详情**
   - 接口: `GET /api/public/hotels/:id`
   - 参数: `id` (酒店 ID)
   - 返回: 酒店完整信息（包含房型和图片）

### 网络请求配置

在 `project.config.json` 中配置合法域名：
```json
{
  "setting": {
    "urlCheck": false  // 开发时可关闭域名校验
  }
}
```

## 常见问题

### 1. 小程序无法请求后端接口

**原因**: 域名未配置或后端服务未启动

**解决方案**:
- 确保后端服务已启动（`npm run start:dev`）
- 开发时在微信开发者工具中关闭"域名校验"
- 正式发布前需在微信公众平台配置合法域名

### 2. TypeScript 编译错误

**原因**: 类型定义缺失或配置错误

**解决方案**:
- 检查 `tsconfig.json` 配置
- 确保安装了 `miniprogram-api-typings`
- 运行 `npm install` 重新安装依赖

### 3. 样式变量不生效

**原因**: CSS 变量在某些版本的微信不支持

**解决方案**:
- 确保基础库版本 >= 2.9.0
- 在 `project.config.json` 中设置 `libVersion`

## 开发进度

- [x] 项目初始化和基础配置
- [ ] 类型定义和常量配置
- [ ] 工具函数实现
- [ ] 服务层实现
- [ ] 可复用组件开发
- [ ] 酒店查询页开发
- [ ] 酒店列表页开发
- [ ] 酒店详情页开发
- [ ] 用户体验优化
- [ ] 样式优化和 UI 还原
- [ ] 性能优化
- [ ] 文档编写

## 许可证

MIT
