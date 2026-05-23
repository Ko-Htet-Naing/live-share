const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const https = require('https');
const httpNative = require('http');
const Y = require('yjs');

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let yDocs = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'edit') {
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'update',
                            code: data.code
                        }));
                    }
                });
            }
        } catch (err) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(message);
            }
        }
    });

    ws.on('close', () => {});
});

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
    console.log(`🚀 Live Runner Server with WebSocket & Yjs is flying on port ${PORT}`);
});
