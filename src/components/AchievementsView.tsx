import React from 'react';
import { Trophy, Star, Code2, Zap, Rocket, Terminal } from 'lucide-react';
import { GitHubStats } from '@/utils/github';

interface AchievementsViewProps {
  stats: GitHubStats | null;
}

export default function AchievementsView({ stats }: AchievementsViewProps) {
  const achievements = [
    {
      id: 'first_commit',
      title: 'First Ignition',
      description: 'You made your first commit and launched your planetary system.',
      icon: <Rocket className="w-8 h-8 text-orange-400" />,
      unlocked: true,
      color: 'from-orange-500 to-yellow-500'
    },
    {
      id: 'star_collector',
      title: 'Star Collector',
      description: 'Your repositories have gathered over 10 stars across the galaxy.',
      icon: <Star className="w-8 h-8 text-yellow-400" />,
      unlocked: (stats?.stars || 0) > 10,
      color: 'from-yellow-400 to-amber-600'
    },
    {
      id: 'architect',
      title: 'Master Architect',
      description: 'You have built more than 50 repositories in your system.',
      icon: <Terminal className="w-8 h-8 text-blue-400" />,
      unlocked: (stats?.topRepos?.length || 0) > 50,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'polyglot',
      title: 'Polyglot',
      description: 'You code in 5 or more different programming languages.',
      icon: <Code2 className="w-8 h-8 text-purple-400" />,
      unlocked: new Set(stats?.topRepos?.map(r => r.language).filter(Boolean)).size >= 5,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'hyper_drive',
      title: 'Hyper Drive',
      description: 'Exceed 1000 total commits.',
      icon: <Zap className="w-8 h-8 text-cyan-400" />,
      unlocked: (stats?.commits || 0) > 1000,
      color: 'from-cyan-400 to-emerald-500'
    }
  ];

  return (
    <div className="flex-1 flex flex-col pointer-events-auto px-10 py-8 overflow-y-auto custom-scrollbar">
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
            className={`relative overflow-hidden bg-black/60 backdrop-blur-xl border ${ach.unlocked ? 'border-white/20' : 'border-white/5'} rounded-2xl p-6 transition-all group hover:scale-[1.02]`}
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
            <p className={`text-xs ${ach.unlocked ? 'text-gray-300' : 'text-gray-600'}`}>
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
    </div>
  );
}
