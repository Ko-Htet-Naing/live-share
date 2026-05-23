const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const https = require('https');
const httpNative = require('http');
const Y = require('yjs');

const app = express();

// ✅ public ဖိုဒါထဲက HTML, CSS, JS ဖိုင်အားလုံးကို Auto-Serve လုပ်ခိုင်းလိုက်တာ ဖြစ်ပါတယ် ဆရာ
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let yDocs = new Map();

const SELF_PING_INTERVAL = 14 * 60 * 1000; 

setInterval(() => {
    const renderUrl = process.env.RENDER_EXTERNAL_URL;
    if (!renderUrl) return;

    const client = renderUrl.startsWith('https') ? https : httpNative;
    client.get(renderUrl, (res) => {}).on('error', (err) => {});
}, SELF_PING_INTERVAL);

const CLEANUP_INTERVAL = 45 * 60 * 1000; 

setInterval(() => {
    try {
        const totalRooms = yDocs.size;
        if (totalRooms > 0) {
            for (let [roomName, doc] of yDocs.entries()) {
                doc.destroy();
            }
            yDocs.clear();
        }
    } catch (error) {}
}, CLEANUP_INTERVAL);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is flying on port ${PORT}`);
});
