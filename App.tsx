
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, PriorityLevel, AssetType } from './types';
import { AssetCard } from './components/AssetCard';
import { InsightDrawer } from './components/InsightDrawer';
import { AddAssetModal } from './components/AddAssetModal';
import { LoginPage } from './components/LoginPage';
import { calculateMaintenancePriorityScore, calculatePriorityLevel, calculateFinancialRisk, calculateHealthScore } from './utils/calculators';
import { LayoutDashboard, Factory, Settings, LogOut, Search, Plus, ShieldCheck, AlertCircle, Activity, ChevronRight, Trash2, Cpu, Database, Wrench } from 'lucide-react';

type ViewType = 'dashboard' | 'assets' | 'incidents' | 'settings';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('tds_auth') === 'true';
  });
  const [user, setUser] = useState<{ name: string; role: string } | null>(() => {
    const saved = localStorage.getItem('tds_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('tds_assets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tds_assets', JSON.stringify(assets));
  }, [assets]);

  // Simulation Loop
  useEffect(() => {
    if (!isAuthenticated || assets.length === 0) return;

    const interval = setInterval(() => {
      setAssets(prev => prev.map(asset => {
        // Assets under maintenance don't degrade
        if (asset.isMaintenanceScheduled) return asset;

        const newRul = Math.max(0, asset.predictedRUL - (Math.random() > 0.99 ? 0.1 : 0));
        const lastSensor = asset.sensors[asset.sensors.length - 1];
        
        const tempDrift = (Math.random() - 0.45) * (asset.operatingLoad / 50);
        const vibDrift = (Math.random() - 0.48) * (asset.operatingLoad / 100);
        
        const newSensor = {
          ...lastSensor,
          temperature: lastSensor.temperature + tempDrift,
          vibration: Math.max(0.1, lastSensor.vibration + vibDrift),
          current: lastSensor.current + (Math.random() - 0.5) * (asset.operatingLoad / 10),
          timestamp: new Date().toISOString()
        };
        
        const newHistory = [...asset.sensors.slice(1), newSensor];
        const partialAsset = { ...asset, predictedRUL: Number(newRul.toFixed(1)), sensors: newHistory };
        const updatedHealth = calculateHealthScore(partialAsset);
        const finalAsset = { ...partialAsset, healthScore: updatedHealth };
        
        return { 
          ...finalAsset, 
          priorityScore: calculateMaintenancePriorityScore(finalAsset) 
        };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, [assets.length, isAuthenticated]);

  const handleLogin = (userData: { name: string; role: string }) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('tds_auth', 'true');
    localStorage.setItem('tds_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('tds_auth');
    localStorage.removeItem('tds_user');
  };

  const handleAddAsset = (newAsset: Asset) => {
    setAssets(prev => {
      const health = calculateHealthScore(newAsset);
      const assetWithHealth = { ...newAsset, healthScore: health };
      const finalAsset = {
        ...assetWithHealth,
        priorityScore: calculateMaintenancePriorityScore(assetWithHealth)
      };
      return [...prev, finalAsset];
    });
  };

  const handleUpdateAsset = (updatedAsset: Asset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    if (selectedAsset?.id === updatedAsset.id) {
      setSelectedAsset(updatedAsset);
    }
  };

  const handleDeleteAsset = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Confirm decommission of asset from industrial network?')) {
      setAssets(prev => prev.filter(a => a.id !== id));
      if (selectedAsset?.id === id) setSelectedAsset(null);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [assets, searchQuery]);

  const stats = useMemo(() => {
    const totalRisk = assets.reduce((sum, a) => sum + calculateFinancialRisk(a), 0);
    const criticalCount = assets.filter(a => calculatePriorityLevel(a.priorityScore) === PriorityLevel.HIGH && !a.isMaintenanceScheduled).length;
    const avgHealth = assets.length > 0 ? Math.round(assets.reduce((sum, a) => sum + a.healthScore, 0) / assets.length) : 0;
    const maintenanceCount = assets.filter(a => a.isMaintenanceScheduled).length;
    return { totalRisk, criticalCount, avgHealth, maintenanceCount };
  }, [assets]);

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="relative rounded-[2.5rem] overflow-hidden h-80 flex items-center bg-slate-900 border border-slate-800 shadow-2xl group">
        <img 
          src="https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=2000&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-[10s]" 
          alt="Industrial Automation"
        />
        <div className="relative z-10 p-12 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
             <span className="px-3 py-1 bg-amber-500 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-full">SYSTEM READY</span>
             <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Predictive AI Active</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter">
            Asset Intelligence <br/>
            <span className="text-amber-400">Control Console</span>
          </h2>
          <p className="mt-4 text-slate-300 text-lg leading-relaxed max-w-lg font-medium opacity-80">
            Real-time RUL prediction and diagnostic insights for high-value industrial machinery.
          </p>
          <div className="mt-8">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black uppercase tracking-widest text-xs px-10 py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center gap-3 active:scale-95"
            >
              <Plus size={20} /> Register Unit
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Fleet Deployment</p>
          <h4 className="text-4xl font-black text-slate-900">{assets.length} <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Units</span></h4>
          <div className="flex items-center gap-2 mt-6 text-blue-600 text-[9px] font-black uppercase tracking-widest bg-blue-50 w-fit px-2 py-1 rounded-lg">
             <Cpu size={12} /> Live Network
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm border-l-4 border-l-rose-500 hover:shadow-md transition-shadow">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Unresolved Alerts</p>
          <h4 className="text-4xl font-black text-rose-600">{stats.criticalCount}</h4>
          <div className="flex items-center gap-2 mt-6 text-rose-600 text-[9px] font-black uppercase tracking-widest bg-rose-50 w-fit px-2 py-1 rounded-lg">
            <AlertCircle size={12} /> Needs Action
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Avg Health Index</p>
          <h4 className="text-4xl font-black text-slate-900">{assets.length > 0 ? stats.avgHealth : '0'}%</h4>
          <div className="h-1.5 w-full bg-slate-100 rounded-full mt-6 overflow-hidden">
            <div className={`h-full ${stats.avgHealth > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${stats.avgHealth}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Active Repairs</p>
          <h4 className="text-4xl font-black text-slate-900">{stats.maintenanceCount}</h4>
          <div className="flex items-center gap-2 mt-6 text-amber-600 text-[9px] font-black uppercase tracking-widest bg-amber-50 w-fit px-2 py-1 rounded-lg">
            <Wrench size={12} /> Field Technicians
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 uppercase tracking-tight">
            <Activity className="text-amber-500" size={24} />
            Telemetry Matrix
          </h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Real-time predictive machinery tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter units..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 text-sm font-bold w-full md:w-80 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredAssets.length > 0 ? (
          filteredAssets.map(asset => (
            <div key={asset.id} className="relative group/card">
              <AssetCard asset={asset} onClick={(a) => setSelectedAsset(a)} />
              <button 
                onClick={(e) => handleDeleteAsset(e, asset.id)}
                className="absolute top-4 left-4 p-2.5 bg-slate-900/90 backdrop-blur-md text-white rounded-xl opacity-0 group-hover/card:opacity-100 transition-all hover:bg-rose-600 z-10 border border-white/10"
                title="Decommission Asset"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 bg-white border border-dashed border-slate-300 rounded-[3rem] flex flex-col items-center justify-center text-slate-400 space-y-8">
             <div className="p-10 bg-slate-50 rounded-[2.5rem] shadow-inner">
                <Database size={80} className="opacity-20 text-slate-900" />
             </div>
             <div className="text-center">
               <h3 className="font-black text-slate-900 uppercase tracking-tighter text-2xl mb-2">Industrial Network Offline</h3>
               <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">No active machinery detected on the local grid. Initialize a deployment to begin monitoring.</p>
             </div>
             <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-slate-900 hover:bg-amber-500 hover:text-slate-900 text-white px-12 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95 flex items-center gap-3"
             >
               <Plus size={18} /> Deploy First Asset
             </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderAssets = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-6">
          <div>
            <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tight">Fleet Inventory</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Global management of deployed machinery</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-500/10 active:scale-95"
          >
            Deploy Machine
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-6">ID Node</th>
                <th className="px-10 py-6">Identifier</th>
                <th className="px-10 py-6">Category</th>
                <th className="px-10 py-6">Health Index</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-50 cursor-pointer group transition-colors" onClick={() => setSelectedAsset(asset)}>
                  <td className="px-10 py-8 text-xs font-black text-slate-400">{asset.id}</td>
                  <td className="px-10 py-8 flex items-center gap-4">
                    <img src={asset.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm" alt="" />
                    <span className="font-black text-sm text-slate-900 tracking-tight">{asset.name}</span>
                  </td>
                  <td className="px-10 py-8">
                     <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">{asset.type}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${asset.healthScore > 75 ? 'bg-emerald-500' : asset.healthScore > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                          style={{ width: `${asset.healthScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-900">{asset.healthScore}%</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    {asset.isMaintenanceScheduled ? (
                      <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 uppercase tracking-widest">Maintenance</span>
                    ) : (
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase tracking-widest">Operational</span>
                    )}
                  </td>
                  <td className="px-10 py-8 text-right space-x-6">
                    <button className="text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-widest">Diagnose</button>
                    <button 
                      onClick={(e) => handleDeleteAsset(e, asset.id)}
                      className="text-slate-300 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderIncidents = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="grid grid-cols-1 gap-6">
        {assets.filter(a => calculatePriorityLevel(a.priorityScore) === PriorityLevel.HIGH && !a.isMaintenanceScheduled).length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[3rem] p-32 text-center shadow-sm">
            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
               <ShieldCheck size={48} className="text-emerald-500" />
            </div>
            <h3 className="font-black text-3xl text-slate-900 uppercase tracking-tight">Nominal Performance</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-4 font-medium leading-relaxed">All high-criticality assets are reporting healthy telemetry. No predictive failure alerts triggered.</p>
          </div>
        ) : (
          assets.filter(a => calculatePriorityLevel(a.priorityScore) === PriorityLevel.HIGH && !a.isMaintenanceScheduled).map(asset => (
            <div key={asset.id} className="bg-white border-l-[12px] border-l-rose-500 border border-slate-200 p-10 rounded-[2.5rem] flex items-center justify-between shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 rounded-[1.5rem] bg-rose-50 flex items-center justify-center text-rose-600 shadow-inner">
                  <AlertCircle size={40} />
                </div>
                <div>
                  <h4 className="font-black text-2xl text-slate-900 uppercase tracking-tight leading-tight">{asset.name}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded">Critical Failure window: {asset.predictedRUL} Day(s)</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial: {asset.id}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAsset(asset)}
                className="px-10 py-5 bg-slate-900 hover:bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
              >
                Immediate Diagnostic
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <header className="h-20 bg-[#0f172a] text-white flex items-center justify-between px-10 border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-black text-slate-900 text-xl shadow-lg">T</div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter leading-none uppercase">TDS <span className="text-amber-500">AssetHub</span></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Predictive Ops v4.0</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 group cursor-pointer border-r border-white/10 pr-6 mr-6">
             <div className="text-right hidden md:block">
                <p className="text-xs font-black uppercase tracking-widest text-white leading-none">{user?.name}</p>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{user?.role}</p>
             </div>
             <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 overflow-hidden group-hover:border-amber-500 transition-colors shadow-inner">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Operator'}`} alt="User Profile" />
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-20 lg:w-80 border-r border-slate-200 flex flex-col bg-white">
          <nav className="flex-1 px-6 mt-12 space-y-3">
            {[
              { icon: LayoutDashboard, label: 'Ops Dashboard', id: 'dashboard' },
              { icon: Factory, label: 'Asset Fleet', id: 'assets' },
              { icon: AlertCircle, label: 'Alert Center', id: 'incidents' },
              { icon: Settings, label: 'System Config', id: 'settings' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setCurrentView(item.id as ViewType)}
                className={`w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all relative ${currentView === item.id ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                <item.icon size={22} className={currentView === item.id ? 'text-amber-500' : ''} />
                <span className="hidden lg:block font-black text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
                {item.id === 'incidents' && stats.criticalCount > 0 && (
                  <span className="absolute top-4 right-4 w-5 h-5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {stats.criticalCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
          
          <div className="p-8 border-t border-slate-100">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
               <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live Telemetry</span>
               </div>
               <p className="text-[8px] text-slate-400 font-bold leading-tight uppercase tracking-widest">Protocol AES-256 Enabled</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12">
           <div className="mb-10 flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              <span className="hover:text-slate-600 cursor-pointer">Industrial Cluster</span>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-amber-600">{currentView}</span>
           </div>

           {currentView === 'dashboard' && renderDashboard()}
           {currentView === 'assets' && renderAssets()}
           {currentView === 'incidents' && renderIncidents()}
           {currentView === 'settings' && (
             <div className="p-16 bg-white rounded-[3rem] border border-slate-200 shadow-sm max-w-3xl">
                <h3 className="font-black uppercase tracking-tighter text-3xl">Control Parameters</h3>
                <p className="text-slate-500 mt-4 text-lg font-medium leading-relaxed">Adjust industrial thresholds for automated failure alerts and CMMS synchronization settings.</p>
                <div className="mt-12 p-8 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-400 font-medium">
                   Config portal is restricted to Level 4 Administrators only.
                </div>
             </div>
           )}
        </main>
      </div>

      <InsightDrawer asset={selectedAsset} onClose={() => setSelectedAsset(null)} onUpdateAsset={handleUpdateAsset} />
      <AddAssetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddAsset} />
    </div>
  );
};

export default App;
