"use client";

import { Canvas } from "@react-three/fiber";
import Planet from "@/components/Planet";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [commits, setCommits] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  // Determine Level for UI
  let levelName = "Barren Rock";
  let levelNum = 1;
  let progress = (commits / 100) * 100;
  
  if (commits > 100 && commits <= 500) {
    levelName = "Atmosphere Awakens";
    levelNum = 2;
    progress = ((commits - 100) / 400) * 100;
  } else if (commits > 500 && commits <= 2000) {
    levelName = "Oceanic World";
    levelNum = 3;
    progress = ((commits - 500) / 1500) * 100;
  } else if (commits > 2000) {
    levelName = "Civilization";
    levelNum = 4;
    progress = Math.min(((commits - 2000) / 3000) * 100, 100);
  }

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden text-white flex">
      {/* Testing Slider (Dev Only) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-2xl flex items-center gap-4 w-96">
        <label className="text-sm font-bold whitespace-nowrap text-orange-400">Dev Test: Commits</label>
        <input 
          type="range" 
          min="0" 
          max="3000" 
          value={commits} 
          onChange={(e) => setCommits(parseInt(e.target.value))}
          className="w-full accent-orange-500"
        />
        <span className="font-mono">{commits}</span>
      </div>

      {/* 3D Background / Interactive Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
          <Planet commits={commits} />
        </Canvas>
      </div>

      {/* Sidebar Overlay (Left) */}
      <div className="relative z-10 w-80 h-full p-6 flex flex-col gap-6 bg-black/40 backdrop-blur-md border-r border-white/10 overflow-y-auto">
        
        {/* Profile Card */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-500 overflow-hidden">
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
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">GitHub Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Commits" value={commits.toString()} />
            <StatCard label="Streak" value="12 Days" />
            <StatCard label="Followers" value="45" />
            <StatCard label="Repos" value="32" />
          </div>
        </div>

        {/* Civilization Stats */}
        <div className="flex flex-col gap-3 mt-4">
          <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider">Civilization</h3>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-orange-200">Level {levelNum}</span>
              <span className="text-xl font-black text-white">{levelName}</span>
            </div>
            <div className="w-full bg-black/50 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <StatCard label="Population" value={Math.floor(commits * 2.5).toString()} bg="bg-black/40" />
              <StatCard label="Buildings" value={Math.floor(commits / 10).toString()} bg="bg-black/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline (Right) */}
      <div className="relative z-10 w-80 h-full p-6 ml-auto flex flex-col gap-4 bg-black/40 backdrop-blur-md border-l border-white/10 overflow-y-auto hidden lg:flex">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Activity Timeline</h3>
        
        <TimelineItem icon="🏗️" title="Hospital Constructed" time="2 hours ago" desc="Unlocked by merging 5 Pull Requests." />
        <TimelineItem icon="🚀" title="1,000 Commits Reached" time="1 day ago" desc="Achievement Unlocked!" />
        <TimelineItem icon="🌱" title="Forest Planted" time="3 days ago" desc="Created a new repository." />
      </div>

    </div>
  );
}

function StatCard({ label, value, bg = "bg-white/5" }: { label: string, value: string, bg?: string }) {
  return (
    <div className={`p-3 rounded-xl ${bg} border border-white/5 flex flex-col justify-center`}>
      <span className="text-xs text-gray-400 mb-1">{label}</span>
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
        <span className="text-xs text-gray-400">{time}</span>
        <span className="text-xs text-gray-300 mt-1">{desc}</span>
      </div>
    </div>
  );
}
