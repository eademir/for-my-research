"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const https = __importStar(require("https"));
const zip_js_1 = require("@zip.js/zip.js");
const data = fs.readFileSync('index.json', 'utf8');
const jsonData = JSON.parse(data);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('App started');
        for (let item of jsonData.data) {
            yield fetchFile(item.sha256_hash, item.file_type).catch(console.error);
        }
    });
}
function fetchFile(sha256_hash, file_type) {
    return __awaiter(this, void 0, void 0, function* () {
        const postData = `query=get_file&sha256_hash=${sha256_hash}`;
        const options = {
            hostname: 'mb-api.abuse.ch',
            port: 443,
            path: '/api/v1/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        };
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                if (res.statusCode !== 200)
                    return reject(new Error(`Failed to fetch file: ${res.statusCode}`));
                const chunks = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => __awaiter(this, void 0, void 0, function* () {
                    const buffer = Buffer.concat(chunks);
                    if (buffer.length === 0)
                        return reject(new Error('Downloaded file is empty'));
                    try {
                        const file = yield unzipFile(buffer, 'infected');
                        yield saveFile(file, sha256_hash, 'viruses', file_type);
                        resolve();
                    }
                    catch (err) {
                        if (err instanceof Error) {
                            fs.appendFileSync('errors.log', `${sha256_hash}: ${err.message}\n`);
                            reject(new Error(`Failed to save file: ${err.message}`));
                        }
                        else {
                            fs.appendFileSync('errors.log', `${sha256_hash}: Unknown error\n`);
                            reject(new Error('Failed to save file: Unknown error'));
                        }
                    }
                }));
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    });
}
function unzipFile(buffer, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const blob = new Blob([buffer]);
            const zipReader = new zip_js_1.ZipReader(new zip_js_1.BlobReader(blob), { password, checkPasswordOnly: false });
            const entries = yield zipReader.getEntries();
            const firstEntry = entries[0];
            // @ts-ignore
            const fileBlob = yield firstEntry.getData(new zip_js_1.BlobWriter());
            if (!fileBlob)
                throw new Error('Failed to retrieve file data from the zip archive');
            yield zipReader.close();
            return Buffer.from(yield fileBlob.arrayBuffer());
        }
        catch (err) {
            if (err instanceof Error) {
                console.error(`Failed to unzip file: ${err.message}`);
                throw err;
            }
            else {
                console.error('Failed to unzip file: Unknown error');
                throw new Error('Unknown error');
            }
        }
    });
}
function saveFile(file, sha256_hash, folder, file_type) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(folder))
            fs.mkdirSync(folder);
        const filePath = path.join(__dirname, folder, `${sha256_hash}.${file_type}`);
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, file, (err) => {
                if (err)
                    return reject(err);
                console.log(`File saved: ${filePath}`);
                resolve();
            });
        });
    });
}
main().then(() => console.log('App finished')).catch(console.error);
