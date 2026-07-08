import React from 'react';
import { Settings, LogOut, Monitor, Palette } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface SettingsViewProps {
  biomeId: string;
  setBiomeId: (b: string) => void;
  onExitSimulation: () => void;
}

export default function SettingsView({ biomeId, setBiomeId, onExitSimulation }: SettingsViewProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex-1 flex flex-col pointer-events-auto px-10 py-8 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center border border-gray-500/30">
          <Settings className="w-6 h-6 text-gray-400" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-white">System Settings</h2>
          <p className="text-sm text-gray-400">Configure your planetary visualization and account preferences.</p>
        </div>
      </div>

      <div className="max-w-3xl space-y-8">
        
        {/* Biome Selection */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-bold text-white">Planetary Biome</h3>
          </div>
          <p className="text-xs text-gray-400 mb-6">Select the atmospheric and geological theme for your system. This immediately updates the entire rendering engine.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['mars', 'cyberpunk', 'lunar'].map((b) => (
              <button 
                key={b}
                onClick={() => setBiomeId(b)}
                className={`relative overflow-hidden rounded-xl p-4 transition-all border ${biomeId === b ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white uppercase tracking-wider text-sm">{b}</span>
                  {biomeId === b && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]"></div>}
                </div>
                <div className="h-16 rounded-lg w-full overflow-hidden flex shadow-inner">
                  {/* Miniature biome previews */}
                  {b === 'mars' && <div className="w-full h-full bg-gradient-to-br from-orange-800 to-orange-500"></div>}
                  {b === 'cyberpunk' && <div className="w-full h-full bg-gradient-to-br from-purple-900 to-cyan-500"></div>}
                  {b === 'lunar' && <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-700"></div>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Account / Actions */}
        <div className="bg-black/60 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-white">Account Management</h3>
          </div>
          <p className="text-xs text-gray-400 mb-6">Log out of your current session. You will need to re-authenticate with GitHub to return to your planet.</p>
          
          <button 
            onClick={handleLogout}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-all"
          >
            Disconnect Data-Link
          </button>
        </div>

      </div>
    </div>
  );
}
