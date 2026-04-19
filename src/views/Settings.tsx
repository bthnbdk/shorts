import React from 'react';
import { useAppStore } from '../store';
import { Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useAppStore();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate writing to config.yaml
    alert('Settings saved to config.yaml');
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl">
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        
        {/* Model Settings */}
        <section className="flex flex-col gap-4 bg-brand-panel p-6 rounded-lg border border-brand-muted">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#a1a1aa] border-b border-[#262626] pb-2 mb-2">Stable Diffusion Config</h3>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-brand-text-dim">SD_MODEL (HUGGINGFACE ID)</label>
            <input 
              type="text"
              value={settings.sdModel}
              onChange={(e) => updateSettings({ sdModel: e.target.value })}
              className="w-full bg-brand-bg border border-brand-muted rounded-md p-2.5 text-brand-text font-mono text-sm focus:border-brand-accent focus:outline-none transition-colors"
            />
            <p className="text-[10px] text-brand-text-dim">Recommended: Lykon/dreamshaper-8 or SG161222/Realistic_Vision_V5.1_noVAE</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-brand-text-dim">SD_STEPS</label>
              <input 
                type="number"
                value={settings.sdSteps}
                onChange={(e) => updateSettings({ sdSteps: Number(e.target.value) })}
                className="w-full bg-brand-bg border border-brand-muted rounded-md p-2.5 text-brand-text font-mono text-sm focus:border-brand-accent focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-brand-text-dim">SD_GUIDANCE</label>
              <input 
                type="number"
                step="0.1"
                value={settings.sdGuidance}
                onChange={(e) => updateSettings({ sdGuidance: Number(e.target.value) })}
                className="w-full bg-brand-bg border border-brand-muted rounded-md p-2.5 text-brand-text font-mono text-sm focus:border-brand-accent focus:outline-none transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Video Assembly Settings */}
        <section className="flex flex-col gap-4 bg-brand-panel p-6 rounded-lg border border-brand-muted">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#a1a1aa] border-b border-[#262626] pb-2 mb-2">FFmpeg Assembly Config</h3>
          
          <div className="flex items-center gap-3">
            <input 
              type="checkbox"
              id="useXfade"
              checked={settings.useXfade}
              onChange={(e) => updateSettings({ useXfade: e.target.checked })}
              className="w-4 h-4 accent-brand-accent"
            />
            <label htmlFor="useXfade" className="text-xs font-semibold text-brand-text-dim cursor-pointer">USE_XFADE (CINEMATIC CROSSFADE TRANSITIONS)</label>
          </div>

          <div className="flex flex-col gap-2 mt-2">
             <label className="text-xs font-semibold text-brand-text-dim">SUBTITLE_STYLE</label>
              <select 
                value={settings.subtitleStyle}
                onChange={(e) => updateSettings({ subtitleStyle: e.target.value })}
                className="w-full bg-brand-bg border border-brand-muted rounded-md p-2.5 text-brand-text text-sm focus:border-brand-accent focus:outline-none appearance-none transition-colors"
              >
                <option value="bold-yellow">Bold Yellow Karaōke (+18% CTR)</option>
                <option value="clean-white">Clean White (Documentary)</option>
                <option value="neon-cyan">Neon Cyan (Hacker)</option>
              </select>
          </div>
          
           <div className="flex flex-col gap-2 mt-2">
             <label className="text-xs font-semibold text-brand-text-dim">MUSIC_VOLUME</label>
              <input 
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })}
                className="w-full accent-brand-accent"
              />
              <div className="text-[10px] text-brand-text-dim text-right font-mono">{(settings.musicVolume * 100).toFixed(0)}%</div>
          </div>

        </section>

        <section className="flex flex-col gap-4 bg-brand-panel p-6 rounded-lg border border-brand-muted mt-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#a1a1aa] border-b border-[#262626] pb-2 mb-2">Pipeline Engine Features</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox"
                id="useIpAdapter"
                defaultChecked={true}
                className="w-4 h-4 accent-brand-accent"
              />
              <label htmlFor="useIpAdapter" className="text-xs font-semibold text-brand-text-dim cursor-pointer">IP_ADAPTER (Visual Consistency)</label>
            </div>
            
            <div className="flex items-center gap-3">
              <input 
                type="checkbox"
                id="useFilm"
                defaultChecked={true}
                className="w-4 h-4 accent-brand-accent"
              />
              <label htmlFor="useFilm" className="text-xs font-semibold text-brand-text-dim cursor-pointer">USE_FILM (Frame Interpolation)</label>
            </div>
            
            <div className="flex items-center gap-3">
              <input 
                type="checkbox"
                id="useRvc"
                defaultChecked={true}
                className="w-4 h-4 accent-brand-accent"
              />
              <label htmlFor="useRvc" className="text-xs font-semibold text-brand-text-dim cursor-pointer">USE_RVC (Voice Cloning)</label>
            </div>
            
            <div className="flex items-center gap-3">
              <input 
                type="checkbox"
                id="beatSync"
                defaultChecked={true}
                className="w-4 h-4 accent-brand-accent"
              />
              <label htmlFor="beatSync" className="text-xs font-semibold text-brand-text-dim cursor-pointer">BEAT_SYNC (Librosa BPM Match)</label>
            </div>
          </div>
        </section>

        <div className="pt-2">
          <button 
            type="submit"
            className="w-full bg-brand-bg border border-brand-text text-brand-text hover:bg-brand-text font-bold py-3 px-6 rounded-md uppercase tracking-widest text-[13px] hover:text-black transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Save size={16} />
            Save to config.yaml
          </button>
        </div>
      </form>
    </div>
  );
};
