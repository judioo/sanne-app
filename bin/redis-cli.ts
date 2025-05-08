#!/usr/bin/env ts-node

const { Redis } = require("@upstash/redis");
const { Command } = require("commander");
const { config } = require("dotenv");
const chalk = require("chalk");
const createInterface = require("readline").createInterface;
const join = require("path").join;

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

const url: string | undefined = process.env.KV_REST_API_URL;
const token: string | undefined = process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.error(chalk.red('Error: KV_REST_API_URL and KV_REST_API_TOKEN must be set in .env.local'));
  process.exit(1);
}

const redis = new Redis({
  url,
  token,
});

const program = new Command();

program
  .name('redis-cli')
  .description('CLI tool for Redis cache operations')
  .version('0.1.0');

program
  .command('get <key>')
  .description('Get value for a key')
  .option('-f, --force', 'Skip pretty printing and output raw JSON')
  .action(async (key: string, options: { force?: boolean }) => {
    try {
      const value = await redis.get(key);
      if (options.force) {
        console.log(JSON.stringify(value));
      } else {
        console.log(chalk.green(JSON.stringify(value, null, 2)));
      }
    } catch (error: any) {
      console.error(chalk.red('Error:'), error);
    }
  });

program
  .command('search <pattern>')
  .description('Search for keys matching pattern')
  .option('-f, --force', 'Skip pretty printing and output raw keys')
  .action(async (pattern: string, options: { force?: boolean }) => {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length === 0) {
        if (!options.force) {
          console.log(chalk.yellow('No keys found matching pattern'));
        }
        return;
      }
      if (options.force) {
        keys.forEach((key: string) => console.log(key));
      } else {
        console.log(chalk.green(`Found ${keys.length} keys:`));
        keys.forEach((key: string) => console.log(chalk.blue(key)));
      }
    } catch (error: any) {
      console.error(chalk.red('Error:'), error);
    }
  });

program
  .command('delete <pattern>')
  .description('Delete keys matching pattern')
  .option('-f, --force', 'Skip confirmation')
  .action(async (pattern: string, options: { force?: boolean }) => {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length === 0) {
        console.log(chalk.yellow('No keys found matching pattern'));
        return;
      }

      console.log(chalk.green(`Found ${keys.length} keys:`));
      keys.forEach((key: string) => console.log(chalk.blue(key)));

      if (!options.force) {
        const rl = createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const answer = await new Promise<string>(resolve => {
          rl.question(chalk.yellow(`\nAre you sure you want to delete these ${keys.length} keys? [y/N] `), (ans: string) => resolve(ans));
        });

        rl.close();

        if (answer.toLowerCase() !== 'y') {
          console.log(chalk.yellow('Operation cancelled'));
          return;
        }
      }

      await Promise.all(keys.map((key: string) => redis.del(key)));
      console.log(chalk.green(`Successfully deleted ${keys.length} keys`));
    } catch (error: any) {
      console.error(chalk.red('Error:'), error);
    }
  });

program
  .command('scan <pattern>')
  .description('Scan for keys matching pattern with pagination')
  .option('-c, --count <number>', 'Number of keys per page', '10')
  .option('-f, --force', 'Skip confirmation between pages')
  .action(async (pattern: string, options: { count?: string, force?: boolean }) => {
    try {
      let cursor = '0';
      const scanPageSize = parseInt(options.count || '10');
      const allKeys: string[] = [];
      
      // First pass: Collect all keys
      do {
        const [nextCursor, keys] = await redis.scan(cursor, {
          match: pattern,
          count: scanPageSize
        });
        cursor = nextCursor;
        allKeys.push(...keys);
      } while (cursor !== '0');

      if (allKeys.length === 0) {
        console.log(chalk.yellow('No keys found matching pattern'));
        return;
      }

      console.log(chalk.green(`Found ${allKeys.length} total keys matching pattern`));

      // Display keys in pages
      let currentPage = 0;
      
      while (currentPage * scanPageSize < allKeys.length) {
        const pageKeys = allKeys.slice(
          currentPage * scanPageSize, 
          (currentPage + 1) * scanPageSize
        );
        
        console.log(chalk.green('\nCurrent page:'));
        pageKeys.forEach((key: string) => console.log(chalk.blue(key)));
        console.log(chalk.gray(
          `\nShowing keys ${currentPage * scanPageSize + 1}-${
            Math.min((currentPage + 1) * scanPageSize, allKeys.length)
          } of ${allKeys.length}`
        ));

        const hasMorePages = (currentPage + 1) * scanPageSize < allKeys.length;
        if (hasMorePages && !options.force) {
          const rl = createInterface({
            input: process.stdin,
            output: process.stdout
          });

          const answer = await new Promise<string>(resolve => {
            rl.question(chalk.yellow('\nShow next page? [y/N] '), (ans: string) => resolve(ans));
          });

          rl.close();

          if (answer.toLowerCase() !== 'y') {
            console.log(chalk.yellow('Scan operation stopped by user'));
            break;
          }
        }

        currentPage++;
      }

      if (currentPage * scanPageSize >= allKeys.length) {
        console.log(chalk.green('\nEnd of keys reached'));
      }
    } catch (error: any) {
      console.error(chalk.red('Error:'), error);
    }
  });

program.parse();
