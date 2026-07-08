"use client";

import { Canvas } from "@react-three/fiber";
import Planet from "@/components/Planet";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { fetchGitHubStats, GitHubStats } from "@/utils/github";

const LEVELS = [
  { threshold: 0, max: 25, name: "Unexplored Planet", feature: "Campfire" },
  { threshold: 25, max: 75, name: "First Camp", feature: "Farms & Windmills" },
  { threshold: 75, max: 150, name: "Growing Settlement", feature: "Marketplace" },
  { threshold: 150, max: 300, name: "Village", feature: "Town organization" },
  { threshold: 300, max: 500, name: "Town", feature: "Small City buildings" },
  { threshold: 500, max: 800, name: "Small City", feature: "Modern skyscrapers" },
  { threshold: 800, max: 1200, name: "Modern City", feature: "Tech Hub & drones" },
  { threshold: 1200, max: 1800, name: "Tech Hub", feature: "Smart City holograms" },
  { threshold: 1800, max: 3000, name: "Smart City", feature: "Space Port" },
  { threshold: 3000, max: 5000, name: "Space Civilization", feature: "Dyson Sphere" },
  { threshold: 5000, max: 10000, name: "Interstellar Empire", feature: "Max Level!" }
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Simulation State
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulatedCommits, setSimulatedCommits] = useState(0);
  const [simulatedRepos, setSimulatedRepos] = useState(0);
  const [simulatedStars, setSimulatedStars] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      setUser(currentUser);

      if (currentUser) {
        const username = currentUser.user_metadata?.user_name;
        const providerToken = session?.provider_token; 
        
        if (username) {
          const githubData = await fetchGitHubStats(username, providerToken);
          setStats(githubData);
          setSimulatedCommits(githubData.commits || 0);
          setSimulatedRepos(githubData.repos || 0);
          setSimulatedStars(githubData.stars || 0);
        }
      }
      setLoading(false);
    };
    initData();
  }, [supabase.auth]);

  const baseCommits = stats?.commits || 0;
  const baseRepos = stats?.repos || 0;
  const baseStars = stats?.stars || 0;

  const commits = simulationMode ? simulatedCommits : baseCommits;
  const repos = simulationMode ? simulatedRepos : baseRepos;
  const stars = simulationMode ? simulatedStars : baseStars;

  // Determine Level for UI
  let currentLevelIdx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (commits >= LEVELS[i].threshold) {
      currentLevelIdx = i;
      break;
    }
  }

  const levelData = LEVELS[currentLevelIdx];
  const nextLevelData = LEVELS[Math.min(currentLevelIdx + 1, LEVELS.length - 1)];

  const progress = Math.min(((commits - levelData.threshold) / (levelData.max - levelData.threshold)) * 100, 100);

  if (loading) {
    return <div className="w-full h-screen bg-black text-white flex items-center justify-center">Establishing Connection...</div>;
  }

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden text-white flex">
      
      {/* Simulation Slider (Visible only when Simulation Mode is ON) */}
      {simulationMode && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] flex flex-col gap-4 w-[600px]">
          
          <div>
            <div className="flex justify-between w-full mb-1">
              <span className="text-sm font-bold text-orange-400">Commits (Height)</span>
              <span className="text-sm font-bold">{simulatedCommits} Commits (Level {currentLevelIdx})</span>
            </div>
            <input 
              type="range" min="0" max="100000" 
              value={simulatedCommits} 
              onChange={(e) => setSimulatedCommits(parseInt(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>

          <div>
            <div className="flex justify-between w-full mb-1">
              <span className="text-sm font-bold text-blue-400">Repos (Expansion)</span>
              <span className="text-sm font-bold">{simulatedRepos} Repos</span>
            </div>
            <input 
              type="range" min="0" max="500" 
              value={simulatedRepos} 
              onChange={(e) => setSimulatedRepos(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between w-full mb-1">
              <span className="text-sm font-bold text-yellow-400">Stars (Laboratories)</span>
              <span className="text-sm font-bold">{simulatedStars} Stars</span>
            </div>
            <input 
              type="range" min="0" max="1000" 
              value={simulatedStars} 
              onChange={(e) => setSimulatedStars(parseInt(e.target.value))}
              className="w-full accent-yellow-500"
            />
          </div>

        </div>
      )}

      {/* 3D Background / Interactive Canvas */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1a0505] to-[#0a0202]">
        <Canvas camera={{ position: [0, 5, 10], fov: 45 }}>
          <Planet commits={commits} repos={repos} stars={stars} />
        </Canvas>
      </div>

      {/* Sidebar Overlay (Left) */}
      <div className="relative z-10 w-80 h-full p-6 flex flex-col gap-6 bg-black/40 backdrop-blur-md border-r border-white/10 overflow-y-auto">
        
        {/* Profile Card */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-500 overflow-hidden border-2 border-white/10">
              {user?.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight truncate w-32">
                {user?.user_metadata?.full_name || user?.user_metadata?.user_name || "Astronaut"}
              </h2>
              <p className="text-sm text-gray-400 truncate w-32">@{user?.user_metadata?.user_name || "github_user"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-sm font-semibold">
              Edit Profile
            </button>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors rounded-lg text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* GitHub Stats */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">GitHub Sync</h3>
             
             {/* Simulation Toggle */}
             <button 
                onClick={() => setSimulationMode(!simulationMode)}
                className={`text-xs px-2 py-1 rounded border transition-colors ${simulationMode ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
             >
               {simulationMode ? 'Simulating' : 'Simulate'}
             </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Commits" value={commits.toString()} />
            <StatCard label="Repos" value={stats?.repos.toString() || "0"} />
            <StatCard label="Stars" value={stats?.stars.toString() || "0"} />
            <StatCard label="Followers" value={stats?.followers.toString() || "0"} />
          </div>
        </div>

        {/* Civilization Stats with Visual Markers */}
        <div className="flex flex-col gap-3 mt-4">
          <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider">Mars Colony Rank</h3>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-900/40 to-orange-900/40 border border-red-500/30">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-red-300">Level {currentLevelIdx}</span>
              <span className="text-xl font-black text-white">{levelData.name}</span>
            </div>
            
            {/* Progress Bar with Markers */}
            <div className="relative w-full bg-black/50 rounded-full h-3 mb-2 mt-4">
              <div 
                className="bg-gradient-to-r from-orange-600 to-red-600 h-3 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(220,38,38,0.5)]" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="text-xs text-red-200/70 text-right mb-4">
              Next Rank: <span className="text-white font-semibold">{nextLevelData.threshold} Commits</span> ({levelData.feature})
            </div>

          </div>
        </div>
      </div>

      {/* Activity Timeline (Right) */}
      <div className="relative z-10 w-80 h-full p-6 ml-auto flex flex-col gap-4 bg-black/40 backdrop-blur-md border-l border-white/10 overflow-y-auto hidden lg:flex">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Live Activity</h3>
        
        <TimelineItem icon="📡" title="Sync Established" time="Just now" desc="GitHub data successfully imported into Mars Colony." />
        <TimelineItem icon="🚀" title={`Rank ${currentLevelIdx} Achieved`} time="Recent" desc={`Colony evolved to ${levelData.name}!`} />
      </div>

    </div>
  );
}

function StatCard({ label, value, bg = "bg-white/5" }: { label: string, value: string, bg?: string }) {
  return (
    <div className={`p-3 rounded-xl ${bg} border border-white/5 flex flex-col justify-center`}>
      <span className="text-xs text-gray-400 mb-1 leading-tight">{label}</span>
      <span className="text-lg font-bold text-white truncate">{value}</span>
    </div>
  );
}

function TimelineItem({ icon, title, time, desc }: { icon: string, title: string, time: string, desc: string }) {
  return (
    <div className="flex gap-4 relative">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 text-lg z-10">
        {icon}
      </div>
      <div className="flex flex-col pb-6 border-l-2 border-white/10 absolute left-5 top-10 bottom-0 -z-0 translate-y-2"></div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white">{title}</span>
        <span className="text-xs text-orange-400/80">{time}</span>
        <span className="text-xs text-gray-300 mt-1">{desc}</span>
      </div>
    </div>
  );
}
