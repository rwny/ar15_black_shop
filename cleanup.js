const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to clean
const directories = [
  path.join(__dirname, 'node_modules', '.vite'),
  path.join(__dirname, 'node_modules', '.vite_cache')
];

// Delete cache directories
directories.forEach(dir => {
  try {
    if (fs.existsSync(dir)) {
      console.log(`Cleaning ${dir}...`);
      if (process.platform === 'win32') {
        try {
          execSync(`rmdir /s /q "${dir}"`, { stdio: 'inherit' });
        } catch (e) {
          console.log(`Failed to remove directory with rmdir, trying alternative method...`);
          // Alternative approach for Windows
          const rimraf = require('rimraf');
          rimraf.sync(dir);
        }
      } else {
        execSync(`rm -rf "${dir}"`, { stdio: 'inherit' });
      }
    }
  } catch (err) {
    console.error(`Error cleaning ${dir}:`, err);
  }
});

// Clear npm cache as well
try {
  console.log('Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('Npm cache cleared.');
} catch (e) {
  console.error('Error clearing npm cache:', e);
}

console.log('Cleanup complete!');
