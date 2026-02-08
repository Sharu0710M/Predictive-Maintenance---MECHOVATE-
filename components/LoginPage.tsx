
import React, { useState } from 'react';
import { Lock, User, ShieldCheck, Cpu, ArrowRight, Loader2, LifeBuoy, ChevronLeft, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: { name: string; role: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate industrial auth latency
    setTimeout(() => {
      onLogin({ name: 'Ops Director', role: 'Asset Controller' });
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-20"
          alt="Factory Background"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-blue-900/20" />
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[580px] flex flex-col">
          
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-slate-900 text-3xl shadow-2xl shadow-amber-500/20 mb-6 group hover:rotate-6 transition-transform">
              T
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
              TDS <span className="text-amber-500">AssetHub</span>
            </h1>
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck size={14} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Secure Operations Node</span>
            </div>
          </div>

          {!isRecovering ? (
            <div className="flex-1 animate-in slide-in-from-right-4 duration-500">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Operator ID / Email</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@industry.io"
                      className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all font-medium placeholder:text-slate-600"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Security Key / Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all font-medium placeholder:text-slate-600"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-slate-800 accent-amber-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Remember Station</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setIsRecovering(true)}
                    className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
                  >
                    Recovery Mode
                  </button>
                </div>

                <button 
                  disabled={isLoading}
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-amber-500/10 transition-all flex items-center justify-center gap-2 group mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <>
                      <span>Initialize Console</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 animate-in slide-in-from-left-4 duration-500 flex flex-col">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8 text-center">
                 <LifeBuoy className="text-blue-500 mx-auto mb-4" size={40} />
                 <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">Protocol Recovery</h3>
                 <p className="text-slate-400 text-xs leading-relaxed">If you've lost access to your station, please follow the industrial recovery directives below.</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 items-start bg-slate-800/40 p-4 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 font-black text-xs text-white">1</div>
                  <p className="text-slate-300 text-[10px] leading-tight font-medium">Verify your Station ID (ST-902) is correctly displayed in the top network header.</p>
                </div>
                <div className="flex gap-4 items-start bg-slate-800/40 p-4 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 font-black text-xs text-white">2</div>
                  <p className="text-slate-300 text-[10px] leading-tight font-medium">Contact your Plant Supervisor for a temporary one-time operational bypass key (OBK).</p>
                </div>
                <div className="flex gap-4 items-start bg-slate-800/40 p-4 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 font-black text-xs text-white text-emerald-400">
                    <AlertCircle size={14} />
                  </div>
                  <p className="text-emerald-400/80 text-[10px] leading-tight font-bold uppercase tracking-wider">Prototype Override: Use any credentials to bypass authentication for demo purposes.</p>
                </div>
              </div>

              <button 
                onClick={() => setIsRecovering(false)}
                className="mt-auto w-full py-4 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
              >
                <ChevronLeft size={16} />
                Return to Login
              </button>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu size={20} className="text-slate-700" />
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">System Version</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">4.22.0-STABLE</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Network Status</p>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
