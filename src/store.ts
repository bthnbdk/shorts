import { create } from 'zustand';

export type JobStatus = 'queued' | 'generating_script' | 'generating_images' | 'generating_voice' | 'animating' | 'generating_subtitles' | 'assembling' | 'done' | 'failed';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

export interface Job {
  id: string;
  concept: string;
  style: string;
  voice: string;
  status: JobStatus;
  progress: number;
  createdAt: string;
  images: GeneratedImage[];
  videoUrl?: string; // final result
  script?: any;
  error?: string;
  elapsedMs: number;
}

export interface Settings {
  sdModel: string;
  sdSteps: number;
  sdGuidance: number;
  useXfade: boolean;
  subtitleStyle: string;
  musicVolume: number;
}

interface AppState {
  jobs: Job[];
  activeTab: 'new' | 'batch' | 'settings' | 'job_details';
  activeJobId: string | null;
  settings: Settings;
  
  setTab: (tab: 'new' | 'batch' | 'settings' | 'job_details', jobId?: string) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  addJob: (concept: string, style: string, voice: string) => void;
  addBatchJobs: (concepts: string[], style: string, voice: string) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  removeJob: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  jobs: [
    // Pre-seed some mock jobs for visual flair
    {
      id: '#LS-9482A',
      concept: "The hidden ocean inside Saturn's moon Enceladus",
      style: 'cinematic',
      voice: 'en_US-amy-medium',
      status: 'done',
      progress: 100,
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      images: [
        { id: 'img1', url: 'https://picsum.photos/seed/space1/512/768', prompt: 'Saturn looming massive backdrop space cinematic' },
        { id: 'img2', url: 'https://picsum.photos/seed/space2/512/768', prompt: 'Underwater bioluminescent sea under ice cinematic' },
        { id: 'img3', url: 'https://picsum.photos/seed/space3/512/768', prompt: 'Submarine drifting through glowing kelp underwater cinematic' },
        { id: 'img4', url: 'https://picsum.photos/seed/space4/512/768', prompt: 'Giant glowing jellyfish space anomaly cinematic' },
        { id: 'img5', url: 'https://picsum.photos/seed/space5/512/768', prompt: 'Abstract glowing light particles water cinematic' },
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      elapsedMs: 345000,
    }
  ],
  activeTab: 'new',
  activeJobId: null,
  
  settings: {
    sdModel: 'Lykon/dreamshaper-8',
    sdSteps: 20,
    sdGuidance: 7.5,
    useXfade: true,
    subtitleStyle: 'bold-yellow',
    musicVolume: 0.15,
  },

  setTab: (tab, jobId) => set({ activeTab: tab, ...(jobId ? { activeJobId: jobId } : {}) }),
  
  updateSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),
  
  addJob: async (concept, style, voice) => {
    const id = `#LS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    useAppStore.setState((state) => {
      const newJob: Job = {
        id,
        concept,
        style,
        voice,
        status: 'queued',
        progress: 0,
        createdAt: new Date().toISOString(),
        images: [],
        elapsedMs: 0,
      };
      return { jobs: [newJob, ...state.jobs], activeTab: 'job_details', activeJobId: id };
    });

    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, concept, style, voice }),
      });
    } catch (e) {
      console.error("Failed to start job on backend", e);
    }
  },

  addBatchJobs: async (concepts, style, voice) => {
    const newJobs = concepts.map((concept) => ({
      id: `#LS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      concept,
      style,
      voice,
      status: 'queued' as JobStatus,
      progress: 0,
      createdAt: new Date().toISOString(),
      images: [],
      elapsedMs: 0,
    }));
    
    useAppStore.setState((state) => ({ jobs: [...newJobs, ...state.jobs] }));

    for (const job of newJobs) {
      try {
        await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: job.id, concept: job.concept, style: job.style, voice: job.voice }),
        });
      } catch (e) {
        console.error("Failed to start batch job on backend", e);
      }
    }
  },

  updateJob: (id, updates) => set((state) => ({
    jobs: state.jobs.map((job) => job.id === id ? { ...job, ...updates } : job)
  })),

  removeJob: (id) => set((state) => ({
    jobs: state.jobs.filter((j) => j.id !== id),
    activeTab: state.activeJobId === id ? 'new' : state.activeTab,
    activeJobId: state.activeJobId === id ? null : state.activeJobId,
  })),
}));

// Mock simulation loop for jobs
let simulationInterval: number | null = null;
export const startSimulation = () => {
  if (simulationInterval) return;
  simulationInterval = window.setInterval(() => {
    const { jobs, updateJob } = useAppStore.getState();
    const activeJobs = jobs.filter(j => j.status !== 'done' && j.status !== 'failed');
    
    // Process at most one queued job at a time
    const runningJob = activeJobs.find(j => j.status !== 'queued');
    const nextQueued = activeJobs.find(j => j.status === 'queued');
    
    if (!runningJob && nextQueued) {
      updateJob(nextQueued.id, { status: 'generating_script' });
    }

    if (runningJob) {
      // Advance running job
      let { status, progress, elapsedMs, images } = runningJob;
      elapsedMs += 1000;
      
      const stages: JobStatus[] = [
        'generating_script', 'generating_images', 'generating_voice', 
        'animating', 'generating_subtitles', 'assembling', 'done'
      ];
      
      // Simple mockup logic
      progress += Math.random() * 5;
      
      if (status === 'generating_script' && progress > 15) {
        status = 'generating_images';
      } else if (status === 'generating_images') {
        if (progress > 30 && images.length === 0) {
          images = [...images, { id: Date.now().toString(), url: `https://picsum.photos/seed/${Math.random()}/512/768`, prompt: 'Scene 1...' }];
        }
        if (progress > 45 && images.length === 1) {
          images = [...images, { id: Date.now().toString(), url: `https://picsum.photos/seed/${Math.random()}/512/768`, prompt: 'Scene 2...' }];
        }
        if (progress > 60) {
          status = 'generating_voice';
        }
      } else if (status === 'generating_voice' && progress > 70) {
        status = 'animating';
      } else if (status === 'animating' && progress > 85) {
        status = 'generating_subtitles';
      } else if (status === 'generating_subtitles' && progress > 92) {
        status = 'assembling';
      } else if (status === 'assembling' && progress >= 100) {
        status = 'done';
        progress = 100;
        updateJob(runningJob.id, { 
          status, progress, elapsedMs, images,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
        });
        return;
      }
      
      updateJob(runningJob.id, { status, progress: Math.min(progress, 99.9), elapsedMs, images });
    }
    
  }, 1000);
};
