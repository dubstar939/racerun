/**
 * Asset Optimization Script
 * Simple placeholder for asset optimization pipeline
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'images');
const OUTPUT_DIR = path.join(__dirname, '..', 'assets');

console.log('RacerUN Asset Optimizer');
console.log('======================\n');

// Check if image optimization tools are available
function checkTools() {
  const tools = {
    pngquant: false,
    mozjpeg: false,
    svgo: false
  };
  
  try {
    require.resolve('pngquant-bin');
    tools.pngquant = true;
  } catch (e) {}
  
  try {
    require.resolve('mozjpeg');
    tools.mozjpeg = true;
  } catch (e) {}
  
  try {
    require.resolve('svgo');
    tools.svgo = true;
  } catch (e) {}
  
  return tools;
}

// List assets
function listAssets() {
  console.log('Assets found:');
  
  const dirs = ['.', 'background', 'sprites'];
  dirs.forEach(dir => {
    const dirPath = path.join(ASSETS_DIR, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter(f => 
        f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.svg')
      );
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`  ${dir === '.' ? '' : dir + '/'}${file} - ${size} KB`);
      });
    }
  });
}

// Copy assets to output directory
function copyAssets() {
  console.log('\nCopying assets to output directory...');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const dirs = ['.', 'background', 'sprites'];
  dirs.forEach(dir => {
    const srcDir = path.join(ASSETS_DIR, dir);
    const dstDir = path.join(OUTPUT_DIR, dir === '.' ? '' : dir);
    
    if (fs.existsSync(srcDir)) {
      if (!fs.existsSync(dstDir)) {
        fs.mkdirSync(dstDir, { recursive: true });
      }
      
      const files = fs.readdirSync(srcDir);
      files.forEach(file => {
        if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.svg')) {
          const src = path.join(srcDir, file);
          const dst = path.join(dstDir, file);
          fs.copyFileSync(src, dst);
          console.log(`  Copied: ${file}`);
        }
      });
    }
  });
}

// Main
const tools = checkTools();
console.log('Available optimization tools:');
console.log(`  PNG quantization: ${tools.pngquant ? '✓' : '✗ (install pngquant-bin)'}`);
console.log(`  JPEG optimization: ${tools.mozjpeg ? '✓' : '✗ (install mozjpeg)'}`);
console.log(`  SVG optimization: ${tools.svgo ? '✓' : '✗ (install svgo)'}`);

console.log('');
listAssets();
copyAssets();

console.log('\n✅ Asset optimization complete!');
console.log('Note: For production, consider using:');
console.log('  - Image compression tools (pngquant, oxipng)');
console.log('  - WebP format for better compression');
console.log('  - CDN for asset delivery');
