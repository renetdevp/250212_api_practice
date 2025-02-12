require('dotenv').config();

const mongoose = require('mongoose');
const https = require('https');

const fs = require('fs');

const app = require('./app');

const PORT = process.env.PORT || 8000;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
//  in product environment, should use asynchronous function (not synchronous function)
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf-8');
const certificate = fs.readFileSync(process.env.CERTIFICATE_PATH, 'utf-8');

const httpsOption = {
    key: privateKey,
    cert: certificate,
};

const httpsServer = https.createServer(httpsOption, app);

app.listen(PORT, () => {
    console.log(`HTTP server open at ${(new Date()).toString()}`);
});

httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS server open at ${(new Date()).toString()}`);
});

process.on('exit', () => {
    mongoose.connection.close();
});