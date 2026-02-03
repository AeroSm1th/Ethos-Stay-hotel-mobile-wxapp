/**
 * 调试列表页数据
 * 用于检查列表页是否正确接收和显示筛选选项卡
 */

const http = require('http');

// 模拟从首页跳转到列表页的 URL 参数
const testCases = [
  {
    name: '测试 1: 选择二星级',
    params: {
      city: '北京',
      checkIn: '2026-02-03',
      checkOut: '2026-02-04',
      starRating: '2',
    },
  },
  {
    name: '测试 2: 选择价格区间 ¥150-300',
    params: {
      city: '北京',
      checkIn: '2026-02-03',
      checkOut: '2026-02-04',
      minPrice: '150',
      maxPrice: '300',
    },
  },
  {
    name: '测试 3: 选择设施标签',
    params: {
      city: '北京',
      checkIn: '2026-02-03',
      checkOut: '2026-02-04',
      tags: '免费WiFi,停车场',
    },
  },
  {
    name: '测试 4: 组合筛选（星级 + 价格 + 设施）',
    params: {
      city: '北京',
      checkIn: '2026-02-03',
      checkOut: '2026-02-04',
      starRating: '3',
      minPrice: '300',
      maxPrice: '450',
      tags: '免费WiFi',
    },
  },
];

console.log('='.repeat(60));
console.log('列表页数据调试');
console.log('='.repeat(60));
console.log('');

testCases.forEach((testCase, index) => {
  console.log(`${testCase.name}`);
  console.log('-'.repeat(60));
  
  // 构造 URL 查询字符串
  const queryString = Object.keys(testCase.params)
    .map(key => `${key}=${encodeURIComponent(testCase.params[key])}`)
    .join('&');
  
  console.log('URL 参数:');
  console.log(`  /pages/list/list?${queryString}`);
  console.log('');
  
  console.log('解析后的参数:');
  Object.keys(testCase.params).forEach(key => {
    const value = testCase.params[key];
    const decoded = decodeURIComponent(value);
    console.log(`  ${key}: ${decoded}`);
  });
  console.log('');
  
  // 模拟列表页的数据初始化
  console.log('预期的列表页数据:');
  
  if (testCase.params.starRating) {
    console.log(`  selectedStarRating: ${testCase.params.starRating}`);
  }
  
  if (testCase.params.minPrice || testCase.params.maxPrice) {
    const minPrice = testCase.params.minPrice ? parseInt(testCase.params.minPrice) : undefined;
    const maxPrice = testCase.params.maxPrice ? parseInt(testCase.params.maxPrice) : undefined;
    
    let priceRange = '不限';
    if (minPrice === undefined && maxPrice !== undefined) {
      priceRange = `¥${maxPrice}以下`;
    } else if (minPrice !== undefined && maxPrice === undefined) {
      priceRange = `¥${minPrice}以上`;
    } else if (minPrice !== undefined && maxPrice !== undefined) {
      priceRange = `¥${minPrice}-${maxPrice}`;
    }
    
    console.log(`  selectedPriceRange: ${priceRange}`);
  }
  
  if (testCase.params.tags) {
    const tags = decodeURIComponent(testCase.params.tags).split(',');
    console.log(`  selectedTags: [${tags.map(t => `"${t}"`).join(', ')}]`);
  }
  
  console.log('');
  console.log('');
});

console.log('='.repeat(60));
console.log('调试提示');
console.log('='.repeat(60));
console.log('');
console.log('1. 在微信开发者工具中打开控制台');
console.log('2. 从首页点击"搜索酒店"按钮跳转到列表页');
console.log('3. 在控制台中查看以下日志:');
console.log('   - "列表页加载，参数:" - 应该显示 URL 参数');
console.log('   - 检查 selectedStarRating、selectedPriceRange、selectedTags 的值');
console.log('4. 检查页面上的选项卡是否高亮显示');
console.log('5. 如果没有高亮，检查:');
console.log('   - starOptions 数组是否正确加载');
console.log('   - priceOptions 数组是否正确加载');
console.log('   - selectedStarRating 的值是否与 item.value 匹配');
console.log('   - selectedPriceRange 的值是否与 item 匹配');
console.log('');
console.log('常见问题:');
console.log('- 如果选项卡不显示，检查 wx:if="{{!loading && hotels.length > 0}}"');
console.log('- 如果选项卡显示但不高亮，检查数据类型是否匹配（数字 vs 字符串）');
console.log('- 如果点击无效，检查 bindtap 事件是否正确绑定');
console.log('');
