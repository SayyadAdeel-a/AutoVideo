
import React from 'react';
import { NavPage } from '../types';
import { 
  LayoutDashboard, 
  Plus, 
  Film, 
  Files, 
  Image as ImageIcon, 
  Code, 
  Settings, 
  HelpCircle 
} from 'lucide-react';

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const navItems = [
    { id: NavPage.Dashboard, icon: LayoutDashboard },
    { id: NavPage.Create, icon: Plus },
    { id: NavPage.Editor, icon: Film },
    { id: NavPage.Templates, icon: Files },
    { id: NavPage.Assets, icon: ImageIcon },
    { id: NavPage.API, icon: Code },
    { id: NavPage.Settings, icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#111122] border-r border-[#232348] flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-[#2b2bee] p-2 rounded-lg">
          <Code className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold">AutoVideo AI</h2>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activePage === item.id 
                ? 'bg-[#232348] text-white' 
                : 'text-[#9292c9] hover:bg-[#232348]/50 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.id}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-[#232348]">
        <button className="flex items-center gap-3 px-4 py-2 text-[#9292c9] hover:text-white transition-colors">
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm">Help and docs</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
