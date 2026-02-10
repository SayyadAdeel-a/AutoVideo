
export interface VideoProject {
  id: string;
  topic: string;
  script: string;
  duration: number;
  style: string;
  status: 'Draft' | 'Generating' | 'Rendering' | 'Completed' | 'Failed';
  progress: number;
  downloadUrl?: string;
  compositionCode?: string;
  createdAt: string;
}

export interface RenderJob {
  jobId: string;
  topic: string;
  status: string;
  progress: number;
  downloadUrl?: string;
  error?: string;
}

export enum NavPage {
  Dashboard = 'Dashboard',
  Create = 'Create',
  Editor = 'Editor',
  Templates = 'Templates',
  Assets = 'Assets',
  API = 'API',
  Settings = 'Settings'
}
