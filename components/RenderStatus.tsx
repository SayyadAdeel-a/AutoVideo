
import React from 'react';
import { VideoProject } from '../types';
import { Download, ExternalLink, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface RenderStatusProps {
  projects: VideoProject[];
}

const RenderStatus: React.FC<RenderStatusProps> = ({ projects }) => {
  return (
    <div className="bg-[#232348] rounded-3xl border border-white/5 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-black/20 text-[#9292c9] text-sm font-medium">
          <tr>
            <th className="px-6 py-4">Video Project</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Progress</th>
            <th className="px-6 py-4">Created</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {projects.map((p) => (
            <tr key={p.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-6 font-bold">{p.topic}</td>
              <td className="px-6 py-6">
                <div className="flex items-center gap-2">
                  {p.status === 'Completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  {p.status === 'Failed' && <XCircle className="w-4 h-4 text-red-500" />}
                  {(p.status === 'Rendering' || p.status === 'Generating') && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                  <span className={`text-sm px-2 py-0.5 rounded-full ${
                    p.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                    p.status === 'Failed' ? 'bg-red-500/10 text-red-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </td>
              <td className="px-6 py-6">
                <div className="w-32 bg-[#111122] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#2b2bee] h-full transition-all duration-500" 
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#9292c9] mt-1 block">{p.progress}%</span>
              </td>
              <td className="px-6 py-6 text-sm text-[#9292c9]">{p.createdAt}</td>
              <td className="px-6 py-6 text-right">
                {p.status === 'Completed' && p.downloadUrl ? (
                  <a 
                    href={p.downloadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#2b2bee] hover:text-blue-400"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                ) : (
                  <button disabled className="text-[#323267]"><Clock className="w-4 h-4" /></button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RenderStatus;
