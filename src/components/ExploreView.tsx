import React, { useState } from 'react';
import { Search, Map, Star, User } from 'lucide-react';

export default function ExploreView() {
  const [query, setQuery] = useState('');

  return (
    <div className="flex-1 flex flex-col items-center justify-center pointer-events-auto px-10">
      <div className="w-full max-w-2xl bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Map className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Explore the GitVerse</h2>
          <p className="text-sm text-gray-400">Discover other developers' planetary systems, view their repositories, and explore their codebase.</p>
        </div>

        <div className="relative z-10 w-full mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search GitHub usernames..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
          </div>
        </div>

        <div className="relative z-10">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Trending Systems</h3>
          <div className="grid grid-cols-2 gap-4">
            {['torvalds', 'yyx990803', 'gaearon', 'Rich-Harris'].map(user => (
              <button key={user} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-left">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">@{user}</p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Star className="w-3 h-3 text-orange-400" /> Planetary Core
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
