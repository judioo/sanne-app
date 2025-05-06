#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory of the current script
const __dirname = dirname(fileURLToPath(import.meta.url));

// Check if uploadthing is installed
try {
  execSync('pnpm list uploadthing');
  console.log('✅ uploadthing package found');
} catch (error) {
  console.log('⚠️ uploadthing package not found. Installing...');
  try {
    execSync('pnpm add uploadthing', { stdio: 'inherit' });
    console.log('✅ uploadthing installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install uploadthing', installError);
    process.exit(1);
  }
}

// Check for UPLOADTHING_SECRET environment variable
if (!process.env.UPLOADTHING_SECRET) {
  console.error('❌ UPLOADTHING_SECRET environment variable is not set');
  console.log('Please set your UPLOADTHING_SECRET in .env file or export it in your terminal');
  console.log('Example: export UPLOADTHING_SECRET=your_secret_key');
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
