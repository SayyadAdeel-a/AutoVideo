
import { RenderJob } from '../types';

const BASE_URL = 'http://localhost:3000';

export const checkLocalServerStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/status`, { cache: 'no-cache' });
    return response.ok;
  } catch {
    return false;
  }
};

export const startLocalRender = async (compositionCode: string, topic: string, duration: number): Promise<string> => {
  const response = await fetch(`${BASE_URL}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      compositionCode, 
      topic,
      props: { topic, duration }
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to start render on local engine');
  }

  const data = await response.json();
  return data.jobId;
};

export const getJobStatus = async (jobId: string): Promise<RenderJob> => {
  const response = await fetch(`${BASE_URL}/job/${jobId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch job status');
  }
  return response.json();
};
