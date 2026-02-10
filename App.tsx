
import React, { useState, useEffect } from 'react';
import { NavPage, VideoProject } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CreateVideo from './components/CreateVideo';
import RenderStatus from './components/RenderStatus';
import { checkLocalServerStatus } from './services/localServerService';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavPage>(NavPage.Dashboard);
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [projects, setProjects] = useState<VideoProject[]>([
    {
      id: '1',
      topic: 'Future of AI',
      script: 'AI is changing the world...',
      duration: 30,
      style: 'Cinematic',
      status: 'Completed',
      progress: 100,
      createdAt: '2024-03-20',
      downloadUrl: '#'
    }
  ]);

  useEffect(() => {
    const checkStatus = async () => {
      const connected = await checkLocalServerStatus();
      setIsServerConnected(connected);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const addProject = (project: VideoProject) => {
    setProjects(prev => [project, ...prev]);
  };

  const updateProject = (id: string, updates: Partial<VideoProject>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <div className="flex h-screen bg-[#111122] text-white overflow-hidden">
      <Sidebar activePage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{currentPage}</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#232348] rounded-full text-sm">
              <div className={`w-2 h-2 rounded-full ${isServerConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[#9292c9]">
                Engine: {isServerConnected ? 'Connected (Local)' : 'Disconnected'}
              </span>
            </div>
          </header>

          {currentPage === NavPage.Dashboard && (
            <Dashboard projects={projects} />
          )}

          {currentPage === NavPage.Create && (
            <CreateVideo 
              isServerConnected={isServerConnected} 
              onProjectCreated={addProject}
              onProjectUpdate={updateProject}
            />
          )}

          {currentPage === NavPage.Editor && (
            <div className="bg-[#232348] rounded-xl p-12 text-center text-[#9292c9]">
              Visual Editor coming soon in v2.0
            </div>
          )}

          {currentPage === NavPage.Templates && (
            <RenderStatus projects={projects} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
