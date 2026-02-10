
import React from 'react';
import { VideoProject } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  projects: VideoProject[];
}

const data = [
  { name: 'Day 1', calls: 400 },
  { name: 'Day 5', calls: 300 },
  { name: 'Day 10', calls: 600 },
  { name: 'Day 15', calls: 800 },
  { name: 'Day 20', calls: 500 },
  { name: 'Day 25', calls: 900 },
  { name: 'Day 30', calls: 1234 },
];

const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Videos Generated', value: '1,234', change: '+12%', color: '#0bda68' },
          { label: 'API Usage', value: '5,678', change: '+8%', color: '#0bda68' },
          { label: 'Credits Remaining', value: '9,012', change: '+5%', color: '#0bda68' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#232348] p-6 rounded-2xl border border-white/5">
            <p className="text-[#9292c9] font-medium mb-1">{stat.label}</p>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm font-bold" style={{ color: stat.color }}>{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#232348] p-6 rounded-2xl border border-white/5 h-80">
        <h3 className="text-lg font-bold mb-6 text-white">API Usage Over Time</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2b2bee" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2b2bee" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ backgroundColor: '#111122', border: 'none', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="calls" stroke="#2b2bee" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-6">Recent Projects</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="group bg-[#232348] rounded-2xl overflow-hidden border border-white/5 hover:border-[#2b2bee] transition-all">
              <div className="aspect-video bg-[#111122] relative flex items-center justify-center overflow-hidden">
                <img src={`https://picsum.photos/seed/${project.id}/400/225`} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-xs">
                  {project.status}
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-white mb-1">{project.topic}</h4>
                <p className="text-sm text-[#9292c9]">{project.createdAt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
