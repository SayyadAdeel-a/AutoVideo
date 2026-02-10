
# AutoVideo AI - AI Video Engine

AutoVideo AI uses Gemini to generate React Remotion code and leverages a local rendering bridge on your PC to convert that code into MP4 files.

## Local Setup (Prerequisites: Node.js 18+)

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file or set the environment variable in your shell:
   ```bash
   API_KEY=your_gemini_api_key
   ```

3. **Start the Local Engine Bridge:**
   The frontend communicates with a local server on port 3000 to handle the CPU-intensive video rendering.
   ```bash
   npm run server
   ```

4. **Start the Web App:**
   ```bash
   npm run dev
   ```

## Remote Deployment (Vercel)

The frontend can be deployed to Vercel. However, since Vercel lacks Chromium for Remotion rendering, you must use a tunnel to connect the cloud frontend to your local machine:

1. Deploy the frontend to Vercel and add `API_KEY` to Vercel Environment Variables.
2. Install [ngrok](https://ngrok.com/) or [Cloudflare Tunnel](https://developers.cloudflare.com/pages/how-to/tunnel/).
3. Expose your local server:
   ```bash
   ngrok http 3000
   ```
4. Update `services/localServerService.ts` to use your tunnel URL instead of `localhost:3000`.

## How it works
1. **Gemini** generates valid Remotion TSX code based on your topic and script.
2. The **Frontend** sends the code to your **Local PC**.
3. **Remotion** bundles the React code and renders it using Chromium + FFmpeg locally.
4. The frontend polls for progress and provides a download link once the MP4 is ready.
