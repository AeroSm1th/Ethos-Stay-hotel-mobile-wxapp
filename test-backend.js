/**
 * 后端 API 测试脚本
 * 用于验证后端服务是否正常工作
 */

const http = require('http');

const API_BASE_URL = 'http://localhost:3000';

/**
 * 发起 HTTP GET 请求
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: json });
        } catch (error) {
          reject(new Error('解析 JSON 失败: ' + error.message));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * 测试酒店列表 API
 */
async function testHotelList() {
  console.log('\n=== 测试酒店列表 API ===');
  
  try {
    const url = `${API_BASE_URL}/api/public/hotels?page=1&pageSize=5`;
    console.log('请求 URL:', url);
    
    const result = await httpGet(url);
    
    console.log('状态码:', result.statusCode);
    console.log('返回数据:');
    console.log('- 总数:', result.data.total);
    console.log('- 当前页:', result.data.page);
    console.log('- 每页数量:', result.data.pageSize);
    console.log('- 总页数:', result.data.totalPages);
    console.log('- 酒店数量:', result.data.data.length);
    
    if (result.data.data.length > 0) {
      console.log('\n第一个酒店:');
      const hotel = result.data.data[0];
      console.log('- ID:', hotel.id);
      console.log('- 名称:', hotel.nameCn);
      console.log('- 地址:', hotel.address);
      console.log('- 星级:', hotel.starRating);
      console.log('- 房型数量:', hotel.roomTypes?.length || 0);
    }
    
    console.log('\n✅ 酒店列表 API 测试通过');
    return true;
  } catch (error) {
    console.error('\n❌ 酒店列表 API 测试失败:', error.message);
    return false;
  }
}

/**
 * 测试带城市筛选的酒店列表 API
 */
async function testHotelListWithCity() {
  console.log('\n=== 测试带城市筛选的酒店列表 API ===');
  
  try {
    const city = encodeURIComponent('上海');
    const url = `${API_BASE_URL}/api/public/hotels?page=1&pageSize=5&city=${city}`;
    console.log('请求 URL:', url);
    
    const result = await httpGet(url);
    
    console.log('状态码:', result.statusCode);
    console.log('返回数据:');
    console.log('- 总数:', result.data.total);
    console.log('- 酒店数量:', result.data.data.length);
    
    if (result.data.data.length > 0) {
      console.log('\n上海的酒店:');
      result.data.data.forEach((hotel, index) => {
        console.log(`${index + 1}. ${hotel.nameCn} - ${hotel.address}`);
      });
    }
    
    console.log('\n✅ 带城市筛选的酒店列表 API 测试通过');
    return true;
  } catch (error) {
    console.error('\n❌ 带城市筛选的酒店列表 API 测试失败:', error.message);
    return false;
  }
}

/**
 * 测试酒店详情 API
 */
async function testHotelDetail() {
  console.log('\n=== 测试酒店详情 API ===');
  
  try {
    // 先获取一个酒店 ID
    const listResult = await httpGet(`${API_BASE_URL}/api/public/hotels?page=1&pageSize=1`);
    
    if (listResult.data.data.length === 0) {
      console.log('⚠️  数据库中没有酒店数据');
      return false;
    }
    
    const hotelId = listResult.data.data[0].id;
    const url = `${API_BASE_URL}/api/public/hotels/${hotelId}`;
    console.log('请求 URL:', url);
    
    const result = await httpGet(url);
    
    console.log('状态码:', result.statusCode);
    console.log('酒店详情:');
    console.log('- ID:', result.data.id);
    console.log('- 名称:', result.data.nameCn);
    console.log('- 地址:', result.data.address);
    console.log('- 星级:', result.data.starRating);
    console.log('- 设施:', result.data.facilities?.join(', ') || '无');
    console.log('- 房型数量:', result.data.roomTypes?.length || 0);
    console.log('- 图片数量:', result.data.images?.length || 0);
    
    console.log('\n✅ 酒店详情 API 测试通过');
    return true;
  } catch (error) {
    console.error('\n❌ 酒店详情 API 测试失败:', error.message);
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('========================================');
  console.log('后端 API 测试');
  console.log('========================================');
  
  const results = [];
  
  results.push(await testHotelList());
  results.push(await testHotelListWithCity());
  results.push(await testHotelDetail());
  
  console.log('\n========================================');
  console.log('测试总结');
  console.log('========================================');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`通过: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n✅ 所有测试通过！后端 API 工作正常。');
    console.log('\n如果小程序仍然无法加载数据，请检查：');
    console.log('1. 微信开发者工具是否已关闭域名校验');
    console.log('2. miniprogram/utils/constants.ts 中的 API_BASE_URL 是否正确');
    console.log('3. 小程序控制台是否有错误信息');
  } else {
    console.log('\n❌ 部分测试失败。请检查后端服务是否正常运行。');
    console.log('\n启动后端服务：');
    console.log('cd hotel-management/backend');
    console.log('npm run start:dev');
  }
}

// 运行测试
runAllTests().catch(error => {
  console.error('\n❌ 测试运行失败:', error);
  process.exit(1);
});
