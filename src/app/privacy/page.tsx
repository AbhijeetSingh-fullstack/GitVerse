import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Rocket, Lock, Eye, Server, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#050101] text-gray-200 font-sans relative overflow-hidden flex flex-col items-center">
      
      {/* Background Starfield effect */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-4xl z-10 px-8 py-16">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-bold uppercase tracking-widest text-xs">Return to Orbit</span>
          </Link>
          
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full shadow-lg">
            <img src="/GitVerse.png" alt="GitVerse Logo" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            <span className="text-lg font-bold text-white tracking-wide">GitVerse<span className="text-xs ml-1 text-gray-400">✦</span></span>
          </div>
        </div>

        {/* Title */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 mb-6">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Galactic Privacy Policy</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We guard your data as closely as a black hole guards light. Here is exactly what we collect and how it powers your simulation.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">1. Data Observation</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              When you authenticate with GitVerse, we request read-only access to your public GitHub profile. This includes your public repositories, commit history, language statistics, and follower counts. We do not ask for or require access to your private repositories or sensitive organizational data.
            </p>
          </section>

          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">2. Data Storage</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Your session is securely managed via Supabase. We do not permanently store a copy of your codebase on our servers. The repository data is fetched directly from the GitHub API in real-time to render your 3D planetary system and then discarded when the simulation ends.
            </p>
          </section>

          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">3. Third-Party Transmission</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              GitVerse is a pure visualization engine. We do not sell, rent, or transmit your GitHub data to any third-party advertising networks or data brokers. Your planetary data is for your eyes only (unless you explicitly choose to share a cinematic screenshot).
            </p>
          </section>

        </div>
        
        {/* Footer */}
        <div className="mt-20 text-center border-t border-white/10 pt-8 pb-12">
          <p className="text-sm text-gray-600 font-mono">
            Last Updated: Stardate {new Date().toLocaleDateString()}
          </p>
        </div>

      </div>
    </div>
  );
}
