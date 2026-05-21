const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

// public folder ကို static host လုပ်ခြင်း
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ဆရာနဲ့ ကျောင်းသားကြား မျှဝေသုံးမည့် ကုဒ် အခြေခံ
let sharedCode = `<!DOCTYPE html>
<html>
<head>
  <style>
    h1 { color: crimson; text-align: center; font-family: sans-serif; }
    p { font-size: 18px; color: #333; text-align: center; }
  </style>
</head>
<body>

  <h1>မင်္ဂလာပါ...</h1>
  <p>ဆရာရော ကျောင်းသားရော တပြိုင်နက် ရေးပြီး တန်း Run နိုင်ပါပြီ။</p>

</body>
</html>`;

wss.on('connection', (ws) => {
    // တစ်ယောက်ယောက် ဝင်လာရင် လက်ရှိ ရေးထားသမျှ ကုဒ်ကို တန်းပို့ပေးခြင်း
    ws.send(JSON.stringify({ type: 'init', code: sharedCode }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'edit') {
                sharedCode = data.code;
                // ရေးလိုက်တဲ့ ကုဒ်ကို ကျန်တဲ့သူတွေဆီ real-time လှမ်းဖြန့်ပေးခြင်း
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'update', code: sharedCode }));
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Live HTML Running Server at http://localhost:${PORT}`);
});