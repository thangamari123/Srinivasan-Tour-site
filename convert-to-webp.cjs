const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, 'public', 'images');

async function convertImages() {
  const files = fs.readdirSync(imagesDir);
  
  for (const file of files) {
    if (file.match(/\.(png|jpe?g)$/i)) {
      const filePath = path.join(imagesDir, file);
      const fileExt = path.extname(file);
      const baseName = path.basename(file, fileExt);
      const webpPath = path.join(imagesDir, `${baseName}.webp`);
      
      console.log(`Converting ${file} to WebP...`);
      try {
        await sharp(filePath)
          .webp({ quality: 80 })
          .toFile(webpPath);
        
        // Remove the original file after successful conversion
        fs.unlinkSync(filePath);
        console.log(`Successfully converted and removed original: ${file}`);
      } catch (error) {
        console.error(`Error converting ${file}:`, error);
      }
    }
  }
  console.log('All done!');
}

convertImages();
