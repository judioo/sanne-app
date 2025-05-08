#!/usr/bin/env ts-node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var Redis = require("@upstash/redis").Redis;
var Command = require("commander").Command;
var config = require("dotenv").config;
var chalk = require("chalk");
var createInterface = require("readline").createInterface;
var join = require("path").join;
// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });
var url = process.env.KV_REST_API_URL;
var token = process.env.KV_REST_API_TOKEN;
if (!url || !token) {
    console.error(chalk.red('Error: KV_REST_API_URL and KV_REST_API_TOKEN must be set in .env.local'));
    process.exit(1);
}
var redis = new Redis({
    url: url,
    token: token,
});
var program = new Command();
program
    .name('redis-cli')
    .description('CLI tool for Redis cache operations')
    .version('0.1.0');
program
    .command('get <key>')
    .description('Get value for a key')
    .option('-f, --force', 'Skip pretty printing and output raw JSON')
    .action(function (key, options) { return __awaiter(_this, void 0, void 0, function () {
    var value, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, redis.get(key)];
            case 1:
                value = _a.sent();
                if (options.force) {
                    console.log(JSON.stringify(value));
                }
                else {
                    console.log(chalk.green(JSON.stringify(value, null, 2)));
                }
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error(chalk.red('Error:'), error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
program
    .command('search <pattern>')
    .description('Search for keys matching pattern')
    .option('-f, --force', 'Skip pretty printing and output raw keys')
    .action(function (pattern, options) { return __awaiter(_this, void 0, void 0, function () {
    var keys, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, redis.keys(pattern)];
            case 1:
                keys = _a.sent();
                if (keys.length === 0) {
                    if (!options.force) {
                        console.log(chalk.yellow('No keys found matching pattern'));
                    }
                    return [2 /*return*/];
                }
                if (options.force) {
                    keys.forEach(function (key) { return console.log(key); });
                }
                else {
                    console.log(chalk.green("Found ".concat(keys.length, " keys:")));
                    keys.forEach(function (key) { return console.log(chalk.blue(key)); });
                }
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error(chalk.red('Error:'), error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
program
    .command('delete <pattern>')
    .description('Delete keys matching pattern')
    .option('-f, --force', 'Skip confirmation')
    .action(function (pattern, options) { return __awaiter(_this, void 0, void 0, function () {
    var keys_1, rl_1, answer, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, redis.keys(pattern)];
            case 1:
                keys_1 = _a.sent();
                if (keys_1.length === 0) {
                    console.log(chalk.yellow('No keys found matching pattern'));
                    return [2 /*return*/];
                }
                console.log(chalk.green("Found ".concat(keys_1.length, " keys:")));
                keys_1.forEach(function (key) { return console.log(chalk.blue(key)); });
                if (!!options.force) return [3 /*break*/, 3];
                rl_1 = createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                return [4 /*yield*/, new Promise(function (resolve) {
                        rl_1.question(chalk.yellow("\nAre you sure you want to delete these ".concat(keys_1.length, " keys? [y/N] ")), function (ans) { return resolve(ans); });
                    })];
            case 2:
                answer = _a.sent();
                rl_1.close();
                if (answer.toLowerCase() !== 'y') {
                    console.log(chalk.yellow('Operation cancelled'));
                    return [2 /*return*/];
                }
                _a.label = 3;
            case 3: return [4 /*yield*/, Promise.all(keys_1.map(function (key) { return redis.del(key); }))];
            case 4:
                _a.sent();
                console.log(chalk.green("Successfully deleted ".concat(keys_1.length, " keys")));
                return [3 /*break*/, 6];
            case 5:
                error_3 = _a.sent();
                console.error(chalk.red('Error:'), error_3);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
program
    .command('scan <pattern>')
    .description('Scan for keys matching pattern with pagination')
    .option('-c, --count <number>', 'Number of keys per page', '10')
    .option('-f, --force', 'Skip confirmation between pages')
    .action(function (pattern, options) { return __awaiter(_this, void 0, void 0, function () {
    var cursor, scanPageSize, allKeys, _a, nextCursor, keys, currentPage, _loop_1, state_1, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, , 9]);
                cursor = '0';
                scanPageSize = parseInt(options.count || '10');
                allKeys = [];
                _b.label = 1;
            case 1: return [4 /*yield*/, redis.scan(cursor, {
                    match: pattern,
                    count: scanPageSize
                })];
            case 2:
                _a = _b.sent(), nextCursor = _a[0], keys = _a[1];
                cursor = nextCursor;
                allKeys.push.apply(allKeys, keys);
                _b.label = 3;
            case 3:
                if (cursor !== '0') return [3 /*break*/, 1];
                _b.label = 4;
            case 4:
                if (allKeys.length === 0) {
                    console.log(chalk.yellow('No keys found matching pattern'));
                    return [2 /*return*/];
                }
                console.log(chalk.green("Found ".concat(allKeys.length, " total keys matching pattern")));
                currentPage = 0;
                _loop_1 = function () {
                    var pageKeys, hasMorePages, rl_2, answer;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                pageKeys = allKeys.slice(currentPage * scanPageSize, (currentPage + 1) * scanPageSize);
                                console.log(chalk.green('\nCurrent page:'));
                                pageKeys.forEach(function (key) { return console.log(chalk.blue(key)); });
                                console.log(chalk.gray("\nShowing keys ".concat(currentPage * scanPageSize + 1, "-").concat(Math.min((currentPage + 1) * scanPageSize, allKeys.length), " of ").concat(allKeys.length)));
                                hasMorePages = (currentPage + 1) * scanPageSize < allKeys.length;
                                if (!(hasMorePages && !options.force)) return [3 /*break*/, 2];
                                rl_2 = createInterface({
                                    input: process.stdin,
                                    output: process.stdout
                                });
                                return [4 /*yield*/, new Promise(function (resolve) {
                                        rl_2.question(chalk.yellow('\nShow next page? [y/N] '), function (ans) { return resolve(ans); });
                                    })];
                            case 1:
                                answer = _c.sent();
                                rl_2.close();
                                if (answer.toLowerCase() !== 'y') {
                                    console.log(chalk.yellow('Scan operation stopped by user'));
                                    return [2 /*return*/, "break"];
                                }
                                _c.label = 2;
                            case 2:
                                currentPage++;
                                return [2 /*return*/];
                        }
                    });
                };
                _b.label = 5;
            case 5:
                if (!(currentPage * scanPageSize < allKeys.length)) return [3 /*break*/, 7];
                return [5 /*yield**/, _loop_1()];
            case 6:
                state_1 = _b.sent();
                if (state_1 === "break")
                    return [3 /*break*/, 7];
                return [3 /*break*/, 5];
            case 7:
                if (currentPage * scanPageSize >= allKeys.length) {
                    console.log(chalk.green('\nEnd of keys reached'));
                }
                return [3 /*break*/, 9];
            case 8:
                error_4 = _b.sent();
                console.error(chalk.red('Error:'), error_4);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
program.parse();
