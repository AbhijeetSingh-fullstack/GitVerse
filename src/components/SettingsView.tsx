import React from 'react';
import { Settings, LogOut, Monitor, Palette, Star, ShieldCheck, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface SettingsViewProps {
  biomeId: string;
  setBiomeId: (b: string) => void;
  onExitSimulation: () => void;
  user: any;
}

export default function SettingsView({ biomeId, setBiomeId, onExitSimulation, user }: SettingsViewProps) {
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
        
        {/* Essential Credentials */}
        <div className="bg-black/60 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full"></div>
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Essential Credentials</h3>
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-blue-900/50 border border-blue-500/30 overflow-hidden shadow-inner flex-shrink-0">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-400 font-bold text-2xl">?</div>
              )}
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h4 className="text-2xl font-extrabold text-white">{user?.user_metadata?.full_name || "Astronaut"}</h4>
                <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </div>
              </div>
              <p className="text-sm text-gray-400 font-mono">@{user?.user_metadata?.user_name || "unknown"}</p>
              {user?.email && (
                <p className="text-xs text-gray-500 mt-1">{user.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Account / Actions */}
        <div className="bg-black/60 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-white">Account Management</h3>
          </div>
          <p className="text-xs text-gray-400 mb-6">Log out of your current session. You will need to re-authenticate with GitHub to return to your planet.</p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-all"
            >
              Disconnect Data-Link
            </button>

            <button 
              onClick={() => window.open('/privacy', '_blank')}
              className="bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/50 text-gray-400 px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-all"
            >
              Privacy Policies
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
