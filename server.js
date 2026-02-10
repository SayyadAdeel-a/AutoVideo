
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
app.use(express.json());

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
  
  const jobPath = path.join(TEMP_DIR, `${jobId}`);
  fs.ensureDirSync(jobPath);

  // 1. Create entry file and composition file
  const compFile = path.join(jobPath, 'Composition.tsx');
  const entryFile = path.join(jobPath, 'index.tsx');

  // Clean up code from possible backticks
  const cleanedCode = compositionCode.replace(/```tsx|```/g, '');

  await fs.writeFile(compFile, cleanedCode);
  await fs.writeFile(entryFile, `
    import { registerRoot } from 'remotion';
    import { Main } from './Composition';
    
    const RemotionRoot = () => {
      return (
        <registerRoot>
          <Main />
        </registerRoot>
      );
    };

    // Need to register it correctly for bundling
    import { Composition } from 'remotion';
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

  JOBS.set(jobId, { status: 'Rendering', progress: 0, topic });

  // Respond immediately with Job ID
  res.json({ jobId });

  // 2. Start Background Render
  (async () => {
    try {
      console.log(`[Job ${jobId}] Starting bundle...`);
      const bundleLocation = await bundle({
        entryPoint: entryFile,
        webpackOverride: (config) => config,
      });

      console.log(`[Job ${jobId}] Selecting composition...`);
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'Main',
        inputProps: props,
      });

      console.log(`[Job ${jobId}] Rendering media...`);
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
        status: 'Completed', 
        progress: 100, 
        downloadUrl: `http://localhost:3000/download/${jobId}` 
      });
      console.log(`[Job ${jobId}] Finished.`);
      
      // Cleanup temp files
      await fs.remove(jobPath);
    } catch (err) {
      console.error(`[Job ${jobId}] Error:`, err);
      JOBS.set(jobId, { status: 'Failed', error: err.message, progress: 0 });
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
  console.log(`AutoVideo Local Bridge running at http://localhost:${PORT}`);
});
