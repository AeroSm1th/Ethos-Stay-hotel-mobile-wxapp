# 后端连接配置指南

## 问题诊断

如果你看到"暂无符合条件的酒店"或城市显示为乱码，可能是以下原因：

1. **后端服务未启动**
2. **API 地址配置错误**
3. **微信小程序开发工具未配置合法域名**
4. **URL 参数编码问题**（已修复）

## 解决方案

### 1. 启动后端服务

确保后端服务正在运行：

```bash
# 进入后端目录
cd hotel-management/backend

# 安装依赖（如果还没安装）
npm install

# 启动后端服务
npm run start:dev
```

后端服务应该在 `http://localhost:3000` 运行。

### 2. 配置 API 地址

打开 `miniprogram/utils/constants.ts`，确认 API 地址配置正确：

```typescript
// 本地开发环境
export const API_BASE_URL = 'http://localhost:3000/api';

// 或者如果后端部署在其他地址
// export const API_BASE_URL = 'http://your-backend-ip:3000/api';
```

### 3. 配置微信开发者工具

在微信开发者工具中：

1. 点击右上角"详情"按钮
2. 在"本地设置"标签页中
3. **勾选**以下选项：
   - ✅ 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书
   - ✅ 启用调试模式

这样可以在开发环境中访问 localhost 的后端服务。

### 4. 验证后端连接

在微信开发者工具的控制台中，你应该能看到：

```
列表页加载，参数: {city: "上海", checkIn: "2026-02-03", checkOut: "2026-02-04", ...}
酒店列表响应: {data: [...], page: 1, pageSize: 10, total: 50, totalPages: 5}
```

如果看到网络错误，检查：
- 后端服务是否正在运行
- API 地址是否正确
- 微信开发者工具是否已关闭域名校验

### 5. 测试后端 API

你可以在浏览器中直接访问后端 API 来测试：

```
http://localhost:3000/api/public/hotels?city=上海&page=1&pageSize=10
```

如果返回 JSON 数据，说明后端正常工作。

## 常见问题

### Q: 城市显示为乱码（%E4%B8%8A%E6%B5%B7）

**A:** 已修复。现在列表页会自动解码 URL 参数。

### Q: 显示"暂无符合条件的酒店"

**A:** 可能原因：
1. 后端数据库中没有数据 - 运行种子数据脚本
2. 后端服务未启动 - 启动后端服务
3. API 请求失败 - 检查控制台错误信息

### Q: 如何添加测试数据？

**A:** 在后端目录运行：

```bash
cd hotel-management/backend
npm run seed
```

这会在数据库中生成测试酒店数据。

## 生产环境配置

在生产环境中，你需要：

1. 将后端部署到服务器（如阿里云、腾讯云）
2. 获取服务器的公网 IP 或域名
3. 在微信小程序后台配置合法域名
4. 修改 `constants.ts` 中的 `API_BASE_URL` 为生产环境地址

```typescript
export const API_BASE_URL = 'https://your-domain.com/api';
```

## 调试技巧

1. **查看控制台日志**：在微信开发者工具的控制台中查看请求和响应
2. **使用 Network 面板**：查看网络请求的详细信息
3. **检查后端日志**：查看后端控制台的日志输出
4. **使用 Postman**：测试后端 API 是否正常工作
