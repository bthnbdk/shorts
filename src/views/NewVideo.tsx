import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Play } from 'lucide-react';

export const NewVideo: React.FC = () => {
  const { addJob } = useAppStore();
  
  const [concept, setConcept] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [voice, setVoice] = useState('en_US-amy-medium');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;
    addJob(concept, style, voice);
    setConcept('');
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl">
      <form onSubmit={handleGenerate} className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-brand-text-dim">VIDEO CONCEPT</label>
          <textarea 
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Enter your video concept or script hook here..."
            className="bg-brand-panel border border-brand-muted rounded-lg p-4 text-brand-text text-[15px] resize-none h-[120px] outline-none focus:border-brand-accent transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-brand-text-dim">STYLE PRESET</label>
            <select 
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-brand-panel border border-brand-muted rounded-md p-2.5 text-brand-text text-sm outline-none focus:border-brand-accent appearance-none"
            >
              <option value="cinematic">Cinematic</option>
              <option value="documentary">Documentary</option>
              <option value="dramatic">Dramatic Noir</option>
              <option value="lofi">Lofi Chill</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-brand-text-dim">VOICE ACTOR</label>
            <select 
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full bg-brand-panel border border-brand-muted rounded-md p-2.5 text-brand-text text-sm outline-none focus:border-brand-accent appearance-none"
            >
              <option value="en_US-amy-medium">en_US-amy-medium</option>
              <option value="en_US-ryan-high">en_US-ryan-high</option>
              <option value="en_GB-oliver-med">en_GB-oliver-med</option>
            </select>
          </div>
        </div>

        <div>
          <button 
            type="button" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-mono text-brand-text-dim hover:text-brand-accent transition-colors py-2"
          >
            {showAdvanced ? '[-]' : '[+]'} ADVANCED CONFIG
          </button>
          
          {showAdvanced && (
            <div className="mt-2 p-4 border border-dashed border-brand-muted rounded-lg grid grid-cols-2 gap-4 bg-brand-bg">
               <div className="space-y-2">
                 <label className="text-[10px] text-brand-text-dim font-mono tracking-wider">SD_STEPS</label>
                 <input type="number" defaultValue="20" className="w-full bg-brand-panel border border-brand-muted rounded p-2 text-sm text-brand-text outline-none focus:border-brand-accent" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] text-brand-text-dim font-mono tracking-wider">GUIDANCE_SCALE</label>
                 <input type="number" defaultValue="7.5" step="0.1" className="w-full bg-brand-panel border border-brand-muted rounded p-2 text-sm text-brand-text outline-none focus:border-brand-accent" />
               </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            className="bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-bold py-3 px-6 rounded-md uppercase tracking-widest text-[13px] transition-colors border-none cursor-pointer"
          >
            Queue Generation
          </button>
        </div>
      </form>
    </div>
  );
};
