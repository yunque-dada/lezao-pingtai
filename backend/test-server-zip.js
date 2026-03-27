const fs = require('fs');
const path = require('path');

// 读取文件
const filePath = path.join(__dirname, 'uploads', 'users', 'user_69c440438efb8fdb8ec93d9d', 'scratch', '1774541760079_4510_ji积极.sb3');
const fileBuffer = fs.readFileSync(filePath);

console.log('文件大小:', fileBuffer.length);
console.log('文件前4字节:', fileBuffer.slice(0, 4));
console.log('文件最后22字节:', fileBuffer.slice(-22));

// 检查ZIP结束记录
const endOfCentralDirSignature = Buffer.from([0x50, 0x4B, 0x05, 0x06]); // PK\x05\x06
let foundEndOfCentralDir = false;
let centralDirOffset = 0;

for (let i = fileBuffer.length - 22; i >= 0; i--) {
  if (fileBuffer.slice(i, i + 4).equals(endOfCentralDirSignature)) {
    foundEndOfCentralDir = true;
    centralDirOffset = fileBuffer.readUInt32LE(i + 16);
    console.log('找到ZIP结束记录，位置:', i);
    console.log('中央目录偏移量:', centralDirOffset);
    break;
  }
}

if (!foundEndOfCentralDir) {
  console.log('错误: 未找到ZIP结束记录');
} else {
  // 检查中央目录
  if (centralDirOffset < fileBuffer.length) {
    const centralDirSignature = Buffer.from([0x50, 0x4B, 0x01, 0x02]); // PK\x01\x02
    const actualSignature = fileBuffer.slice(centralDirOffset, centralDirOffset + 4);
    console.log('中央目录前4字节:', actualSignature);
    console.log('是否为中央目录:', actualSignature.equals(centralDirSignature));
  } else {
    console.log('错误: 中央目录偏移量超出文件范围');
  }
}
