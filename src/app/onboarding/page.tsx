"use client";

import { Canvas } from "@react-three/fiber";
import Planet, { PlanetTheme } from "@/components/Planet";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Onboarding() {
  const [planetName, setPlanetName] = useState("");
  const [theme, setTheme] = useState<PlanetTheme>('desert');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleCreate = async () => {
    if (!planetName.trim()) return;
    setLoading(true);
    
    // Simulate DB creation
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  };

  const themes: { id: PlanetTheme, name: string, color: string }[] = [
    { id: 'desert', name: 'Desert (Mars)', color: 'bg-orange-600' },
    { id: 'ice', name: 'Ice World', color: 'bg-cyan-200' },
    { id: 'volcanic', name: 'Volcanic', color: 'bg-red-800' },
    { id: 'toxic', name: 'Toxic Waste', color: 'bg-lime-600' },
  ];

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden text-white flex items-center justify-center">
      
      {/* 3D Background - Interactive Planet Preview */}
      <div className="absolute inset-0 z-0 opacity-80">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          {/* Using commits=3000 to show the fully evolved planet preview, or 0 for barren. Let's show Level 2 so they see atmosphere! */}
          <Planet commits={200} theme={theme} />
        </Canvas>
      </div>

      {/* Onboarding UI */}
      <div className="relative z-10 p-10 bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl w-[550px] flex flex-col items-center text-center">
        <h1 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-600">
          Discover a New World
        </h1>
        <p className="text-gray-300 mb-8 leading-relaxed">
          Your GitHub journey is about to become a civilization. Choose your planet class and give it a name.
        </p>

        {/* Theme Selector */}
        <div className="w-full mb-6">
          <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 text-left">
            Planet Class
          </label>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  theme === t.id 
                    ? 'border-orange-500 bg-white/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
                    : 'border-white/10 bg-black/40 hover:bg-white/5'
                }`}
              >
                <div className={`w-6 h-6 rounded-full ${t.color} shadow-inner`}></div>
                <span className="font-semibold text-sm">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Name Input */}
        <div className="w-full mb-8">
           <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 text-left">
            Planet Name
          </label>
          <input
            type="text"
            value={planetName}
            onChange={(e) => setPlanetName(e.target.value)}
            placeholder="e.g. Kepler-186f, Terra Nova..."
            className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-xl text-white text-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-gray-600 font-medium"
            maxLength={25}
          />
        </div>

        <button 
          onClick={handleCreate}
          disabled={!planetName.trim() || loading}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 transition-all rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Initializing Core..." : "Claim Planet"}
        </button>
      </div>

    </div>
  );
}
