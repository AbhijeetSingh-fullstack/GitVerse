"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import Planet from "@/components/Planet";
import { createClient } from "@/utils/supabase/client";
import { useState, useRef } from "react";
import { Rocket, Sparkles, Code2 } from "lucide-react";
import * as THREE from "three";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

// A simple dynamic 3D starfield
function Stars() {
  const group = useRef<THREE.Group>(null);
  const [pts] = useState(() => {
    const p = new Float32Array(3000);
    for (let i = 0; i < 3000; i++) {
      p[i] = (Math.random() - 0.5) * 50;
    }
    return p;
  });

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.05;
      group.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={pts.length / 3} array={pts} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} sizeAttenuation />
      </points>
    </group>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const supabase = createClient();

  const handleGitHubLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'repo read:user'
      }
    });
  };

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden text-white font-sans selection:bg-orange-500/30">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <fog attach="fog" args={['#050505', 5, 20]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffedd5" />
          <Stars />
          <group position={[3, -1, -3]}>
            <Planet commits={0} />
          </group>
        </Canvas>
      </div>

      {/* Foreground UI */}
      <div className="relative z-10 flex flex-col items-start justify-center w-full h-full pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-900/20 via-black/40 to-black/80">
        
        {/* Left Side Content Container */}
        <div className="ml-[10%] lg:ml-[15%] max-w-2xl pointer-events-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium tracking-wide text-gray-300 uppercase">Welcome to the future of coding</span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.1]">
            <span className="block text-white drop-shadow-lg">Build Your</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 animate-gradient-x drop-shadow-xl">
              GitVerse
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl lg:text-2xl font-light text-gray-400 mb-12 leading-relaxed max-w-xl">
            Your GitHub history is more than just green squares. Transform your daily commits into a thriving, living 3D civilization.
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Code</h3>
                <p className="text-sm text-gray-500">Push to GitHub</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Expand</h3>
                <p className="text-sm text-gray-500">Grow your world</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="relative group inline-block">
            {/* Glowing Aura Background */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 blur-xl opacity-30 group-hover:opacity-60 transition duration-500 group-hover:duration-200 animate-pulse"></div>
            
            <button 
              onClick={handleGitHubLogin}
              disabled={loading}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="relative flex items-center gap-4 px-8 py-4 bg-black/50 hover:bg-black/80 border border-white/20 backdrop-blur-xl transition-all duration-300 rounded-2xl font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer overflow-hidden"
            >
              {/* Button Hover Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r from-orange-500/20 to-purple-600/20 transition-opacity duration-500 ${isHovering ? 'opacity-100' : 'opacity-0'}`}></div>
              
              <GithubIcon className={`w-6 h-6 transition-transform duration-300 ${isHovering ? 'scale-110' : ''}`} />
              <span className="relative z-10">{loading ? "Connecting to Orbit..." : "Connect with GitHub"}</span>
              
              {/* Arrow Icon */}
              <svg className={`w-5 h-5 ml-2 transition-transform duration-300 ${isHovering ? 'translate-x-1 text-orange-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
