const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || '';

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // TTS Proxy endpoint
    if (req.url === '/api/tts' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { text, apiKey } = JSON.parse(body);
                const key = apiKey || DASHSCOPE_API_KEY;

                if (!key) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No API key provided' }));
                    return;
                }

                const postData = JSON.stringify({
                    model: 'qwen3-tts-flash',
                    input: {
                        text: text,
                        voice: 'Cherry',
                        language_type: 'Japanese'
                    }
                });

                console.log('Request body:', postData);

                const options = {
                    hostname: 'dashscope.aliyuncs.com',
                    port: 443,
                    path: '/api/v1/services/aigc/multimodal-generation/generation',
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json',
                        'X-DashScope-SSE': 'enable',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                };

                const proxyReq = https.request(options, (proxyRes) => {
                    let data = '';
                    proxyRes.on('data', chunk => data += chunk);
                    proxyRes.on('end', () => {
                        console.log('Raw SSE Response:', data.substring(0, 1000));

                        // Parse SSE format: find lines starting with "data:"
                        const lines = data.split('\n');
                        let lastJson = null;

                        for (const line of lines) {
                            if (line.startsWith('data:')) {
                                try {
                                    const jsonStr = line.substring(5).trim();
                                    if (jsonStr) {
                                        lastJson = JSON.parse(jsonStr);
                                    }
                                } catch (e) {
                                    // Skip invalid JSON lines
                                }
                            }
                        }

                        if (lastJson) {
                            console.log('Parsed JSON:', JSON.stringify(lastJson).substring(0, 500));
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(lastJson));
                        } else {
                            console.log('Failed to parse SSE');
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Failed to parse response', raw: data.substring(0, 300) }));
                        }
                    });
                });

                proxyReq.on('error', (e) => {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: e.message }));
                });

                proxyReq.write(postData);
                proxyReq.end();

            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

    // Static file serving
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🎌 五十音学习服务器已启动!`);
    console.log(`📍 访问地址: http://localhost:${PORT}`);
    console.log(`\n💡 提示: 在页面中输入 API Key 或设置环境变量 DASHSCOPE_API_KEY`);
    console.log(`   例如: DASHSCOPE_API_KEY=your-key node server.js\n`);
});
