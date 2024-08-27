import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import {BlobReader, BlobWriter, Entry, EntryDataOnprogressOptions, ZipReader} from '@zip.js/zip.js';

const data = fs.readFileSync('index.json', 'utf8');
const jsonData = JSON.parse(data);

export async function main() {
    console.log('App started');
    for (let item of jsonData.data) {
        await fetchFile(item.sha256_hash, item.file_type).catch(console.error);
    }
}

async function fetchFile(sha256_hash: string, file_type: string): Promise<void> {
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

    return new Promise<void>((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) return reject(new Error(`Failed to fetch file: ${res.statusCode}`));

            const chunks: Buffer[] = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                if (buffer.length === 0) return reject(new Error('Downloaded file is empty'));

                try {
                    const file = await unzipFile(buffer, 'infected');
                    await saveFile(file, sha256_hash, 'viruses', file_type);
                    resolve();
                } catch (err) {
                    if (err instanceof Error) {
                        fs.appendFileSync('errors.log', `${sha256_hash}: ${err.message}\n`);
                        reject(new Error(`Failed to save file: ${err.message}`));
                    } else {
                        fs.appendFileSync('errors.log', `${sha256_hash}: Unknown error\n`);
                        reject(new Error('Failed to save file: Unknown error'));
                    }
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function unzipFile(buffer: Buffer, password: string): Promise<Buffer> {
    try {
        const blob: Blob = new Blob([buffer]);
        const zipReader: ZipReader<any> = new ZipReader(new BlobReader(blob), { password, checkPasswordOnly: false });
        const entries: Entry[] = await zipReader.getEntries();

        const firstEntry: Entry = entries[0];

        // @ts-ignore
        const fileBlob: Blob = await firstEntry.getData(new BlobWriter());
        if (!fileBlob) throw new Error('Failed to retrieve file data from the zip archive');

        await zipReader.close();
        return Buffer.from(await fileBlob.arrayBuffer());
    } catch (err) {
        if (err instanceof Error) {
            console.error(`Failed to unzip file: ${err.message}`);
            throw err;
        } else {
            console.error('Failed to unzip file: Unknown error');
            throw new Error('Unknown error');
        }
    }
}

async function saveFile(file: Buffer, sha256_hash: string, folder: string, file_type: string): Promise<void> {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    const filePath = path.join(__dirname, folder, `${sha256_hash}.${file_type}`);
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(filePath, file, (err) => {
            if (err) return reject(err);
            console.log(`File saved: ${filePath}`);
            resolve();
        });
    });
}

main().then(() => console.log('App finished')).catch(console.error);