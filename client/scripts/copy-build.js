const fs = require('fs-extra');
const path = require('path');

async function copyBuildToDist() {
  try {
    const buildPath = path.join(__dirname, '..', 'build');
    const distPath = path.join(__dirname, '..', 'dist');
    
    // Check if build directory exists
    if (!fs.existsSync(buildPath)) {
      console.error('Build directory does not exist. Run "npm run build" first.');
      process.exit(1);
    }
    
    // Remove existing dist directory if it exists
    if (fs.existsSync(distPath)) {
      await fs.remove(distPath);
    }
    
    // Copy build to dist
    await fs.copy(buildPath, distPath);
    console.log('Successfully copied build to dist directory');
  } catch (error) {
    console.error('Error copying build to dist:', error);
    process.exit(1);
  }
}

copyBuildToDist();
