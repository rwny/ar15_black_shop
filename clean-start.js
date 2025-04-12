const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const viteDepPath = path.join(__dirname, 'node_modules', '.vite', 'deps');

// Try to clean up the vite cache directory
try {
  if (fs.existsSync(viteDepPath)) {
    console.log('Cleaning up Vite dependency cache...');
    fs.rmSync(viteDepPath, { recursive: true, force: true });
    console.log('Vite dependency cache cleaned successfully.');
  }
} catch (err) {
  console.error('Failed to clean Vite cache:', err);
  console.log('Continuing with startup anyway...');
}

// Start the development server
console.log('Starting development server...');
exec('npm run dev', { stdio: 'inherit' }, (error) => {
  if (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});
