
import React from 'react';
import { VideoProject } from '../types';
import { Download, Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface RenderStatusProps {
  projects: VideoProject[];
}

const RenderStatus: React.FC<RenderStatusProps> = ({ projects }) => {
  return (
    <div className="bg-[#232348] rounded-3xl border border-white/5 overflow-hidden">
      <table className="w-full text-left border-collapse">
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
          {projects.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-[#9292c9]">
                No projects found. Go to "Create" to start rendering!
              </td>
            </tr>
          ) : (
            projects.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-6">
                  <div className="font-bold text-white">{p.topic}</div>
                  <div className="text-[10px] text-[#9292c9] mt-1 max-w-xs truncate">{p.script}</div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {p.status === 'Completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {p.status === 'Failed' && <XCircle className="w-4 h-4 text-red-500" />}
                      {(p.status === 'Rendering' || p.status === 'Generating') && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                      <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${
                        p.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                        p.status === 'Failed' ? 'bg-red-500/10 text-red-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    {p.status === 'Failed' && (
                      <div className="flex items-center gap-1 text-[10px] text-red-400 mt-1 max-w-[150px]">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate" title="Check your local server logs for details">Render error</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="w-32 bg-[#111122] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${p.status === 'Failed' ? 'bg-red-900' : 'bg-[#2b2bee]'}`} 
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#9292c9] mt-1 block font-mono">{p.progress}%</span>
                </td>
                <td className="px-6 py-6 text-sm text-[#9292c9] whitespace-nowrap">{p.createdAt}</td>
                <td className="px-6 py-6 text-right">
                  {p.status === 'Completed' && p.downloadUrl ? (
                    <a 
                      href={p.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#2b2bee] px-4 py-2 rounded-lg text-sm font-bold text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/40"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  ) : (
                    <button disabled className="text-[#323267] cursor-not-allowed">
                      <Clock className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RenderStatus;
