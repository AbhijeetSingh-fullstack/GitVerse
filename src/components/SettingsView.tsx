import React, { useState } from 'react';
import { Settings, LogOut, Monitor, Palette, Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

interface SettingsViewProps {
  biomeId: string;
  setBiomeId: (b: string) => void;
  onExitSimulation: () => void;
}

export default function SettingsView({ biomeId, setBiomeId, onExitSimulation }: SettingsViewProps) {
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsPaymentLoading(true);
    try {
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100 }), // ₹1
      });
      
      const order = await response.json();
      
      if (!order.id) {
        throw new Error('Failed to create order');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Usually public key goes here, but it's safe to expose key_id
        amount: order.amount,
        currency: order.currency,
        name: 'GitVerse Pro',
        description: 'Upgrade to GitVerse Pro Tier',
        order_id: order.id,
        handler: function (response: any) {
          setIsPro(true);
          alert('Welcome to Pro! Payment successful.');
          // Update supabase if needed
        },
        prefill: {
          name: 'GitVerse Astronaut',
          email: 'astronaut@gitverse.com',
          contact: '9999999999',
        },
        theme: {
          color: '#f97316', // orange-500
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert('Payment failed: ' + response.error.description);
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      alert('Something went wrong during payment initialization.');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex-1 flex flex-col pointer-events-auto px-10 py-8 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center border border-gray-500/30">
          <Settings className="w-6 h-6 text-gray-400" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-white">System Settings</h2>
          <p className="text-sm text-gray-400">Configure your planetary visualization and account preferences.</p>
        </div>
      </div>

      <div className="max-w-3xl space-y-8">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        
        {/* Pro Plan Upgrade */}
        <div className="bg-black/60 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-2xl rounded-full"></div>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-bold text-white">GitVerse Pro</h3>
          </div>
          <p className="text-xs text-gray-400 mb-6 relative z-10">Upgrade to unlock advanced 3D visualizers, premium planetary biomes, and unlimited time-travel simulation.</p>
          
          {isPro ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex justify-center items-center">
              <span className="text-emerald-400 font-bold text-sm tracking-widest uppercase">Pro Access Granted 🎉</span>
            </div>
          ) : (
            <button 
              onClick={handleUpgrade}
              disabled={isPaymentLoading}
              className={`bg-orange-500 hover:bg-orange-600 text-white w-full rounded-xl py-3 font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] ${isPaymentLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isPaymentLoading ? 'Initializing Link...' : 'Upgrade for ₹1 (UPI Supported)'}
            </button>
          )}
        </div>

        {/* Biome Selection */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-bold text-white">Planetary Biome</h3>
          </div>
          <p className="text-xs text-gray-400 mb-6">Select the atmospheric and geological theme for your system. This immediately updates the entire rendering engine.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['mars', 'cyberpunk', 'lunar'].map((b) => (
              <button 
                key={b}
                onClick={() => setBiomeId(b)}
                className={`relative overflow-hidden rounded-xl p-4 transition-all border ${biomeId === b ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white uppercase tracking-wider text-sm">{b}</span>
                  {biomeId === b && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]"></div>}
                </div>
                <div className="h-16 rounded-lg w-full overflow-hidden flex shadow-inner">
                  {/* Miniature biome previews */}
                  {b === 'mars' && <div className="w-full h-full bg-gradient-to-br from-orange-800 to-orange-500"></div>}
                  {b === 'cyberpunk' && <div className="w-full h-full bg-gradient-to-br from-purple-900 to-cyan-500"></div>}
                  {b === 'lunar' && <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-700"></div>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Account / Actions */}
        <div className="bg-black/60 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-white">Account Management</h3>
          </div>
          <p className="text-xs text-gray-400 mb-6">Log out of your current session. You will need to re-authenticate with GitHub to return to your planet.</p>
          
          <button 
            onClick={handleLogout}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-all"
          >
            Disconnect Data-Link
          </button>
        </div>

      </div>
    </div>
  );
}
