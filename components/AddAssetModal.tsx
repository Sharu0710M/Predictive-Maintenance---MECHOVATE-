
import React, { useState } from 'react';
import { AssetType, Asset, SensorData } from '../types';
import { X, Plus, Factory, Settings2, Info } from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: Asset) => void;
}

const TYPE_IMAGES: Record<AssetType, string> = {
  [AssetType.PUMP]: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
  [AssetType.TURBINE]: 'https://images.unsplash.com/photo-1542156822-6924d1a71aba?q=80&w=1200&auto=format&fit=crop',
  [AssetType.MOTOR]: 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?q=80&w=1200&auto=format&fit=crop',
};

export const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>(AssetType.PUMP);
  const [criticality, setCriticality] = useState(5);
  const [downtimeCost, setDowntimeCost] = useState(1000);
  const [load, setLoad] = useState(50);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseHistory: SensorData[] = Array.from({ length: 20 }, (_, i) => ({
      temperature: (type === AssetType.TURBINE ? 150 : 40) + Math.random() * 10,
      vibration: 1.5 + Math.random() * 1,
      current: (type === AssetType.MOTOR ? 40 : 100) + Math.random() * 20,
      timestamp: new Date(Date.now() - (19 - i) * 3600000).toISOString()
    }));

    const newAsset: Asset = {
      id: `USR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name: name || `New ${type}`,
      type,
      imageUrl: TYPE_IMAGES[type],
      criticality,
      operatingLoad: load,
      baseHourlyDowntimeCost: downtimeCost,
      sensors: baseHistory,
      predictedRUL: 90, 
      healthScore: 100,
      priorityScore: 0,
    };

    onAdd(newAsset);
    onClose();
    setName('');
    setType(AssetType.PUMP);
    setCriticality(5);
    setDowntimeCost(1000);
    setLoad(50);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Factory className="text-slate-900" size={20} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Register Unit</h3>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1">TDS Deployment Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form id="add-asset-form" onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 md:space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Settings2 size={14} className="text-amber-500" /> Asset Identifier Name
              </label>
              <input 
                required
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Centrifugal Intake P-302"
                className="w-full px-5 py-3 md:px-6 md:py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-bold text-slate-700 placeholder:font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Asset Category</label>
                <select 
                  value={type}
                  onChange={e => setType(e.target.value as AssetType)}
                  className="w-full px-6 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 appearance-none font-bold text-slate-700 cursor-pointer"
                >
                  <option value={AssetType.PUMP}>Centrifugal Pump</option>
                  <option value={AssetType.TURBINE}>Gas Turbine</option>
                  <option value={AssetType.MOTOR}>Induction Motor</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Criticality Rank (1-10)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="1" max="10" step="1"
                    value={criticality}
                    onChange={e => setCriticality(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-sm text-white border border-slate-800">{criticality}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                   Downtime Impact ($/HR)
                </label>
                <input 
                  required
                  type="number" 
                  value={downtimeCost}
                  onChange={e => setDowntimeCost(parseInt(e.target.value))}
                  className="w-full px-6 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 font-bold text-slate-700"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Operating Load (%)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="0" max="100" step="5"
                    value={load}
                    onChange={e => setLoad(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="w-14 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-700 border border-slate-200">{load}%</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 p-4 md:p-5 rounded-2xl flex gap-4">
              <Info className="text-amber-600 shrink-0" size={20} />
              <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                Registering this asset will initiate real-time telemetry streaming and automated <span className="font-black">RUL Prediction</span> algorithms. Data samples are generated at 4-second intervals.
              </p>
            </div>
          </form>
        </div>

        <div className="p-6 md:p-8 border-t border-slate-100 bg-white shrink-0">
          <div className="flex flex-col md:flex-row gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50 transition-all order-2 md:order-1"
            >
              Cancel
            </button>
            <button 
              form="add-asset-form"
              type="submit"
              className="flex-1 py-4 px-6 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group order-1 md:order-2"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform" /> 
              Initialize Unit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
