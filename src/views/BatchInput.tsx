import React, { useState } from 'react';
import { useAppStore } from '../store';
import { ListPlus } from 'lucide-react';

export const BatchInput: React.FC = () => {
  const { addBatchJobs } = useAppStore();
  
  const [concepts, setConcepts] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [voice, setVoice] = useState('en_US-amy-medium');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const list = concepts.split('\n').filter(r => r.trim().length > 0);
    if (list.length === 0) return;
    addBatchJobs(list.map(c => c.trim()), style, voice);
    setConcepts('');
  };

  const parsedCount = concepts.split('\n').filter(r => r.trim().length > 0).length;

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl">
      <form onSubmit={handleGenerate} className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-brand-text-dim">CONCEPTS (LINE SEPARATED)</label>
          <textarea 
            value={concepts}
            onChange={(e) => setConcepts(e.target.value)}
            placeholder="Why your brain fabricates memories...&#10;Ants have been running a civilization for 100M years...&#10;The secret history of the color blue..."
            className="bg-brand-panel border border-brand-muted rounded-lg p-4 text-brand-text text-[13px] resize-none h-[240px] outline-none focus:border-brand-accent transition-colors font-mono leading-relaxed"
            required
          />
          <div className="text-right text-[11px] font-mono text-brand-text-dim uppercase tracking-wider">
            Detected: {parsedCount} concepts
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-brand-text-dim">GLOBAL STYLE</label>
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
            <label className="text-xs font-semibold text-brand-text-dim">GLOBAL VOICE ACTOR</label>
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

        <div className="pt-2">
          <button 
            type="submit"
            disabled={parsedCount === 0}
            className="w-full bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-bold py-3 px-6 rounded-md uppercase tracking-widest text-[13px] transition-colors border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ListPlus size={16} />
            Queue {parsedCount > 0 ? parsedCount : ''} Jobs
          </button>
        </div>
      </form>
    </div>
  );
};
