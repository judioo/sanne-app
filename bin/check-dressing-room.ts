#!/usr/bin/env tsx

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { config } from 'dotenv';
import { Command } from 'commander';
import chalk from 'chalk';
import type { AppRouter } from '../server/routers/index';

// Define the structure of job status response
interface JobStatus {
  jobId: string;
  status?: string;
  productId?: number;
  md5sum?: string;
  updatedAt?: number;
  uploadResult?: {
    data?: {
      key?: string;
      url?: string;
      ufsUrl?: string;
      name?: string;
      size?: number;
      type?: string;
      customId?: string | null;
      lastModified?: number;
      fileHash?: string;
    }
  };
  [key: string]: any;
}

// Load environment variables from .env.local
config();

// CLI setup
const program = new Command();

program
  .name('check-dressing-room')
  .description('Test the checkDressingRoom TRPC endpoint')
  .version('0.1.0')
  .option('-p, --prod', 'Use production environment', false)
  .option('-j, --job-ids <ids...>', 'Job IDs to check (comma-separated or multiple arguments)')
  .option('-w, --watch', 'Watch mode - continuously check job status every 5 seconds', false)
  .option('-v, --verbose', 'Verbose mode - pretty print request and response data', false);

program.parse();

const options = program.opts();

// Determine base URL based on environment
const baseUrl = options.prod 
  ? 'https://sanna.imara.ae' 
  : 'http://localhost:3000';

console.log(chalk.blue(`Using ${options.prod ? 'PRODUCTION' : 'DEVELOPMENT'} environment: ${baseUrl}`));

// Create TRPC client
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${baseUrl}/api/trpc`,
    }),
  ],
});

// Parse job IDs
let jobIds: string[] = [];

if (options.jobIds) {
  // Handle both comma-separated format and multiple arguments
  if (typeof options.jobIds === 'string') {
    jobIds = options.jobIds.split(',').map((id: string) => id.trim());
  } else {
    jobIds = options.jobIds.flatMap((id: string) => 
      id.includes(',') ? id.split(',').map((part: string) => part.trim()) : id.trim()
    );
  }
}

// Validate job IDs
if (jobIds.length === 0) {
  console.error(chalk.red('Error: No job IDs specified'));
  console.log(chalk.yellow('Usage examples:'));
  console.log(chalk.yellow('  pnpm check-dressing-room -j d-314e13621e28c9afb7f6a549462037fa-68'));
  console.log(chalk.yellow('  pnpm check-dressing-room -j d-314e13621e28c9afb7f6a549462037fa-68,d-12345-70'));
  console.log(chalk.yellow('  pnpm check-dressing-room -j d-314e13621e28c9afb7f6a549462037fa-68 d-12345-70'));
  console.log(chalk.yellow('  pnpm check-dressing-room -p -j d-314e13621e28c9afb7f6a549462037fa-68'));
  process.exit(1);
}

console.log(chalk.green(`Checking status for ${jobIds.length} job(s):`));
console.log(chalk.green(jobIds.map(id => `  - ${id}`).join('\n')));

// Function to check job status
async function checkJobs() {
  try {
    const startTime = Date.now();
    const requestData = { jobIds };
    
    // Log request in verbose mode
    if (options.verbose) {
      console.log(chalk.yellow('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.yellow.bold('📤 REQUEST:'));
      console.log(chalk.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      prettyPrint(requestData, 'Request Data', chalk.cyan);
    }
    
    const results = await trpc.products.checkDressingRoom.query(requestData);
    const duration = Date.now() - startTime;
    
    // Log response in verbose mode
    if (options.verbose) {
      console.log(chalk.green('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.green.bold(`📥 RESPONSE: (${duration}ms)`));
      console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      prettyPrint(results, `Response Data (${duration}ms)`, chalk.green);
    }
    
    console.log(chalk.blue(`\nResults (query took ${duration}ms):`));
    
    // Process and display results
    Object.entries(results).forEach(([jobId, data]) => {
      console.log(chalk.cyan(`\nJob ID: ${jobId}`));
      
      if (!data) {
        console.log(chalk.yellow('  No data found for this job ID'));
        return;
      }
      
      // Cast data to our interface type for type safety
      const jobStatus = data as JobStatus;
      
      // Format status info
      console.log(chalk.green(`  Status: ${jobStatus.status || 'unknown'}`));
      
      // Show upload result if available
      if (jobStatus.uploadResult?.data) {
        const upload = jobStatus.uploadResult.data;
        console.log(chalk.green(`  Upload URL: ${upload.ufsUrl || upload.url}`));
        console.log(chalk.green(`  File name: ${upload.name || 'unnamed'}`));
        console.log(chalk.green(`  File size: ${upload.size ? formatFileSize(upload.size) : 'unknown'}`));
        console.log(chalk.green(`  Last modified: ${upload.lastModified ? new Date(upload.lastModified).toLocaleString() : 'unknown'}`));
      }
      
      // Show job metadata
      if (jobStatus.updatedAt) {
        console.log(chalk.yellow(`  Last updated: ${new Date(jobStatus.updatedAt).toLocaleString()}`));
      }
      
      // Show product info if available
      if (jobStatus.productId) {
        console.log(chalk.magenta(`  Product ID: ${jobStatus.productId}`));
      }
      
      if (jobStatus.md5sum) {
        console.log(chalk.magenta(`  Image MD5: ${jobStatus.md5sum}`));
      }
    });
    
    console.log('\n');
  } catch (error) {
    console.error(chalk.red('Error checking job status:'), error);
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Pretty print an object with syntax highlighting
function prettyPrint(obj: any, title: string, color: typeof chalk.cyan) {
  console.log(color.bold(`\n${title}:`));
  const json = JSON.stringify(obj, null, 2);
  
  // Highlight different parts of the JSON
  const highlighted = json
    .replace(/"([^"]+)":/g, (_, p1) => chalk.magenta(`"${p1}":`)) // Keys
    .replace(/: "([^"]+)"/g, (_, p1) => `: ${chalk.green(`"${p1}"`)}`); // String values
  
  console.log(highlighted);
  console.log();
}

// Run once or in watch mode
if (options.watch) {
  console.log(chalk.yellow('\nWatch mode enabled. Checking every 5 seconds. Press Ctrl+C to stop.\n'));
  
  // Run immediately
  checkJobs();
  
  // Then set interval
  setInterval(checkJobs, 5000);
} else {
  // Run once
  checkJobs();
}
