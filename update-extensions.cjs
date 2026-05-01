const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function replaceInDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      replaceInDirectory(fullPath);
    } else if (fullPath.match(/\.(tsx|ts)$/)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace only paths that contain /images/ and end with .jpg or .png
      const regex = /(\/images\/[^"'\s]+)\.(jpg|png)/gi;
      const newContent = content.replace(regex, '$1.webp');

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
}

replaceInDirectory(srcDir);
console.log('Update complete!');
