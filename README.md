# 日语五十音 - Japanese 50-Sound Learning App

A modern, interactive web app to learn Japanese Hiragana with real human pronunciation powered by Qwen3 TTS.

## Features

- **Flashcard Learning** - Flip cards to reveal romaji pronunciation
- **Full Kana Grid** - View all 46 basic hiragana at a glance
- **Quiz Mode** - Test your knowledge with streak tracking
- **Qwen3 TTS** - Real human-like Japanese pronunciation
- **Modern UI** - Soft, rounded design with smooth animations

## Prerequisites

- Node.js (v14+)
- Dashscope API Key from [Alibaba Cloud](https://help.aliyun.com/zh/model-studio/get-api-key)

## Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/spotify2junkie/japanese-50-sound.git
   cd japanese-50-sound
   ```

2. **Start the server**
   ```bash
   node server.js
   ```

3. **Open in browser**
   ```
   http://localhost:3000
   ```

4. **Enter your API Key**
   - Paste your `DASHSCOPE_API_KEY` in the input field at the top
   - The key is saved in your browser's localStorage

## Alternative: Set API Key via Environment

```bash
DASHSCOPE_API_KEY=your-key-here node server.js
```

## How It Works

The app uses a local Node.js proxy server to call the Qwen3 TTS API (avoiding browser CORS restrictions). When you click on a kana:

1. Browser sends request to local server (`/api/tts`)
2. Server forwards request to Dashscope API
3. API returns audio URL
4. Browser plays the audio

## Tech Stack

- Vanilla HTML/CSS/JavaScript
- Node.js (proxy server)
- Qwen3-TTS-Flash API

## License

MIT
