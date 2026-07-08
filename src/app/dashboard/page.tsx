"use client";

import { Canvas } from "@react-three/fiber";
import Planet from "@/components/Planet";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { fetchGitHubStats, GitHubStats } from "@/utils/github";
import { Globe, Trophy, BarChart3, Settings, Rocket, Search } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulationMode, setSimulationMode] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);

      if (session?.user) {
        const username = session.user.user_metadata?.user_name;
        const providerToken = session.provider_token; 
        if (username) {
          const githubData = await fetchGitHubStats(username, providerToken);
          setStats(githubData);
        }
      }
      setLoading(false);
    };
    initData();
  }, [supabase.auth]);

  if (loading) {
    return <div className="w-full h-screen bg-[#050101] text-white flex items-center justify-center">Establishing Connection...</div>;
  }

  const primaryRepo = stats?.topRepos?.[0];
  const commits = stats?.commits || 0;
  const reposCount = stats?.repos || 0;
  
  // Calculate level based on commits (10,000 max for UI)
  const maxXP = 10000;
  const currentXP = Math.min(commits, maxXP);
  const level = Math.floor(commits / 1000) + 1;
  const xpPercent = (currentXP / maxXP) * 100;

  return (
    <div className="relative w-full h-screen bg-[#050101] overflow-hidden font-sans text-gray-200">
      
      {/* 3D Background Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 20, 60], fov: 45 }}>
          <Planet 
            commits={commits} 
            repos={reposCount} 
            stars={stats?.stars || 0} 
            topRepos={stats?.topRepos || []} 
          />
        </Canvas>
      </div>

      {/* OVERLAY UI */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
        
        {/* TOP HEADER */}
        <header className="flex justify-between items-start pointer-events-auto">
          <div className="flex items-center gap-2">
            <Rocket className="text-white w-6 h-6" />
            <span className="text-xl font-bold text-white tracking-wide">GitVerse<span className="text-xs ml-1 text-gray-400">✦</span></span>
          </div>

          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-lg">
            <div className="w-6 h-6 rounded-full bg-orange-500 overflow-hidden border border-white/20">
              {user?.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              )}
            </div>
            <span className="text-sm font-semibold text-white">{user?.user_metadata?.full_name || user?.user_metadata?.user_name || "Astronaut"}</span>
            <span className="text-[10px] font-bold bg-blue-600 px-2 py-0.5 rounded-full text-white">PRO</span>
          </div>
        </header>

        {/* MAIN UI OVERLAY - Collapsible */}
        {simulationMode && (
          <div className="absolute top-20 right-6 z-20">
            <button 
              onClick={() => setSimulationMode(false)}
              className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg backdrop-blur-md font-bold text-xs uppercase tracking-widest shadow-xl transition-all"
            >
              Exit Simulation
            </button>
          </div>
        )}

        <div className={`flex flex-col justify-between h-full transition-opacity duration-500 ${simulationMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          
          {/* MIDDLE SECTION: Left Panel & Right Nav */}
          <div className="flex justify-between items-center w-full flex-1 min-h-0 my-2">
            
            {/* LEFT PANEL */}
            <div className="pointer-events-auto flex flex-col gap-3 w-[300px]">
              
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Planet Overview</p>
                <h1 className="text-xl font-semibold text-white">{user?.user_metadata?.user_name || "Astronaut"}'s Planet</h1>
              </div>

              {/* Quick Stats Row */}
              <div className="flex justify-between items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl">
                <Stat icon="📦" label="Repos" value={reposCount.toString()} />
                <Stat icon="⚛️" label="Commits" value={commits.toString()} />
                <Stat icon="⭐" label="Stars" value={(stats?.stars || 0).toString()} />
              </div>

              {/* Primary Repo Card */}
              {primaryRepo && (
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-2xl rounded-full"></div>
                  
                  <div>
                    <h2 className="text-lg font-bold text-white mb-0.5">{primaryRepo.name}</h2>
                    <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2">
                      Most recent active repository. Powered by GitVerse simulation engine.
                    </p>
                  </div>

                  <div className="flex gap-8">
                    <div>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Language</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        <span className="text-xs text-white font-medium">{primaryRepo.language}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Created</p>
                      <span className="text-xs text-white font-medium">
                        {new Date(primaryRepo.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Hide UI Button inside Card */}
                  <button 
                    onClick={() => setSimulationMode(true)}
                    className="mt-2 w-full bg-white/10 hover:bg-white/20 text-white py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Enter Cinematic View
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT FLOATING NAV */}
            <div className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex flex-col gap-2 shadow-xl">
              <NavItem icon={<Globe className="w-4 h-4" />} label="Overview" active />
              <NavItem icon={<Search className="w-4 h-4" />} label="Explore" />
              <NavItem icon={<Trophy className="w-4 h-4" />} label="Achievements" />
              <NavItem icon={<BarChart3 className="w-4 h-4" />} label="Analytics" />
              <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" />
            </div>

          </div>

          {/* BOTTOM PANELS ROW */}
          <div className="pointer-events-auto flex gap-4 w-full h-[140px]">
          
          {/* Recent Activity */}
          <div className="flex-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col shadow-xl">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Recent Activity</h3>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {stats?.activity && stats.activity.length > 0 ? (
                stats.activity.slice(0, 4).map((ev, i) => (
                  <ActivityItem 
                    key={i} 
                    icon={ev.type.includes('Push') ? "🟩" : ev.type.includes('Pull') ? "🔀" : "📁"} 
                    text={`${ev.type.replace('Event', '')} in ${ev.repo}`} 
                    time={new Date(ev.created_at).toLocaleDateString()} 
                  />
                ))
              ) : (
                <span className="text-xs text-gray-500">No recent activity found.</span>
              )}
            </div>
          </div>

          {/* Planet Stats */}
          <div className="flex-[1.2] bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col shadow-xl">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Planet Stats</h3>
            
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm text-gray-400">Planet Level</span>
              <span className="text-xs text-gray-500">{currentXP.toLocaleString()} / {maxXP.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl font-bold text-white">Lv. {level}</span>
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                  style={{ width: `${xpPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between px-2">
              <div>
                <p className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">Population <span className="text-gray-400">👥</span></p>
                <p className="text-xl font-bold text-white">{(commits * 2.5).toFixed(0)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">Buildings <span className="text-purple-400">⚡</span></p>
                <p className="text-xl font-bold text-white">{reposCount} <span className="text-sm text-gray-500 font-normal">/ {reposCount + 10}</span></p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">Happiness <span className="text-yellow-400">😊</span></p>
                <p className="text-xl font-bold text-white">99%</p>
              </div>
            </div>
          </div>
          </div>

        </div>
      </div>
      
      {/* Hide scrollbar for the custom scroll area */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}} />
    </div>
  );
}

// Subcomponents

function Stat({ icon, label, value }: { icon: string, label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
        <span>{icon}</span> {label}
      </div>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${active ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function ActivityItem({ icon, text, time }: { icon: string, text: string, time: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm border border-white/10 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white truncate">{text}</p>
      </div>
      <span className="text-[10px] text-gray-500 whitespace-nowrap">{time}</span>
    </div>
  );
}
