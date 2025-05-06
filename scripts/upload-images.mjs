#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

// Get the directory of the current script
const __dirname = dirname(fileURLToPath(import.meta.url));

// Check for .env.local file first (Next.js standard)
const envLocalPath = resolve(__dirname, '../.env.local');
if (!existsSync(envLocalPath)) {
  console.error('❌ .env.local file not found');
  console.log('Please make sure your UPLOADTHING_TOKEN is set in .env.local file');
  console.log('Example: UPLOADTHING_TOKEN=your_token_here');
  process.exit(1);
}

// Check if required packages are installed
const requiredPackages = ['uploadthing', 'dotenv'];
const missingPackages = [];

for (const pkg of requiredPackages) {
  try {
    execSync(`pnpm list ${pkg}`);
    console.log(`✅ ${pkg} package found`);
  } catch (error) {
    console.log(`⚠️ ${pkg} package not found. Will install.`);
    missingPackages.push(pkg);
  }
}

// Install missing packages
if (missingPackages.length > 0) {
  console.log(`Installing missing packages: ${missingPackages.join(', ')}...`);
  try {
    execSync(`pnpm add ${missingPackages.join(' ')}`, { stdio: 'inherit' });
    console.log('✅ Packages installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install packages', installError);
    process.exit(1);
  }
}

// Load environment variables directly via execSync
try {
  // Run the dotenv CLI tool to load environment variables from .env.local
  const dotenvOutput = execSync('node -e "require(\'dotenv\').config({ path: \'.env.local\' }); console.log(process.env.UPLOADTHING_TOKEN)"', {
    encoding: 'utf8',
    cwd: resolve(__dirname, '..')
  }).trim();
  
  // If dotenv found a token, set it in the current process
  if (dotenvOutput && dotenvOutput !== 'undefined') {
    process.env.UPLOADTHING_TOKEN = dotenvOutput;
    console.log('✅ Loaded environment variables from .env.local file');
  } else {
    console.warn('⚠️ No UPLOADTHING_TOKEN found in .env.local file');
  }
} catch (error) {
  console.error('❌ Failed to load environment variables:', error.message);
}

// Check for UPLOADTHING_TOKEN environment variable
if (!process.env.UPLOADTHING_TOKEN) {
  console.error('❌ UPLOADTHING_TOKEN environment variable is not set');
  console.log('Please set your UPLOADTHING_TOKEN in .env.local file or export it in your terminal');
  console.log('Example: export UPLOADTHING_TOKEN=your_secret_key');
  process.exit(1);
}

// Show token being used (masked for security)
const tokenLength = process.env.UPLOADTHING_TOKEN.length;
const maskedToken = tokenLength > 8 
  ? process.env.UPLOADTHING_TOKEN.substring(0, 4) + '•'.repeat(tokenLength - 8) + process.env.UPLOADTHING_TOKEN.substring(tokenLength - 4)
  : '•'.repeat(tokenLength);
console.log(`🔑 Using UPLOADTHING_TOKEN: ${maskedToken}`);

// Run the upload script
const scriptPath = resolve(__dirname, 'upload-to-uploadthing.ts');
console.log(`📂 Running upload script: ${scriptPath}`);

try {
  execSync(`pnpx tsx ${scriptPath}`, { 
    stdio: 'inherit',
    env: { ...process.env }  // Pass the current environment including UPLOADTHING_TOKEN
  });
  console.log('✅ Upload script completed successfully');
} catch (error) {
  console.error('❌ Upload script failed', error);
  process.exit(1);
}
