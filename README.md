# AutoVideo AI

An AI-powered video generation engine that converts text prompts into MP4 videos. AutoVideo AI uses Gemini to generate React Remotion code and leverages a local rendering bridge to turn that code into production-ready video files.

## How It Works

1. **AI Code Generation** — Gemini generates valid Remotion TSX code based on your topic and script
2. **Local Rendering** — Frontend sends the code to your local PC running the engine bridge
3. **Video Production** — Remotion bundles the React code and renders it using Chromium + FFmpeg
4. **Download Ready** — Frontend polls for progress and provides an MP4 download link when complete

## Features

- **AI-Powered Video Creation** — Generate videos from text prompts using Gemini
- **React-Based Video Rendering** — Leverages Remotion for programmatic video generation
- **Local + Cloud Hybrid** — Deploy frontend to Vercel while rendering happens on your machine
- **Real-Time Progress Tracking** — Poll rendering status from the web interface
- **Flexible Deployment** — Run fully local or use tunneling for remote access

## Tech Stack

- **AI:** Google Gemini API
- **Video Engine:** Remotion (React-based video rendering)
- **Frontend:** React + Vite
- **Backend Bridge:** Node.js Express server
- **Rendering:** Chromium + FFmpeg
- **Deployment:** Vercel (frontend) + Local server (rendering)

## Prerequisites

- Node.js 18+
- Gemini API key
- FFmpeg installed locally
- Chromium (installed automatically by Remotion)

## Local Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file:

```env
API_KEY=your_gemini_api_key
```

### 3. Start the Local Engine Bridge

The frontend communicates with a local server on port 3000 to handle CPU-intensive video rendering.

```bash
npm run server
```

### 4. Start the Web App

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or your configured Vite port).

## Remote Deployment (Vercel + Tunnel)

The frontend can be deployed to Vercel, but since Vercel doesn't support Chromium for Remotion rendering, you need to tunnel requests to your local machine.

### 1. Deploy Frontend to Vercel

```bash
vercel deploy
```

Add `API_KEY` to Vercel Environment Variables in your project settings.

### 2. Install a Tunnel Tool

Choose one:
- **ngrok:** `npm install -g ngrok`
- **Cloudflare Tunnel:** [Installation guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)

### 3. Expose Your Local Server

Using ngrok:

```bash
ngrok http 3000
```

Using Cloudflare Tunnel:

```bash
cloudflared tunnel --url http://localhost:3000
```

### 4. Update the Frontend Configuration

In `services/localServerService.ts`, replace `localhost:3000` with your tunnel URL:

```typescript
const SERVER_URL = 'https://your-tunnel-url.ngrok-free.app';
```

Redeploy to Vercel.

## Project Structure

```
autovideo-ai/
├── src/
│   ├── components/       # UI components
│   ├── services/         # API and local server communication
│   └── remotion/         # Remotion video templates
├── server/
│   ├── index.js          # Express server for rendering bridge
│   └── render.js         # Remotion rendering logic
├── public/               # Static assets
└── package.json
```

## Usage

1. Enter your video topic/prompt
2. Optionally provide a script or let Gemini generate one
3. Click **Generate Video**
4. Wait for rendering to complete (progress tracked in UI)
5. Download your MP4 file

## Limitations

- **Rendering requires local machine** — Vercel/serverless platforms can't run Chromium
- **CPU intensive** — Video rendering can take 30s–5min depending on complexity
- **Tunnel required for remote access** — Adds latency to the rendering pipeline

## Roadmap

- [ ] Support for custom Remotion templates
- [ ] Background music and voiceover integration
- [ ] Queue system for batch video generation
- [ ] Docker container for easier deployment
- [ ] Cloud rendering option (AWS Lambda + Chromium layer)

## Troubleshooting

**"Connection refused" error:**
- Ensure the local server is running (`npm run server`)
- Check that port 3000 isn't blocked by firewall
- Verify tunnel URL is correct in `localServerService.ts`

**Rendering fails:**
- Check FFmpeg is installed: `ffmpeg -version`
- Ensure sufficient disk space for video output
- Review server logs for Remotion errors

## License

MIT License

---

Built by [Sayyad Adeel](https://github.com/SayyadAdeel-a) | AI-assisted video generation
```

---

Want me to adjust anything? Add screenshots section, expand troubleshooting, or change the architecture explanation?
