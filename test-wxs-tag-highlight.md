# 测试首页设施标签高亮功能

## 问题描述
点击首页的设施标签（如"免费WiFi"）后，标签没有高亮显示。

## 测试步骤

### 1. 清除缓存并重新编译
1. 在微信开发者工具中，点击 **"工具"** → **"清缓存"** → **"清除所有缓存"**
2. 重启微信开发者工具
3. 点击 **"编译"** 按钮

### 2. 打开控制台
在微信开发者工具中打开 **"控制台"** 标签页

### 3. 测试标签点击
1. 在首页，点击"免费WiFi"标签
2. 查看控制台输出

### 4. 预期的控制台输出

```
=== 首页标签点击 ===
点击的标签: 免费WiFi
点击前 selectedTags: []
添加选中，新数组: ["免费WiFi"]
setData 完成后 data.selectedTags: ["免费WiFi"]
```

### 5. 预期的页面效果
- "免费WiFi"标签应该变成蓝色背景（高亮状态）
- 再次点击"免费WiFi"标签，应该取消高亮（变回灰色背景）

## 可能的问题和解决方案

### 问题 1: WXS 文件没有被编译
**症状**: 控制台显示 `searchUtils is not defined` 或类似错误

**解决方案**:
1. 检查 `search.wxml` 文件开头是否有：
   ```xml
   <wxs module="searchUtils" src="./search.wxs"></wxs>
   ```
2. 检查 `search.wxs` 文件是否存在
3. 重新编译项目

### 问题 2: 数据更新了但页面没有刷新
**症状**: 控制台显示 `selectedTags` 已更新，但页面没有变化

**解决方案**:
1. 检查 WXML 中的判断逻辑：
   ```xml
   {{searchUtils.isTagSelected(selectedTags, item) ? 'active' : ''}}
   ```
2. 检查 CSS 样式 `.tag-item.active` 是否正确定义
3. 使用微信开发者工具的 **"调试器"** → **"Wxml"** 面板，查看元素的 class 属性

### 问题 3: WXS 函数返回值不正确
**症状**: 标签始终不高亮或始终高亮

**解决方案**:
在 `search.wxs` 中添加调试日志：
```javascript
function isTagSelected(selectedTags, tag) {
  console.log('WXS isTagSelected 被调用:', tag, selectedTags);
  
  if (!selectedTags || selectedTags.length === 0) {
    console.log('selectedTags 为空，返回 false');
    return false;
  }
  
  for (var i = 0; i < selectedTags.length; i++) {
    if (selectedTags[i] === tag) {
      console.log('找到匹配的标签，返回 true');
      return true;
    }
  }
  
  console.log('没有找到匹配的标签，返回 false');
  return false;
}
```

### 问题 4: TypeScript 编译问题
**症状**: 修改代码后没有效果

**解决方案**:
1. 检查 `search.ts` 是否有编译错误（查看控制台）
2. 手动删除 `search.js` 文件，强制重新编译
3. 使用命令行手动编译：
   ```bash
   cd hotel-mobile-wxapp
   tsc --project tsconfig.json
   ```

## 调试技巧

### 技巧 1: 使用 Wxml 面板查看实时数据
1. 在微信开发者工具中，点击 **"调试器"** → **"Wxml"** 标签
2. 找到设施标签的元素（class="tag-item"）
3. 查看元素的 class 属性，应该包含 "active" 类名（如果标签被选中）

### 技巧 2: 使用 AppData 面板查看数据
1. 在微信开发者工具中，点击 **"调试器"** → **"AppData"** 标签
2. 找到 `selectedTags` 字段
3. 点击标签后，观察 `selectedTags` 的值是否变化

### 技巧 3: 临时简化判断逻辑
如果 WXS 有问题，可以临时使用简单的判断逻辑测试：

在 `search.wxml` 中，将：
```xml
{{searchUtils.isTagSelected(selectedTags, item) ? 'active' : ''}}
```

临时改为：
```xml
{{selectedTags[0] === item ? 'active' : ''}}
```

如果这样可以高亮第一个选中的标签，说明问题出在 WXS 函数上。

## 验证修复

修复后，应该能够：
1. ✅ 点击标签后，标签立即高亮（蓝色背景）
2. ✅ 再次点击标签，取消高亮（灰色背景）
3. ✅ 可以同时选中多个标签
4. ✅ 控制台显示正确的调试日志
5. ✅ 点击"搜索酒店"按钮后，跳转到列表页，列表页也显示对应的高亮标签

