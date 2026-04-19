import React from 'react';
import { Play, Plus, List, Settings, Video, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAppStore, JobStatus } from '../../store';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_CONFIG: Record<JobStatus, { icon: React.FC<any>, color: string, label: string }> = {
  queued: { icon: List, color: 'text-brand-text-dim', label: 'Queued' },
  generating_script: { icon: Loader2, color: 'text-brand-accent', label: 'Scripting' },
  generating_images: { icon: Loader2, color: 'text-brand-accent', label: 'Images' },
  generating_voice: { icon: Loader2, color: 'text-brand-accent', label: 'Voice TTS' },
  animating: { icon: Loader2, color: 'text-brand-accent', label: 'Animating' },
  generating_subtitles: { icon: Loader2, color: 'text-brand-accent', label: 'Subtitles' },
  assembling: { icon: Loader2, color: 'text-brand-accent', label: 'Assembling' },
  done: { icon: CheckCircle2, color: 'text-green-400', label: 'Completed' },
  failed: { icon: AlertTriangle, color: 'text-red-400', label: 'Failed' },
};

export const Sidebar: React.FC = () => {
  const { jobs, activeTab, activeJobId, setTab } = useAppStore();

  return (
    <aside className="bg-brand-panel flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-brand-muted shrink-0 w-full">
        <nav className="flex flex-col gap-1">
          <button 
            onClick={() => setTab('new')}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'new' ? 'text-brand-accent font-medium' : 'text-brand-text hover:bg-brand-muted/50'}`}
          >
            <Plus size={16} /> New Video
          </button>
          <button 
            onClick={() => setTab('batch')}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'batch' ? 'text-brand-accent font-medium' : 'text-brand-text hover:bg-brand-muted/50'}`}
          >
            <List size={16} /> Batch Input
          </button>
          <button 
            onClick={() => setTab('settings')}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'settings' ? 'text-brand-accent font-medium' : 'text-brand-text hover:bg-brand-muted/50'}`}
          >
            <Settings size={16} /> Settings
          </button>
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <div className="text-[11px] font-bold text-brand-text-dim uppercase tracking-widest mb-1">
          Generation Queue
        </div>
        
        <div className="flex flex-col gap-1">
          <AnimatePresence>
            {jobs.map((job) => {
              const { icon: StatusIcon, color, label } = STATUS_CONFIG[job.status];
              const isRunning = job.status !== 'queued' && job.status !== 'done' && job.status !== 'failed';
              const isActive = activeTab === 'job_details' && activeJobId === job.id;

              return (
                <motion.button
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setTab('job_details', job.id)}
                  className={`w-full text-left p-3 rounded-md bg-brand-bg border transition-all ${isActive ? 'border-brand-accent shadow-[0_0_10px_rgba(0,229,255,0.15)]' : 'border-brand-muted hover:border-brand-text-dim'}`}
                >
                  <div className="flex flex-col">
                    <div className="font-mono text-[10px] text-brand-accent mb-1">{job.id}</div>
                    <div className="text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis mb-2">
                      {job.concept}
                    </div>
                    <div className="text-[11px] text-brand-text-dim flex items-center gap-1.5">
                      <span className={job.status === 'done' ? 'text-green-400' : isRunning ? 'text-brand-accent animate-pulse' : 'text-brand-text-dim'}>●</span>
                      {label}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </AnimatePresence>
          {jobs.length === 0 && (
            <div className="p-4 text-center text-xs text-brand-text-dim border border-dashed border-brand-muted rounded m-1 font-mono uppercase tracking-wider">
              No jobs in queue
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
