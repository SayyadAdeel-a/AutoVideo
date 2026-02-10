
import React, { useState } from 'react';
import { generateRemotionCode } from '../services/geminiService';
import { startLocalRender, getJobStatus } from '../services/localServerService';
import { VideoProject } from '../types';
import { Sparkles, Loader2, Play } from 'lucide-react';

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

  const handleGenerate = async () => {
    if (!topic || !script) return;
    
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
      // 1. Call Gemini to get Remotion code
      const code = await generateRemotionCode(topic, script, style, duration);
      onProjectUpdate(projectId, { status: 'Rendering', progress: 10, compositionCode: code });

      // 2. Send to local server if connected
      if (isServerConnected) {
        const jobId = await startLocalRender(code, topic, duration);
        
        // Polling status
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
              clearInterval(poll);
              setIsGenerating(false);
            }
          } catch (err) {
            console.error(err);
            clearInterval(poll);
            setIsGenerating(false);
          }
        }, 2000);
      } else {
        onProjectUpdate(projectId, { status: 'Failed', progress: 0 });
        setIsGenerating(false);
        alert('Local Engine not found. Please run "npm run server" locally.');
      }
    } catch (error) {
      console.error(error);
      onProjectUpdate(projectId, { status: 'Failed' });
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-[#232348] p-8 rounded-3xl border border-white/5 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#9292c9]">Video Topic</label>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Benefits of Sustainable Energy"
            className="w-full bg-[#111122] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2b2bee] outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#9292c9]">Video Script</label>
          <textarea 
            rows={4}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Tell your story here..."
            className="w-full bg-[#111122] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2b2bee] outline-none resize-none"
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
              className="w-full bg-[#111122] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2b2bee] outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#9292c9]">Visual Style</label>
            <select 
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-[#111122] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2b2bee] outline-none appearance-none"
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
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          Render on My PC
        </button>
        
        {!isServerConnected && (
          <p className="text-xs text-center text-red-400">
            Local engine bridge disconnected. Run "node server.js" on your PC.
          </p>
        )}
      </div>

      <div className="bg-[#232348] p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#111122]/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8">
           <Play className="w-16 h-16 text-[#2b2bee] mb-4 opacity-50" />
           <p className="text-lg font-bold text-white mb-2">Live Preview Preview</p>
           <p className="text-sm text-[#9292c9]">Preview will appear here after generation</p>
        </div>
        <img src="https://picsum.photos/600/400" className="w-full rounded-2xl opacity-20" alt="" />
      </div>
    </div>
  );
};

export default CreateVideo;
