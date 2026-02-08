
import React, { useState } from 'react';
import { Asset, PriorityLevel } from '../types';
import { SensorChart } from './SensorChart';
import { calculatePriorityLevel, calculateFinancialRisk } from '../utils/calculators';
import { Activity, Thermometer, Zap, ShieldAlert, HeartPulse, Factory, Wrench } from 'lucide-react';

interface AssetCardProps {
  asset: Asset;
  onClick: (asset: Asset) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const latest = asset.sensors[asset.sensors.length - 1];
  const priorityLevel = calculatePriorityLevel(asset.priorityScore);
  const financialRisk = calculateFinancialRisk(asset);

  const getStatusClasses = (level: PriorityLevel) => {
    switch (level) {
      case PriorityLevel.HIGH: return 'text-rose-700 bg-rose-50 border-rose-200';
      case PriorityLevel.MEDIUM: return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  const getHealthColor = (score: number) => {
    if (score > 75) return 'text-emerald-600';
    if (score > 40) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getProgressColor = (score: number) => {
    if (score > 75) return 'bg-emerald-500';
    if (score > 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div 
      onClick={() => onClick(asset)}
      className={`group bg-white rounded-[2rem] overflow-hidden cursor-pointer border-2 transition-all duration-500 flex flex-col shadow-sm relative ${asset.isMaintenanceScheduled ? 'border-amber-400/50 grayscale-[0.3]' : 'border-slate-200 hover:border-amber-500 hover:shadow-2xl hover:-translate-y-1'}`}
    >
      {asset.isMaintenanceScheduled && (
        <div className="absolute inset-0 bg-amber-50/10 pointer-events-none z-10" />
      )}

      <div className="relative h-44 overflow-hidden bg-slate-100">
        {!imgError ? (
          <img 
            src={asset.imageUrl} 
            alt={asset.name} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 text-slate-400 gap-2">
            <Factory size={48} className="opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Stream Interrupted</span>
          </div>
        )}
        
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-20">
           {asset.isMaintenanceScheduled ? (
              <span className="px-3 py-1.5 rounded-xl text-[9px] font-black border border-amber-400 uppercase tracking-widest bg-amber-500 text-slate-900 shadow-xl animate-pulse flex items-center gap-2">
                <Wrench size={12} /> Maintenance Active
              </span>
           ) : (
             <>
              <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-widest bg-white shadow-xl flex items-center gap-1.5 ${getHealthColor(asset.healthScore)}`}>
                <HeartPulse size={12} /> {asset.healthScore}% Health
              </span>
              <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-widest shadow-xl bg-white ${getStatusClasses(priorityLevel)}`}>
                {priorityLevel} Priority
              </span>
             </>
           )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent">
          <h3 className="font-black text-white text-xl tracking-tighter leading-tight group-hover:text-amber-400 transition-colors uppercase">{asset.name}</h3>
          <p className="text-[9px] text-white/60 uppercase tracking-[0.3em] font-black mt-1.5">{asset.type}</p>
        </div>
      </div>

      <div className="p-8 space-y-8 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Health Index</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-4xl font-black tracking-tighter ${getHealthColor(asset.healthScore)}`}>{asset.healthScore}</span>
              <span className="text-[10px] text-slate-300 font-black uppercase">%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full ${getProgressColor(asset.healthScore)} transition-all duration-[1.5s] ease-out`} 
                style={{ width: `${asset.healthScore}%` }}
              />
            </div>
          </div>
          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Est. RUL</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black tracking-tighter text-slate-900">{asset.predictedRUL}</span>
              <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">DAYS</span>
            </div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Failure Threshold window</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-2xl group/sensor hover:bg-white hover:border-rose-200 transition-all">
            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
              <Thermometer size={14} className="group-hover/sensor:text-rose-500 transition-colors" />
              <span className="text-[8px] uppercase font-black tracking-tighter">TEMP</span>
            </div>
            <div className="text-xs font-black text-slate-800">{latest.temperature.toFixed(1)}°</div>
            <div className="mt-2">
              <SensorChart data={asset.sensors.map(s => s.temperature)} color="#f43f5e" />
            </div>
          </div>
          <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-2xl group/sensor hover:bg-white hover:border-blue-200 transition-all">
            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
              <Activity size={14} className="group-hover/sensor:text-blue-500 transition-colors" />
              <span className="text-[8px] uppercase font-black tracking-tighter">VIB</span>
            </div>
            <div className="text-xs font-black text-slate-800">{latest.vibration.toFixed(2)}</div>
            <div className="mt-2">
              <SensorChart data={asset.sensors.map(s => s.vibration)} color="#3b82f6" />
            </div>
          </div>
          <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-2xl group/sensor hover:bg-white hover:border-amber-200 transition-all">
            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
              <Zap size={14} className="group-hover/sensor:text-amber-500 transition-colors" />
              <span className="text-[8px] uppercase font-black tracking-tighter">AMPS</span>
            </div>
            <div className="text-xs font-black text-slate-800">{latest.current.toFixed(0)}</div>
            <div className="mt-2">
              <SensorChart data={asset.sensors.map(s => s.current)} color="#f59e0b" />
            </div>
          </div>
        </div>

        <button className={`w-full mt-auto py-4 flex items-center justify-center gap-3 text-white text-[10px] font-black uppercase tracking-widest rounded-[1.2rem] transition-all shadow-xl active:scale-95 group/btn ${asset.isMaintenanceScheduled ? 'bg-amber-500 text-slate-900 shadow-amber-500/20' : 'bg-slate-900 hover:bg-blue-600'}`}>
          {asset.isMaintenanceScheduled ? (
            <Wrench size={16} className="animate-spin-slow" />
          ) : (
            <ShieldAlert size={16} className="group-hover/btn:animate-pulse" />
          )}
          {asset.isMaintenanceScheduled ? 'Maintenance In Progress' : 'View Diagnostics'}
        </button>
      </div>
    </div>
  );
};
