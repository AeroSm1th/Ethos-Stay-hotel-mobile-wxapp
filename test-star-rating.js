/**
 * 测试星级筛选功能
 */

const API_BASE_URL = 'http://localhost:3000/api';

async function testStarRating() {
  console.log('========================================');
  console.log('测试星级筛选功能');
  console.log('========================================\n');

  // 测试每个星级
  for (let star = 1; star <= 5; star++) {
    console.log(`=== 测试 ${star} 星级酒店 ===`);
    
    try {
      const url = `${API_BASE_URL}/public/hotels?page=1&pageSize=5&starRating=${star}`;
      const response = await fetch(url);
      const data = await response.json();

      console.log(`请求 URL: ${url}`);
      console.log(`状态码: ${response.status}`);
      console.log(`返回数据:`);
      console.log(`- 总数: ${data.total}`);
      console.log(`- 酒店数量: ${data.data.length}`);
      
      if (data.data.length > 0) {
        console.log(`\n前 3 个酒店:`);
        data.data.slice(0, 3).forEach((hotel, index) => {
          console.log(`${index + 1}. ${hotel.nameCn} - 星级: ${hotel.starRating}`);
        });
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ 测试 ${star} 星级失败:`, error.message);
      console.log('');
    }
  }

  // 测试不限（不传 starRating 参数）
  console.log(`=== 测试不限星级 ===`);
  try {
    const url = `${API_BASE_URL}/public/hotels?page=1&pageSize=5`;
    const response = await fetch(url);
    const data = await response.json();

    console.log(`请求 URL: ${url}`);
    console.log(`状态码: ${response.status}`);
    console.log(`返回数据:`);
    console.log(`- 总数: ${data.total}`);
    console.log(`- 酒店数量: ${data.data.length}`);
    
    if (data.data.length > 0) {
      console.log(`\n前 3 个酒店:`);
      data.data.slice(0, 3).forEach((hotel, index) => {
        console.log(`${index + 1}. ${hotel.nameCn} - 星级: ${hotel.starRating}`);
      });
    }
    
    console.log('');
  } catch (error) {
    console.error(`❌ 测试不限星级失败:`, error.message);
    console.log('');
  }

  console.log('========================================');
  console.log('测试完成');
  console.log('========================================');
}

testStarRating().catch(console.error);
