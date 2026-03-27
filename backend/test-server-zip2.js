const fs = require('fs');
const path = require('path');

// 读取文件
const filePath = path.join(__dirname, 'uploads', 'users', 'user_69c440438efb8fdb8ec93d9d', 'scratch', '1774541760079_4510_ji积极.sb3');
const fileBuffer = fs.readFileSync(filePath);

console.log('文件大小:', fileBuffer.length);

// 查找所有 PK 标记
const pkSignature = Buffer.from([0x50, 0x4B]); // PK
const foundPositions = [];

for (let i = 0; i < fileBuffer.length - 2; i++) {
  if (fileBuffer.slice(i, i + 2).equals(pkSignature)) {
    const nextByte = fileBuffer[i + 2];
    const nextNextByte = fileBuffer[i + 3];
    
    // 检查是否是有效的 ZIP 标记
    if ((nextByte === 0x03 && nextNextByte === 0x04) || // 本地文件头
        (nextByte === 0x01 && nextNextByte === 0x02) || // 中央目录
        (nextByte === 0x05 && nextNextByte === 0x06) || // 结束记录
        (nextByte === 0x06 && nextNextByte === 0x06)) { // 数字签名
      foundPositions.push({
        position: i,
        type: nextByte === 0x03 ? '本地文件头' :
              nextByte === 0x01 ? '中央目录' :
              nextByte === 0x05 ? '结束记录' : '其他'
      });
    }
  }
}

console.log('找到的所有 ZIP 标记:');
foundPositions.forEach(pos => {
  console.log(`  位置 ${pos.position}: ${pos.type}`);
});

// 检查中央目录偏移量 74565 附近的数据
const centralDirOffset = 74565;
console.log(`\n中央目录偏移量 ${centralDirOffset} 附近的数据:`);
for (let i = centralDirOffset - 10; i < centralDirOffset + 20; i++) {
  if (i >= 0 && i < fileBuffer.length) {
    process.stdout.write(fileBuffer[i].toString(16).padStart(2, '0') + ' ');
  }
}
console.log();
