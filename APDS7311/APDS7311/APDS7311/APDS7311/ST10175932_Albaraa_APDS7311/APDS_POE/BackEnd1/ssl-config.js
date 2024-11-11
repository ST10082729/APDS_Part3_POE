import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSL configuration
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, '../certificates/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certificates/cert.pem')),
    secureOptions: ['TLSv1_2', 'TLSv1_3'],
    ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384',
};

export const createHttpsServer = (app) => {
    return https.createServer(sslOptions, app);
};
