#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync, writeFileSync } from 'fs';

// Get the directory of the current script
const __dirname = dirname(fileURLToPath(import.meta.url));

// Check if .env file exists, create it if not
const envPath = resolve(__dirname, '../.env');
if (!existsSync(envPath)) {
  console.log('⚠️ .env file not found. Creating a template .env file...');
  writeFileSync(envPath, 'UPLOADTHING_TOKEN=your_token_here\n');
  console.log(`✅ Template .env file created at ${envPath}`);
  console.log('Please edit this file and add your actual UPLOADTHING_TOKEN before running again.');
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

// Check for UPLOADTHING_TOKEN environment variable
if (!process.env.UPLOADTHING_TOKEN) {
  console.error('❌ UPLOADTHING_TOKEN environment variable is not set');
  console.log('Please set your UPLOADTHING_TOKEN in .env file or export it in your terminal');
  console.log('Example: export UPLOADTHING_TOKEN=your_secret_key');
  process.exit(1);
}

// Run the upload script
const scriptPath = resolve(__dirname, 'upload-to-uploadthing.ts');
console.log(`📂 Running upload script: ${scriptPath}`);

try {
  execSync(`pnpx tsx ${scriptPath}`, { stdio: 'inherit' });
  console.log('✅ Upload script completed successfully');
} catch (error) {
  console.error('❌ Upload script failed', error);
  process.exit(1);
}
