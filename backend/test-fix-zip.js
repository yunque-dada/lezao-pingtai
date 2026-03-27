const fs = require('fs');
const path = require('path');

// 读取文件
const filePath = path.join(__dirname, 'uploads', 'users', 'user_69c440438efb8fdb8ec93d9d', 'scratch', '1774541760079_4510_ji积极.sb3');
const fileBuffer = fs.readFileSync(filePath);

console.log('原始文件大小:', fileBuffer.length);

// 查找结束记录
const endOfCentralDirSignature = Buffer.from([0x50, 0x4B, 0x05, 0x06]);
let endOfCentralDirPos = -1;

for (let i = fileBuffer.length - 22; i >= 0; i--) {
  if (fileBuffer.slice(i, i + 4).equals(endOfCentralDirSignature)) {
    endOfCentralDirPos = i;
    break;
  }
}

if (endOfCentralDirPos === -1) {
  console.log('错误: 未找到ZIP结束记录');
  process.exit(1);
}

console.log('结束记录位置:', endOfCentralDirPos);

// 读取当前的中央目录偏移量
const currentCentralDirOffset = fileBuffer.readUInt32LE(endOfCentralDirPos + 16);
console.log('当前中央目录偏移量:', currentCentralDirOffset);

// 查找实际的中央目录位置（第一个 PK\x01\x02）
const centralDirSignature = Buffer.from([0x50, 0x4B, 0x01, 0x02]);
let actualCentralDirPos = -1;

for (let i = 0; i < fileBuffer.length - 4; i++) {
  if (fileBuffer.slice(i, i + 4).equals(centralDirSignature)) {
    actualCentralDirPos = i;
    break;
  }
}

if (actualCentralDirPos === -1) {
  console.log('错误: 未找到中央目录');
  process.exit(1);
}

console.log('实际中央目录位置:', actualCentralDirPos);

// 创建修复后的缓冲区
const fixedBuffer = Buffer.from(fileBuffer);
fixedBuffer.writeUInt32LE(actualCentralDirPos, endOfCentralDirPos + 16);

console.log('修复后的中央目录偏移量:', fixedBuffer.readUInt32LE(endOfCentralDirPos + 16));

// 保存修复后的文件
const fixedFilePath = path.join(__dirname, 'uploads', 'users', 'user_69c440438efb8fdb8ec93d9d', 'scratch', '1774541760079_4510_ji积极_fixed.sb3');
fs.writeFileSync(fixedFilePath, fixedBuffer);

console.log('修复后的文件已保存:', fixedFilePath);
console.log('请使用修复后的文件测试加载功能');
