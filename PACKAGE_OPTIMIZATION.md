# 小程序包体积优化说明

## 已实施的优化措施

### 1. 代码压缩
- 启用 JavaScript 代码压缩（minified: true）
- 启用 WXSS 样式压缩（minifyWXSS: true）
- 启用 WXML 模板压缩（minifyWXML: true）
- 启用 ES6 转 ES5（es6: true）

### 2. 文件排除
在 `project.config.json` 的 `packOptions.ignore` 中配置了以下排除规则：
- 测试文件：`**/*.test.ts`、`**/*.property.test.ts`
- 文档文件：`**/*.md`
- 调试脚本：`debug-*.js`、`test-*.js`
- node_modules 文件夹

### 3. 上传优化
- 关闭 SourceMap 上传（uploadWithSourceMap: false）
- 启用忽略未使用文件（ignoreUploadUnusedFiles: true）

### 4. 代码优化
- 使用缓存减少重复请求
- 使用请求去重避免并发重复请求
- 图片懒加载减少初始加载
- 分页加载减少单次数据量

## 包体积检查

### 开发阶段
在微信开发者工具中查看包体积：
1. 点击工具栏的"详情"
2. 查看"本地代码"标签页
3. 查看代码包大小

### 上传前检查
1. 确保所有测试文件不会被打包
2. 确保文档文件不会被打包
3. 确保调试脚本不会被打包
4. 检查是否有未使用的图片资源
5. 检查是否有未使用的组件或页面

## 进一步优化建议

### 1. 图片优化
- 使用 WebP 格式（如果后端支持）
- 压缩图片质量
- 使用 CDN 存储图片，不要放在小程序包内

### 2. 代码分包
如果小程序包体积超过 2MB，考虑使用分包加载：
```json
{
  "subpackages": [
    {
      "root": "packageA",
      "pages": [
        "pages/detail/detail"
      ]
    }
  ]
}
```

### 3. 按需加载
- 使用 `wx:if` 而不是 `hidden` 来条件渲染大型组件
- 延迟加载非首屏内容

### 4. 依赖优化
- 检查 package.json，移除未使用的依赖
- 使用轻量级的替代库

## 包体积限制

微信小程序包体积限制：
- 主包：不超过 2MB
- 分包：单个分包不超过 2MB
- 总包：所有分包 + 主包不超过 20MB

## 监控和维护

定期检查包体积：
1. 每次添加新功能后检查包体积变化
2. 每次添加新依赖后检查包体积变化
3. 定期清理未使用的代码和资源
4. 使用微信开发者工具的"代码质量"功能检查问题

## 相关配置文件

- `project.config.json`: 小程序项目配置
- `.gitignore`: Git 忽略文件配置
- `tsconfig.json`: TypeScript 编译配置
