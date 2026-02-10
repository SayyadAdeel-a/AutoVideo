import React, { useState } from 'react';
import { generateRemotionCode } from '../services/geminiService';
import { startLocalRender, getJobStatus } from '../services/localServerService';
import { VideoProject } from '../types';
import { Sparkles, Loader2, Play, AlertCircle } from 'lucide-react';

interface CreateVideoProps {
  isServerConnected: boolean;
  onProjectCreated: (project: VideoProject) => void;
  onProjectUpdate: (id: string, updates: Partial<VideoProject>) => void;
}

const CreateVideo: React.FC<CreateVideoProps> = ({ isServerConnected, onProjectCreated, onProjectUpdate }) => {
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [duration, setDuration] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic || !script) {
      setError("Please fill in both the topic and the script.");
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    const projectId = Math.random().toString(36).substring(7);
    
    const newProject: VideoProject = {
      id: projectId,
      topic,
      script,
      duration,
      style,
      status: 'Generating',
      progress: 0,
      createdAt: new Date().toLocaleDateString()
    };
    
    onProjectCreated(newProject);

    try {
      // 1. Generate code via Gemini
      console.log("Generating code with Gemini...");
      const code = await generateRemotionCode(topic, script, style, duration);
      onProjectUpdate(projectId, { progress: 20, compositionCode: code });

      // 2. Start rendering on local engine
      if (!isServerConnected) {
        throw new Error("Local Engine bridge is disconnected. Please start server.js.");
      }

      console.log("Sending code to local render engine...");
      const jobId = await startLocalRender(code, topic, duration);
      onProjectUpdate(projectId, { status: 'Rendering', progress: 30 });

      // 3. Poll for progress
      const poll = setInterval(async () => {
        try {
          const status = await getJobStatus(jobId);
          onProjectUpdate(projectId, { 
            status: status.status as any, 
            progress: status.progress 
          });

          if (status.status === 'Completed') {
            onProjectUpdate(projectId, { downloadUrl: status.downloadUrl });
            clearInterval(poll);
            setIsGenerating(false);
          } else if (status.status === 'Failed') {
            console.error("Render failed on server:", status.error);
            onProjectUpdate(projectId, { status: 'Failed' });
            clearInterval(poll);
            setIsGenerating(false);
            setError(`Local Render Failed: ${status.error || 'Unknown error'}`);
          }
        } catch (err: any) {
          console.error("Error polling job status:", err);
          clearInterval(poll);
          setIsGenerating(false);
          onProjectUpdate(projectId, { status: 'Failed' });
          setError("Lost connection to local engine during rendering.");
        }
      }, 3000);

    } catch (err: any) {
      console.error("Generation/Render error:", err);
      onProjectUpdate(projectId, { status: 'Failed' });
      setError(err.message || "An unexpected error occurred.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-[#232348] p-8 rounded-3xl border border-white/5 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-start gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#9292c9]">Video Topic</label>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Benefits of Honey"
            className="w-full bg-[#111122] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2b2bee] outline-none text-white placeholder:text-[#45456b]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#9292c9]">Video Script</label>
          <textarea 
            rows={4}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Write the script for your video..."
            className="w-full bg-[#111122] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2b2bee] outline-none resize-none text-white placeholder:text-[#45456b]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#9292c9]">Duration (Seconds)</label>
            <input 
              type="number" 
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={5}
              max={60}
              className="w-full bg-[#111122] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2b2bee] outline-none text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#9292c9]">Visual Style</label>
            <select 
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-[#111122] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2b2bee] outline-none appearance-none text-white"
            >
              <option>Cinematic</option>
              <option>Vibrant</option>
              <option>Minimalist</option>
              <option>Cyberpunk</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !isServerConnected}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 ${
            isGenerating || !isServerConnected 
              ? 'bg-[#323267] text-[#9292c9] cursor-not-allowed' 
              : 'bg-[#2b2bee] text-white hover:bg-blue-600 active:scale-[0.98]'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Render on My PC</span>
            </>
          )}
        </button>
        
        {!isServerConnected && (
          <p className="text-xs text-center text-red-400 font-medium">
            Engine Offline: Start 'node server.js' locally to render.
          </p>
        )}
      </div>

      <div className="bg-[#232348] p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[#111122]/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 transition-opacity duration-500">
           <Play className="w-16 h-16 text-[#2b2bee] mb-4 opacity-50 group-hover:scale-110 transition-transform" />
           <p className="text-lg font-bold text-white mb-2">Renderer Preview</p>
           <p className="text-sm text-[#9292c9]">Video will be compiled and rendered on your local machine.</p>
        </div>
        <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover rounded-2xl opacity-20" alt="Hardware background" />
      </div>
    </div>
  );
};

export default CreateVideo;