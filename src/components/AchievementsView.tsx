import React, { useState } from 'react';
import { Trophy, Star, Code2, Zap, Rocket, Terminal, Users, Globe2, Activity, X } from 'lucide-react';
import { GitHubStats } from '@/utils/github';

interface AchievementsViewProps {
  stats: GitHubStats | null;
}

export default function AchievementsView({ stats }: AchievementsViewProps) {
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);

  const level = Math.floor(Math.sqrt(((stats?.commits || 0) * 10 + (stats?.stars || 0) * 100 + (stats?.repos || 0) * 50 + (stats?.followers || 0) * 20) / 100)) + 1;
  const polyglotCount = new Set(stats?.topRepos?.map(r => r.language).filter(Boolean)).size;

  const achievements = [
    {
      id: 'first_commit',
      title: 'First Ignition',
      description: 'You made your first commit and launched your planetary system.',
      icon: <Rocket className="w-8 h-8 text-orange-400" />,
      unlocked: true,
      color: 'from-orange-500 to-yellow-500',
      progress: 1,
      target: 1,
    },
    {
      id: 'star_collector',
      title: 'Star Collector',
      description: 'Your repositories have gathered over 10 stars across the galaxy.',
      icon: <Star className="w-8 h-8 text-yellow-400" />,
      unlocked: (stats?.stars || 0) >= 10,
      color: 'from-yellow-400 to-amber-600',
      progress: stats?.stars || 0,
      target: 10,
    },
    {
      id: 'architect',
      title: 'Master Architect',
      description: 'You have built 50 or more repositories in your system.',
      icon: <Terminal className="w-8 h-8 text-blue-400" />,
      unlocked: (stats?.repos || 0) >= 50,
      color: 'from-blue-500 to-cyan-500',
      progress: stats?.repos || 0,
      target: 50,
    },
    {
      id: 'polyglot',
      title: 'Polyglot',
      description: 'You code in 5 or more different programming languages.',
      icon: <Code2 className="w-8 h-8 text-purple-400" />,
      unlocked: polyglotCount >= 5,
      color: 'from-purple-500 to-pink-500',
      progress: polyglotCount,
      target: 5,
    },
    {
      id: 'hyper_drive',
      title: 'Hyper Drive',
      description: 'Exceed 1,000 total commits.',
      icon: <Zap className="w-8 h-8 text-cyan-400" />,
      unlocked: (stats?.commits || 0) >= 1000,
      color: 'from-cyan-400 to-emerald-500',
      progress: stats?.commits || 0,
      target: 1000,
    },
    {
      id: 'influencer',
      title: 'Influencer',
      description: 'Your gravitational pull has attracted over 50 followers.',
      icon: <Users className="w-8 h-8 text-pink-400" />,
      unlocked: (stats?.followers || 0) >= 50,
      color: 'from-pink-500 to-rose-500',
      progress: stats?.followers || 0,
      target: 50,
    },
    {
      id: 'supernova',
      title: 'Supernova',
      description: 'Collect over 500 total stars across your galaxy.',
      icon: <Globe2 className="w-8 h-8 text-indigo-400" />,
      unlocked: (stats?.stars || 0) >= 500,
      color: 'from-indigo-500 to-purple-500',
      progress: stats?.stars || 0,
      target: 500,
    },
    {
      id: 'explorer',
      title: 'Dedicated Explorer',
      description: 'Surpass Planet Level 10.',
      icon: <Activity className="w-8 h-8 text-green-400" />,
      unlocked: level >= 10,
      color: 'from-green-500 to-emerald-500',
      progress: level,
      target: 10,
    }
  ];

  const selectedAch = achievements.find(a => a.id === selectedAchievementId);

  return (
    <div className="flex-1 flex flex-col pointer-events-auto px-10 py-8 overflow-y-auto custom-scrollbar pb-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
          <Trophy className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-white">Achievements</h2>
          <p className="text-sm text-gray-400">Unlock planetary milestones based on your GitHub activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map(ach => (
          <div 
            key={ach.id}
            onClick={() => setSelectedAchievementId(ach.id)}
            className={`cursor-pointer relative overflow-hidden backdrop-blur-xl border rounded-2xl p-6 transition-all group hover:scale-[1.02] ${ach.unlocked ? 'bg-black/60 border-white/20 hover:border-white/40' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
          >
            {ach.unlocked && (
              <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${ach.color} opacity-20 blur-2xl rounded-full group-hover:opacity-40 transition-opacity`}></div>
            )}
            
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${ach.unlocked ? 'bg-white/10' : 'bg-white/5 grayscale opacity-50'}`}>
              {ach.icon}
            </div>
            
            <h3 className={`text-lg font-bold mb-1 ${ach.unlocked ? 'text-white' : 'text-gray-500'}`}>
              {ach.title}
            </h3>
            <p className={`text-xs ${ach.unlocked ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
              {ach.description}
            </p>
            
            {!ach.unlocked && (
              <div className="absolute top-4 right-4 bg-black/50 px-2 py-1 rounded text-[10px] font-bold text-gray-500 border border-white/5">
                LOCKED
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedAch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/20 rounded-3xl p-8 max-w-md w-full relative shadow-2xl overflow-hidden">
            {selectedAch.unlocked && (
              <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${selectedAch.color} opacity-20 blur-[100px] rounded-full`}></div>
            )}
            
            <button 
              onClick={() => setSelectedAchievementId(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-lg ${selectedAch.unlocked ? 'bg-white/10' : 'bg-white/5 grayscale opacity-50 border border-white/10'}`}>
                {selectedAch.icon}
              </div>
              
              <h2 className={`text-2xl font-black mb-2 ${selectedAch.unlocked ? 'text-white' : 'text-gray-500'}`}>{selectedAch.title}</h2>
              <p className={`text-sm mb-8 ${selectedAch.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>{selectedAch.description}</p>
              
              <div className="w-full bg-black/50 rounded-xl p-5 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress</span>
                  <span className="text-xs font-bold text-white">
                    {Math.min(selectedAch.progress, selectedAch.target).toLocaleString()} / {selectedAch.target.toLocaleString()}
                  </span>
                </div>
                
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${selectedAch.unlocked ? selectedAch.color : 'from-gray-500 to-gray-400'}`}
                    style={{ width: `${Math.min(100, Math.max(0, (selectedAch.progress / selectedAch.target) * 100))}%` }}
                  ></div>
                </div>
                
                {selectedAch.unlocked ? (
                  <p className="text-xs text-emerald-400 font-bold mt-4 uppercase tracking-widest text-center">Achievement Unlocked!</p>
                ) : (
                  <p className="text-xs text-gray-500 font-bold mt-4 uppercase tracking-widest text-center">Keep going!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
