"use client";

import { Canvas } from "@react-three/fiber";
import MarsBase from "@/components/MarsBase";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGitHubLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
  };

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden text-white">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <MarsBase />
        </Canvas>
      </div>

      {/* Foreground UI */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pointer-events-none bg-gradient-to-b from-black/50 via-transparent to-black/80">
        <div className="text-center pointer-events-auto p-8 backdrop-blur-md bg-black/30 rounded-3xl border border-white/10 shadow-2xl">
          <h1 className="text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-sm">
            GitVerse
          </h1>
          <p className="text-xl font-medium text-gray-300 max-w-lg mb-8 mx-auto leading-relaxed">
            Your GitHub history deserves more than green squares. <br/>
            Transform every contribution into a living civilization.
          </p>
          <button 
            onClick={handleGitHubLogin}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 transition-all rounded-full font-bold text-lg shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Connecting..." : "Continue with GitHub"}
          </button>
        </div>
      </div>
    </div>
  );
}
