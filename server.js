
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
app.use(express.json({ limit: '10mb' }));

const JOBS = new Map();
const RENDER_DIR = path.join(__dirname, 'renders');
const TEMP_DIR = path.join(__dirname, 'temp');

fs.ensureDirSync(RENDER_DIR);
fs.ensureDirSync(TEMP_DIR);

app.get('/status', (req, res) => {
  res.json({ status: 'online', engine: 'Remotion 4.x' });
});

app.post('/render', async (req, res) => {
  const { compositionCode, topic, props } = req.body;
  const jobId = Math.random().toString(36).substring(7);
  
  const jobPath = path.join(TEMP_DIR, jobId);
  fs.ensureDirSync(jobPath);

  const compFile = path.join(jobPath, 'Composition.tsx');
  const entryFile = path.join(jobPath, 'index.tsx');

  // Handle various potential output formats from Gemini
  const cleanedCode = compositionCode.includes('import') 
    ? compositionCode 
    : `import React from 'react';\nimport { AbsoluteFill } from 'remotion';\n\n${compositionCode}`;

  await fs.writeFile(compFile, cleanedCode);
  
  // Create a robust entry file that handles both named and default exports
  await fs.writeFile(entryFile, `
    import { registerRoot, Composition } from 'remotion';
    import * as CompNamespace from './Composition';
    
    const Main = CompNamespace.Main || CompNamespace.default;

    if (!Main) {
      throw new Error("Could not find a 'Main' component or a default export in the generated code.");
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

  (async () => {
    try {
      console.log(`[Job ${jobId}] Bundling...`);
      const bundleLocation = await bundle({
        entryPoint: entryFile,
        // Ensure the bundler can find React and Remotion from the root node_modules
        webpackOverride: (config) => config,
      });

      console.log(`[Job ${jobId}] Selecting composition...`);
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'Main',
        inputProps: props,
      });

      console.log(`[Job ${jobId}] Rendering to MP4...`);
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
      console.log(`[Job ${jobId}] Completed successfully.`);
      
      await fs.remove(jobPath);
    } catch (err) {
      console.error(`[Job ${jobId}] Render Error:`, err.message);
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
    res.status(404).send('Video file not found. It might have been deleted or render failed.');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('-------------------------------------------');
  console.log(`AutoVideo Engine Bridge is LIVE on port ${PORT}`);
  console.log(`Ensure you have FFmpeg installed on your system!`);
  console.log('-------------------------------------------');
});
