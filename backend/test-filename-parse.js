// 测试文件名解析逻辑
const testFilenames = [
  '1774561219356_3480_132131_1.sb3',
  '1774561321452_8262_Scratch作品_1.sb3',
  '1774561416594_7677_Scratch作品_1.sb3',
  '1774538907406_943_123456.sb3',
  '1774559042784_3512_1231.sb3',
];

console.log('测试文件名解析逻辑:\n');

testFilenames.forEach(filename => {
  console.log('=== 测试:', filename);
  
  // 先去掉 .sb3 扩展名
  const nameWithoutExt = filename.replace('.sb3', '');
  console.log('  无扩展名:', nameWithoutExt);
  
  // 按下划线分割
  const parts = nameWithoutExt.split('_');
  console.log('  分割结果:', parts);
  
  // 检查最后一部分是否是数字标记
  let title = '';
  let clientMark = undefined;
  
  if (parts.length >= 4) {
    const lastPart = parts[parts.length - 1];
    const markNum = parseInt(lastPart, 10);
    console.log('  最后一部分:', lastPart, '解析为数字:', markNum);
    
    if (!isNaN(markNum) && (markNum === 1 || markNum === 2 || markNum === 3)) {
      // 有标记
      clientMark = markNum;
      // 标题是第3部分到倒数第2部分的组合
      title = parts.slice(2, parts.length - 1).join(' ');
    } else {
      // 无标记
      title = parts.slice(2).join(' ');
    }
  } else if (parts.length >= 3) {
    // 无标记
    title = parts.slice(2).join(' ');
  } else {
    title = nameWithoutExt;
  }
  
  console.log('  解析结果:');
  console.log('    - title:', title);
  console.log('    - clientMark:', clientMark);
  console.log('');
});
