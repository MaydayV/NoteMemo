const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 图标尺寸列表
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const appleIconSizes = [180]; // Apple特有图标尺寸

// 输入和输出路径
const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 生成标准图标
async function generateIcons() {
  try {
    // 读取SVG文件
    const svgBuffer = fs.readFileSync(inputSvg);
    
    // 为每个尺寸生成PNG
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      
      console.log(`生成图标: icon-${size}x${size}.png`);
    }
    
    // 生成Apple特有图标
    for (const size of appleIconSizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `apple-icon-${size}x${size}.png`));
      
      console.log(`生成Apple图标: apple-icon-${size}x${size}.png`);
    }
    
    console.log('所有图标生成完成!');
  } catch (error) {
    console.error('生成图标时出错:', error);
  }
}

// 执行生成
generateIcons(); 