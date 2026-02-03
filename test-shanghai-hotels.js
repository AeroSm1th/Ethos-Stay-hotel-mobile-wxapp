/**
 * 测试上海酒店的星级分布
 */

const API_BASE_URL = 'http://localhost:3000/api';

async function testShanghaiHotels() {
  console.log('========================================');
  console.log('测试上海酒店星级分布');
  console.log('========================================\n');

  // 测试上海每个星级的酒店
  for (let star = 1; star <= 5; star++) {
    console.log(`=== 测试上海 ${star} 星级酒店 ===`);
    
    try {
      const url = `${API_BASE_URL}/public/hotels?page=1&pageSize=10&city=上海&starRating=${star}`;
      const response = await fetch(url);
      const data = await response.json();

      console.log(`请求 URL: ${url}`);
      console.log(`状态码: ${response.status}`);
      console.log(`返回数据:`);
      console.log(`- 总数: ${data.total}`);
      console.log(`- 酒店数量: ${data.data.length}`);
      
      if (data.data.length > 0) {
        console.log(`\n前 5 个酒店:`);
        data.data.slice(0, 5).forEach((hotel, index) => {
          console.log(`${index + 1}. ${hotel.nameCn} - 星级: ${hotel.starRating} - 地址: ${hotel.address}`);
        });
      } else {
        console.log('⚠️ 没有找到酒店');
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ 测试上海 ${star} 星级失败:`, error.message);
      console.log('');
    }
  }

  // 测试上海所有酒店
  console.log(`=== 测试上海所有酒店 ===`);
  try {
    const url = `${API_BASE_URL}/public/hotels?page=1&pageSize=20&city=上海`;
    const response = await fetch(url);
    const data = await response.json();

    console.log(`请求 URL: ${url}`);
    console.log(`状态码: ${response.status}`);
    console.log(`返回数据:`);
    console.log(`- 总数: ${data.total}`);
    console.log(`- 酒店数量: ${data.data.length}`);
    
    if (data.data.length > 0) {
      // 统计星级分布
      const starDistribution = {};
      data.data.forEach(hotel => {
        starDistribution[hotel.starRating] = (starDistribution[hotel.starRating] || 0) + 1;
      });
      
      console.log(`\n星级分布（前 20 个酒店）:`);
      for (let star = 1; star <= 5; star++) {
        console.log(`${star} 星: ${starDistribution[star] || 0} 家`);
      }
      
      console.log(`\n前 10 个酒店:`);
      data.data.slice(0, 10).forEach((hotel, index) => {
        console.log(`${index + 1}. ${hotel.nameCn} - 星级: ${hotel.starRating}`);
      });
    }
    
    console.log('');
  } catch (error) {
    console.error(`❌ 测试上海所有酒店失败:`, error.message);
    console.log('');
  }

  console.log('========================================');
  console.log('测试完成');
  console.log('========================================');
}

testShanghaiHotels().catch(console.error);
