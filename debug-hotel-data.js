/**
 * 调试脚本：检查酒店数据结构
 */

const http = require('http');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error('解析 JSON 失败: ' + error.message));
        }
      });
    }).on('error', reject);
  });
}

async function debugHotelData() {
  console.log('========================================');
  console.log('调试酒店数据结构');
  console.log('========================================\n');

  try {
    const city = encodeURIComponent('上海');
    const url = `http://localhost:3000/api/public/hotels?page=1&pageSize=3&city=${city}`;
    
    console.log('请求 URL:', url);
    console.log('');
    
    const response = await httpGet(url);
    
    console.log('=== 响应概览 ===');
    console.log('总数:', response.total);
    console.log('当前页:', response.page);
    console.log('酒店数量:', response.data.length);
    console.log('');
    
    // 详细检查每个酒店
    response.data.forEach((hotel, index) => {
      console.log(`\n========== 酒店 ${index + 1} ==========`);
      console.log('ID:', hotel.id);
      console.log('名称:', hotel.nameCn);
      console.log('星级:', hotel.starRating, '星');
      console.log('地址:', hotel.address);
      
      console.log('\n设施 (facilities):');
      if (hotel.facilities && hotel.facilities.length > 0) {
        hotel.facilities.forEach((f, i) => {
          console.log(`  ${i + 1}. ${f}`);
        });
      } else {
        console.log('  无设施数据');
      }
      
      console.log('\n房型 (roomTypes):');
      if (hotel.roomTypes && hotel.roomTypes.length > 0) {
        hotel.roomTypes.forEach((room, i) => {
          console.log(`  ${i + 1}. ${room.name}`);
          console.log(`     价格: ${room.price} (类型: ${typeof room.price})`);
          console.log(`     原价: ${room.originalPrice} (类型: ${typeof room.originalPrice})`);
          console.log(`     床型: ${room.bedType}`);
          console.log(`     面积: ${room.roomSize}㎡`);
          console.log(`     最多入住: ${room.maxGuests}人`);
        });
        
        // 计算最低价格
        const prices = hotel.roomTypes.map(room => {
          const price = typeof room.price === 'string' ? parseFloat(room.price) : room.price;
          return price;
        });
        const minPrice = Math.min(...prices);
        console.log(`\n  ✅ 最低价格: ¥${Math.floor(minPrice)}`);
      } else {
        console.log('  ❌ 无房型数据');
      }
      
      console.log('\n图片 (images):');
      if (hotel.images && hotel.images.length > 0) {
        console.log(`  共 ${hotel.images.length} 张图片`);
        hotel.images.forEach((img, i) => {
          console.log(`  ${i + 1}. ${img.description || '无描述'}`);
        });
      } else {
        console.log('  无图片数据');
      }
    });
    
    console.log('\n========================================');
    console.log('数据结构检查完成');
    console.log('========================================');
    
    // 检查问题
    console.log('\n=== 问题诊断 ===');
    
    const hasRoomTypes = response.data.every(h => h.roomTypes && h.roomTypes.length > 0);
    const hasPrices = response.data.every(h => 
      h.roomTypes && h.roomTypes.every(r => r.price !== null && r.price !== undefined)
    );
    const pricesAreStrings = response.data.every(h => 
      h.roomTypes && h.roomTypes.every(r => typeof r.price === 'string')
    );
    
    console.log('✓ 所有酒店都有房型数据:', hasRoomTypes ? '是' : '否');
    console.log('✓ 所有房型都有价格:', hasPrices ? '是' : '否');
    console.log('✓ 价格都是字符串格式:', pricesAreStrings ? '是' : '否');
    
    if (pricesAreStrings) {
      console.log('\n⚠️  价格是字符串格式，需要在前端转换为数字');
      console.log('   解决方案：使用 parseFloat(room.price)');
    }
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
  }
}

debugHotelData();
