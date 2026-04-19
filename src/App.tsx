/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { NewVideo } from './views/NewVideo';
import { BatchInput } from './views/BatchInput';
import { Settings } from './views/Settings';
import { JobDetails } from './views/JobDetails';
import { useAppStore, startSimulation } from './store';

export default function App() {
  const { activeTab } = useAppStore();

  const [sysStatus, setSysStatus] = React.useState<any>(null);

  useEffect(() => {
    startSimulation();
    
    // Check system dependencies
    fetch('/api/check-dependencies')
      .then(r => r.json())
      .then(data => setSysStatus(data))
      .catch(e => console.error(e));
  }, []);

  return (
    <div className="grid grid-cols-[240px_1fr] h-screen w-full bg-brand-bg text-brand-text font-sans overflow-hidden grid-rows-[56px_1fr]">
      <header className="col-span-full bg-brand-bg border-b border-brand-muted flex items-center justify-between px-5 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          <strong className="text-[13px] font-bold tracking-widest uppercase">LocalShorts Studio</strong>
        </div>
        
        <div className="flex items-center gap-4">
           {sysStatus && sysStatus.ready ? (
             <div className="flex items-center gap-2 border border-green-500/20 rounded px-2 py-1 bg-green-500/10 text-green-400">
               <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
               <span className="font-mono text-[10px] uppercase tracking-widest">SYSTEM READY</span>
             </div>
           ) : (
             <div className="flex items-center gap-2 border border-yellow-500/20 rounded px-2 py-1 bg-yellow-500/10 text-yellow-400">
               <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></div>
               <span className="font-mono text-[10px] uppercase tracking-widest">CHECKING DEPS...</span>
             </div>
           )}
           <div className="flex items-center gap-2 border border-[#262626] rounded px-2 py-1 bg-[#121214]">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></div>
             <span className="font-mono text-[10px] text-brand-text-dim uppercase tracking-widest">Hardware: M4 16GB</span>
           </div>
           <div className="border border-[#262626] rounded px-2 py-1 bg-[#121214]">
             <span className="font-mono text-[10px] text-brand-text-dim uppercase tracking-widest">VRAM: 3.4/16.0GB</span>
           </div>
        </div>
      </header>

      <div className="h-full overflow-hidden border-r border-brand-muted">
        <Sidebar />
      </div>
      <main className="h-full overflow-hidden flex flex-col relative bg-brand-bg">
        <div className="absolute inset-0 overflow-y-auto">
          {activeTab === 'new' && <NewVideo />}
          {activeTab === 'batch' && <BatchInput />}
          {activeTab === 'settings' && <Settings />}
          {activeTab === 'job_details' && <JobDetails />}
        </div>
      </main>
    </div>
  );
}
