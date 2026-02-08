
import React, { useEffect, useState } from 'react';
import { Asset, AIInsight, PriorityLevel } from '../types';
import { getAssetInsight } from '../services/geminiService';
import { X, Bot, Loader2, CheckCircle2, AlertTriangle, TrendingUp, BarChart3, Activity, ShieldCheck, Ticket } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface InsightDrawerProps {
  asset: Asset | null;
  onClose: () => void;
  onUpdateAsset: (updatedAsset: Asset) => void;
}

export const InsightDrawer: React.FC<InsightDrawerProps> = ({ asset, onClose, onUpdateAsset }) => {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'authorizing' | 'success'>('idle');

  useEffect(() => {
    if (asset) {
      setLoading(true);
      setError(null);
      setTicketStatus(asset.isMaintenanceScheduled ? 'success' : 'idle');
      getAssetInsight(asset)
        .then(setInsight)
        .catch(() => setError("Unable to reach AI analysis engine. Ensure your API key is configured correctly."))
        .finally(() => setLoading(false));
    } else {
      setInsight(null);
      setTicketStatus('idle');
    }
  }, [asset?.id]); // Re-fetch only if asset ID changes

  const handleAuthorizeTicket = () => {
    if (!asset) return;
    setTicketStatus('authorizing');
    // Simulate industrial API call to CMMS
    setTimeout(() => {
      setTicketStatus('success');
      // Update the global state
      onUpdateAsset({ ...asset, isMaintenanceScheduled: true });
    }, 1500);
  };

  if (!asset) return null;

  const contributionData = insight ? [
    { name: 'Temperature', value: insight.rootCauseContribution.temperature, color: '#f43f5e' },
    { name: 'Vibration', value: insight.rootCauseContribution.vibration, color: '#3b82f6' },
    { name: 'Current', value: insight.rootCauseContribution.current, color: '#f59e0b' },
  ] : [];

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-white z-[60] transform transition-transform duration-500 ease-out shadow-2xl border-l border-slate-200 ${asset ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/20">
              <Bot className="text-amber-400" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Diagnostic Hub</h2>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1.5">{asset.id} / Root Cause Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-400 hover:text-slate-900 active:scale-95">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          {loading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center text-slate-400 space-y-8">
              <div className="relative">
                <Loader2 className="animate-spin text-slate-900" size={64} strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity size={24} className="text-amber-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Processing Telemetry</p>
                <p className="text-sm mt-2 font-medium opacity-60">Cross-referencing failure patterns...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border-2 border-rose-200 rounded-[2rem] p-8 text-rose-700 flex gap-5">
              <AlertTriangle className="shrink-0" size={32} />
              <div>
                <p className="font-black uppercase tracking-widest text-xs">Node Connection Error</p>
                <p className="text-sm mt-2 font-medium leading-relaxed">{error}</p>
              </div>
            </div>
          ) : insight ? (
            <>
              <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-200 flex gap-6 items-center shadow-inner">
                <img src={asset.imageUrl} className="w-20 h-20 rounded-2xl object-cover border border-white shadow-md" alt="" />
                <div>
                  <h4 className="font-black text-slate-900 tracking-tight text-lg">{asset.name}</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{asset.type}</p>
                </div>
              </div>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-3">
                  <TrendingUp size={20} className="text-blue-600" />
                  <h3 className="font-black uppercase tracking-widest text-[10px]">AI Reasoning Log</h3>
                </div>
                <div className="bg-white rounded-[1.5rem] p-8 border border-slate-200 shadow-sm text-slate-600 leading-relaxed text-sm font-medium">
                  {insight.reasoning}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-3">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <h3 className="font-black uppercase tracking-widest text-[10px]">Direct Recommendations</h3>
                </div>
                <div className="bg-emerald-50 rounded-[1.5rem] p-8 border-2 border-emerald-100 text-emerald-900 text-sm font-black shadow-sm italic">
                  "{insight.recommendation}"
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-3">
                  <BarChart3 size={20} className="text-slate-400" />
                  <h3 className="font-black uppercase tracking-widest text-[10px]">Risk Factor Distribution</h3>
                </div>
                <div className="h-64 w-full pr-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={contributionData} margin={{ left: 0, right: 30 }}>
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" width={110} tick={{ fill: '#64748b', fontSize: 10, fontWeight: '900', textAnchor: 'start' }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                        {contributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </>
          ) : null}
        </div>

        <div className="p-8 border-t border-slate-200 bg-slate-50">
          {ticketStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center gap-3 bg-emerald-500 text-white p-6 rounded-[1.5rem] animate-in zoom-in duration-300 shadow-xl shadow-emerald-500/20">
              <ShieldCheck size={32} />
              <div className="text-center">
                <p className="font-black uppercase tracking-[0.2em] text-xs">Work Order Synchronized</p>
                <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-widest">Maintenance Ticket #00{Math.floor(Math.random() * 9000) + 1000} Active</p>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleAuthorizeTicket}
              disabled={!insight || ticketStatus === 'authorizing'}
              className="w-full py-5 bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 group"
            >
              {ticketStatus === 'authorizing' ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Submitting to CMMS...</span>
                </>
              ) : (
                <>
                  <Ticket size={20} className="group-hover:rotate-12 transition-transform" />
                  <span>Authorize Maintenance Ticket</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
