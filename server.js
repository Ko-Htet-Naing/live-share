const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const https = require('https');
const httpNative = require('http');
const Y = require('yjs');
const path = require('path'); // ✅ ဖိုင်လမ်းကြောင်း သတ်မှတ်ရန် မူရင်း Module

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let yDocs = new Map();

// ✅ ဆရာ့ URL ကို ခေါ်လိုက်တာနဲ့ index.html ဖိုင်ကို တိုက်ရိုက် ဆွဲပြမည့် အပိုင်း
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const SELF_PING_INTERVAL = 14 * 60 * 1000; 

setInterval(() => {
    const renderUrl = process.env.RENDER_EXTERNAL_URL;
    
    if (!renderUrl) {
        console.log('ℹ️ [Anti-Shutdown] Localhost တွင် စမ်းသပ်နေသဖြင့် Self-Ping ကို ခေတ္တကျော်ခွတ်ထားပါသည်။');
        return;
    }

    console.log('💓 [Anti-Shutdown] Self-Ping Active');
    const client = renderUrl.startsWith('https') ? https : httpNative;
    
    client.get(renderUrl, (res) => {
        console.log(`✅ [Anti-Shutdown] Ping Status: ${res.statusCode}`);
    }).on('error', (err) => {
        console.error('❌ [Anti-Shutdown Error]:', err.message);
    });
}, SELF_PING_INTERVAL);

const CLEANUP_INTERVAL = 45 * 60 * 1000; 

setInterval(() => {
    console.log('🛡️ [Render Monitor] Yjs Memory Cleaning Check');
    try {
        const totalRooms = yDocs.size;
        if (totalRooms > 0) {
            for (let [roomName, doc] of yDocs.entries()) {
                doc.destroy();
            }
            yDocs.clear();
            console.log(`🧹 [Render Success] Flushed ${totalRooms} Yjs Rooms from RAM.`);
        } else {
            console.log('✨ [Render Info] Yjs Server is clear.');
        }
    } catch (error) {
        console.error('❌ [Cleanup Error]:', error);
    }
}, CLEANUP_INTERVAL);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Live Runner Server with Yjs is flying on port ${PORT}`);
});