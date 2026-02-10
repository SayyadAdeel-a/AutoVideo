import express from 'express';
import cors from 'cors';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const JOBS = new Map();
const RENDER_DIR = path.join(__dirname, 'renders');
const TEMP_DIR = path.join(__dirname, 'temp');

fs.ensureDirSync(RENDER_DIR);
fs.ensureDirSync(TEMP_DIR);

app.get('/status', (req, res) => {
  res.json({ status: 'online', engine: 'Remotion 4.x', uptime: process.uptime() });
});

app.post('/render', async (req, res) => {
  const { compositionCode, topic, props } = req.body;
  
  if (!compositionCode) {
    return res.status(400).json({ error: 'Missing compositionCode' });
  }

  const jobId = Math.random().toString(36).substring(7);
  const jobPath = path.join(TEMP_DIR, jobId);
  fs.ensureDirSync(jobPath);

  const compFile = path.join(jobPath, 'Composition.tsx');
  const entryFile = path.join(jobPath, 'index.tsx');

  // Ensure code has React import if missing
  let finalCode = compositionCode;
  if (!finalCode.includes("import React")) {
    finalCode = `import React from 'react';\n${finalCode}`;
  }

  await fs.writeFile(compFile, finalCode);
  
  // Entry point handles dynamic registration
  await fs.writeFile(entryFile, `
    import { registerRoot, Composition } from 'remotion';
    import * as CompNamespace from './Composition';
    
    const Main = CompNamespace.Main || CompNamespace.default;

    if (!Main) {
      console.error("No Main component found in generated code.");
    }

    const MyRoot = () => {
      return (
        <>
          <Composition
            id="Main"
            component={Main}
            durationInFrames={${(props.duration || 15) * 30}}
            fps={30}
            width={1280}
            height={720}
            defaultProps={${JSON.stringify(props)}}
          />
        </>
      );
    };

    registerRoot(MyRoot);
  `);

  JOBS.set(jobId, { status: 'Rendering', progress: 0, topic, createdAt: new Date().toISOString() });
  res.json({ jobId });

  // Background process
  (async () => {
    try {
      console.log(`[${jobId}] Starting build...`);
      const bundleLocation = await bundle({
        entryPoint: entryFile,
      });

      console.log(`[${jobId}] Selecting composition 'Main'...`);
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'Main',
        inputProps: props,
      });

      console.log(`[${jobId}] Rendering media...`);
      const outputLocation = path.join(RENDER_DIR, `${jobId}.mp4`);
      
      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation,
        onProgress: ({ progress }) => {
          JOBS.set(jobId, { ...JOBS.get(jobId), progress: Math.floor(progress * 100) });
        },
      });

      JOBS.set(jobId, { 
        ...JOBS.get(jobId),
        status: 'Completed', 
        progress: 100, 
        downloadUrl: `http://localhost:3000/download/${jobId}` 
      });
      console.log(`[${jobId}] SUCCESS: Video rendered to ${outputLocation}`);
      
      await fs.remove(jobPath);
    } catch (err) {
      console.error(`[${jobId}] FATAL RENDER ERROR:`, err.message);
      JOBS.set(jobId, { 
        ...JOBS.get(jobId), 
        status: 'Failed', 
        error: err.message, 
        progress: 0 
      });
    }
  })();
});

app.get('/job/:id', (req, res) => {
  const job = JOBS.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

app.get('/download/:id', (req, res) => {
  const filePath = path.join(RENDER_DIR, `${req.params.id}.mp4`);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`AutoVideo Local Bridge Active: http://localhost:${PORT}`);
});