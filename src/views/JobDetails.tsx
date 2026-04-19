import React, { useMemo } from 'react';
import { useAppStore, JobStatus } from '../store';
import { Download, Share2, TerminalSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const STAGES: { key: JobStatus, label: string }[] = [
  { key: 'generating_script', label: 'Script (Llama 3.2)' },
  { key: 'generating_images', label: 'Images (SD 1.5 + IP-Adapter)' },
  { key: 'generating_voice', label: 'Voice (Kokoro + RVC)' },
  { key: 'animating', label: 'Animate (FILM Interpolation)' },
  { key: 'generating_subtitles', label: 'Subtitles (Whisper)' },
  { key: 'assembling', label: 'Assemble (Librosa Beat Sync)' },
  { key: 'done', label: 'Complete' }
];

export const JobDetails: React.FC = () => {
  const { jobs, activeJobId } = useAppStore();
  
  const job = useMemo(() => jobs.find(j => j.id === activeJobId), [jobs, activeJobId]);

  if (!job) {
    return <div className="p-12 text-center text-brand-text-dim">Job not found or deleted.</div>;
  }

  const isRunning = job.status !== 'queued' && job.status !== 'done' && job.status !== 'failed';
  const stageIndex = STAGES.findIndex(s => s.key === job.status);

  // Formatting helper
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full overflow-hidden">
      
      {/* Main Column */}
      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto min-h-0">
        
        {/* Header */}
        <div className="border-b border-brand-muted pb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold font-mono text-brand-accent">{job.id}</h2>
            {job.status === 'done' && (
              <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase rounded border border-green-500/20">
                Completed
              </span>
            )}
            {job.status === 'failed' && (
              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase rounded border border-red-500/20">
                Failed
              </span>
            )}
          </div>
          <p className="text-[15px] font-medium text-brand-text leading-snug">{job.concept}</p>
          <div className="flex items-center gap-4 mt-4 text-[11px] font-mono text-brand-text-dim text-transform uppercase">
             <span>Style: <span className="text-white">{job.style}</span></span>
             <span>Voice: <span className="text-white">{job.voice}</span></span>
             <span>Elapsed: <span className="text-white">{formatTime(job.elapsedMs)}</span></span>
          </div>
        </div>

        {/* Live Progress View */}
        {isRunning && (
           <div className="bg-brand-panel border border-brand-muted rounded-lg p-5 flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <h3 className="text-[11px] font-bold uppercase tracking-widest text-brand-text-dim flex items-center gap-2">
                 Active Pipeline
               </h3>
               <span className="font-mono text-brand-accent text-sm">{job.progress.toFixed(1)}%</span>
             </div>

             <div className="flex flex-col gap-4 mt-2">
               {STAGES.slice(0, 6).map((stage, idx) => {
                 const isCompleted = job.status === 'done' || (stageIndex > idx);
                 const isCurrent = job.status === stage.key;
                 const isPending = stageIndex !== -1 && stageIndex < idx;

                 return (
                   <div key={stage.key} className={`flex items-center gap-4 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-mono text-[11px] shrink-0 ${
                       isCompleted ? 'border-brand-accent text-brand-accent shadow-[0_0_10px_rgba(0,229,255,0.2)]' : 
                       isCurrent ? 'border-brand-accent text-brand-accent shadow-[0_0_10px_rgba(0,229,255,0.2)]' : 
                       'border-brand-text-dim text-brand-text-dim'
                     }`}>
                       0{idx + 1}
                     </div>
                     <div className="flex flex-col">
                       <strong className={`text-[13px] font-medium leading-none mb-1 ${isCurrent || isCompleted ? 'text-white' : 'text-brand-text-dim'}`}>
                         {stage.label}
                       </strong>
                       {isCurrent && (
                         <div className="text-[11px] text-brand-text-dim font-mono">
                           In progress...
                         </div>
                       )}
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
        )}

        {/* Images Grid (Live or Done) */}
        {job.images.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="text-[11px] font-bold text-brand-text-dim uppercase tracking-widest">Generated Frames ({job.images.length})</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {job.images.map((img, i) => (
                <div 
                  key={img.id}
                  className="aspect-[9/16] bg-brand-panel rounded border border-brand-muted relative group overflow-hidden"
                >
                  <img src={img.url} alt="Generated frame" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-brand-bg/90 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-center justify-center text-center">
                     <p className="text-[10px] text-brand-text font-mono line-clamp-6 leading-relaxed">
                       {img.prompt || `Scene ${i+1} prompt...`}
                     </p>
                  </div>
                </div>
              ))}
              {isRunning && job.status === 'generating_images' && (
                 <div className="aspect-[9/16] bg-brand-panel rounded border border-dashed border-brand-muted flex flex-col items-center justify-center text-brand-text-dim gap-2">
                   <Loader2 size={16} className="animate-spin text-brand-accent" />
                 </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Preview & Metadata */}
      <div className="w-[320px] shrink-0 border-l border-brand-muted flex flex-col h-full overflow-y-auto">
        <div className="p-6 flex flex-col gap-5 items-center">
          <div className="w-full text-[11px] font-bold text-brand-text-dim uppercase tracking-widest text-left">
            Live Preview
          </div>

          <div className="w-[240px] h-[480px] bg-black border-[8px] border-[#222] rounded-[32px] relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] shrink-0">
            {job.status === 'done' && job.videoUrl ? (
              <video 
                src={job.videoUrl} 
                controls 
                className="w-full h-full object-cover"
                autoPlay 
                loop 
                muted
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#333] flex items-center justify-center text-center p-4 relative">
                 <div className="text-brand-text-dim font-mono text-[11px] uppercase tracking-widest">
                   {isRunning ? 'Rendering Video...' : 'Awaiting Job...'}
                 </div>
              </div>
            )}
          </div>

          <button className="w-full bg-brand-accent text-brand-bg font-bold py-3 px-6 rounded-md uppercase tracking-wider text-[13px] border-none cursor-pointer mt-2">
            {job.status === 'done' ? 'Download MP4' : 'Awaiting Render'}
          </button>

          {job.status === 'failed' && (
             <button 
                onClick={() => {
                   fetch(`/api/jobs/${job.id}/retry`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({stage: 'generating_script'}) })
                   // Real app would update store here after fetching to kick off pipeline again
                }}
                className="w-full bg-brand-panel border border-brand-muted hover:border-brand-accent text-brand-text font-bold py-2 px-6 rounded-md uppercase tracking-wider text-[11px] cursor-pointer mt-1 transition-colors"
                title="Restart from Script Generation"
             >
               Restart Pipeline
             </button>
          )}

          <div className="w-full mt-auto pt-4 border-t border-brand-muted flex justify-between font-mono text-[10px] text-brand-text-dim">
            <div>EST. RUNTIME: {formatTime(job.elapsedMs)}</div>
            <div>FPS: 24.0</div>
          </div>
        </div>
      </div>
    </div>
  );
};
