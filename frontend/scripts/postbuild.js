const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const buildDir = path.join(projectRoot, 'build');

const filesToCopy = ['.htaccess'];

for (const filename of filesToCopy) {
  const source = path.join(publicDir, filename);
  const destination = path.join(buildDir, filename);

  if (!fs.existsSync(source) || !fs.existsSync(buildDir)) {
    continue;
  }

  fs.copyFileSync(source, destination);
}
