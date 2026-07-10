import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, GitCommit, Star } from 'lucide-react';
import { GitHubStats } from '@/utils/github';

interface AnalyticsViewProps {
  stats: GitHubStats | null;
  commits: number;
}

export default function AnalyticsView({ stats, commits }: AnalyticsViewProps) {
  
  const languageData = useMemo(() => {
    if (!stats?.topRepos) return [];
    const counts: Record<string, number> = {};
    let total = 0;
    
    stats.topRepos.forEach(repo => {
      if (repo.language) {
        counts[repo.language] = (counts[repo.language] || 0) + 1;
        total++;
      }
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .slice(0, 5); // top 5
  }, [stats]);

  return (
    <div className="flex-1 flex flex-col pointer-events-auto px-10 py-8 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-white">Analytics Core</h2>
          <p className="text-sm text-gray-400">Deep dive into your planetary metrics and code distribution.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Language Distribution */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Language Distribution</h3>
            <TrendingUp className="w-4 h-4 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {languageData.length > 0 ? languageData.map((lang, idx) => (
              <div key={lang.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-white">{lang.name}</span>
                  <span className="text-gray-400">{lang.percentage}% ({lang.count} repos)</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                    style={{ width: `${lang.percentage}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <p className="text-xs text-gray-500">No language data available.</p>
            )}
          </div>
        </div>

        {/* Global Stats */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-2">System Telemetry</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <GitCommit className="w-6 h-6 text-cyan-400 mb-2" />
              <p className="text-2xl font-bold text-white">{commits}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Total Commits (Est.)</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <Star className="w-6 h-6 text-orange-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats?.stars || 0}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Total Stars</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
