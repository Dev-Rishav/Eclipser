#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const images = [
  'python:3.9-slim',
  'node:18-slim', 
  'openjdk:11',
  'gcc:latest'
];

async function pullImage(imageName) {
  console.log(`🐳 Pulling Docker image: ${imageName}`);
  try {
    const { stdout, stderr } = await execAsync(`docker pull ${imageName}`);
    console.log(`✅ Successfully pulled: ${imageName}`);
    if (stderr) {
      console.log(`   Output: ${stderr.trim()}`);
    }
  } catch (error) {
    console.error(`❌ Failed to pull ${imageName}:`, error.message);
    throw error;
  }
}

async function pullAllImages() {
  console.log('🚀 Starting Docker image pre-pull...\n');
  
  try {
    // Check if Docker is available
    await execAsync('docker --version');
    console.log('✅ Docker is available\n');
  } catch (error) {
    console.error('❌ Docker is not available:', error.message);
    process.exit(1);
  }

  for (const image of images) {
    try {
      await pullImage(image);
    } catch (error) {
      console.error(`❌ Critical error pulling ${image}. Continuing with other images...`);
    }
    console.log(); // Empty line for readability
  }

  console.log('🎉 Docker image pre-pull completed!');
}

// Run if called directly
if (require.main === module) {
  pullAllImages().catch(error => {
    console.error('❌ Pre-pull script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { pullAllImages };
