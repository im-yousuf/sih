/**
 * SupervisorDashboard — fleet command center with tabbed navigation.
 *
 * Tabs:
 *   Fleet View       — live well cards + alert feed (existing)
 *   User Management  — CRUD for Well Incharge accounts (new)
 */

import { useState, useEffect }  from 'react';
import { useNavigate }          from 'react-router-dom';
import { useAuthStore }         from '../store/authStore';
import {
  Activity, Zap, AlertTriangle, ChevronRight,
  LogOut, Gauge, Droplets, Thermometer, Layers, Users,
} from 'lucide-react';
import UserManagementPanel from '../components/UserManagementPanel';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FleetWell {
  id:          string;
  name:        string;
  status:      'optimal' | 'warning' | 'alert' | 'offline';
  production:  number;
  temperature: number;
  spm:         number;
  energy:      number;
  alerts:      number;
  lastUpdated: string;
}
interface FleetAlert {
  wellId:    string;
  wellName:  string;
  severity:  'CRITICAL' | 'HIGH' | 'MEDIUM';
  message:   string;
  time:      string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_WELLS: FleetWell[] = [
  { id:'well-12', name:'BW-12', status:'optimal', production:42,  temperature:58, spm:5.0, energy:44.2, alerts:0, lastUpdated:'2s ago'  },
  { id:'well-13', name:'BW-13', status:'warning', production:31,  temperature:48, spm:4.5, energy:51.7, alerts:1, lastUpdated:'4s ago'  },
  { id:'well-14', name:'BW-14', status:'alert',   production:18,  temperature:41, spm:5.0, energy:62.3, alerts:3, lastUpdated:'2s ago'  },
  { id:'well-15', name:'BW-15', status:'optimal', production:47,  temperature:61, spm:3.5, energy:38.9, alerts:0, lastUpdated:'6s ago'  },
  { id:'well-16', name:'BW-16', status:'warning', production:27,  temperature:46, spm:4.0, energy:49.1, alerts:2, lastUpdated:'3s ago'  },
  { id:'well-17', name:'BW-17', status:'offline', production:0,   temperature:38, spm:0.0, energy:0.0,  alerts:1, lastUpdated:'8m ago'  },
];
const MOCK_ALERTS: FleetAlert[] = [
  { wellId:'well-14', wellName:'BW-14', severity:'CRITICAL', message:'Rod float probability 87% — reduce SPM immediately',       time:'1m ago'  },
  { wellId:'well-14', wellName:'BW-14', severity:'HIGH',     message:'Reservoir cooling — temperature 41°C, viscosity rising',   time:'3m ago'  },
  { wellId:'well-14', wellName:'BW-14', severity:'MEDIUM',   message:'Energy consumption 24% above target (62.3 kW)',            time:'5m ago'  },
  { wellId:'well-13', wellName:'BW-13', severity:'HIGH',     message:'Reservoir temperature below 50°C — schedule CSS cycle',   time:'7m ago'  },
  { wellId:'well-16', wellName:'BW-16', severity:'HIGH',     message:'Surface vibration elevated — check rod guides',            time:'12m ago' },
  { wellId:'well-16', wellName:'BW-16', severity:'MEDIUM',   message:'Pump efficiency dropped to 71%',                           time:'18m ago' },
  { wellId:'well-17', wellName:'BW-17', severity:'HIGH',     message:'Well offline — communication lost',                        time:'8m ago'  },
];

// ─── Visual config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  optimal: { label:'OPTIMAL', dotCls:'bg-green',    ringCls:'border-green/30',  bgCls:'bg-green/5',  textCls:'text-green'    },
  warning: { label:'WARNING', dotCls:'bg-amber',    ringCls:'border-amber/30',  bgCls:'bg-amber/5',  textCls:'text-amber'    },
  alert:   { label:'ALERT',   dotCls:'bg-red-500',  ringCls:'border-red-300',   bgCls:'bg-red-50',   textCls:'text-red-600'  },
  offline: { label:'OFFLINE', dotCls:'bg-stone-400',ringCls:'border-stone-300', bgCls:'bg-stone-50', textCls:'text-stone-500'},
} as const;

const SEV_CFG = {
  CRITICAL: { bgCls:'bg-red-50',   borderCls:'border-red-300',   textCls:'text-red-600'   },
  HIGH:     { bgCls:'bg-amber/8',  borderCls:'border-amber/30',  textCls:'text-amber'     },
  MEDIUM:   { bgCls:'bg-stone-50', borderCls:'border-stone-200', textCls:'text-stone-600' },
} as const;

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, unit, sub, accent }: {
  icon: React.ElementType; label: string; value: string | number;
  unit: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 flex items-start gap-4">
      <div
        className="p-3 rounded-xl flex-shrink-0 border"
        style={
          accent
            ? { backgroundColor: 'rgba(139,90,43,0.08)', borderColor: 'rgba(139,90,43,0.2)' }
            : { backgroundColor: '#f3f4f6',              borderColor: '#e5e7eb'              }
        }
      >
        <Icon className="w-5 h-5" style={{ color: accent ? '#8b5a2b' : '#6b7280' }} />
      </div>
      <div>
        <p className="text-xs text-stone-500 font-semibold tracking-wider mb-1 uppercase">{label}</p>
        <p className="text-2xl font-bold text-stone-900 font-mono">
          {value}<span className="text-sm font-normal text-stone-500 ml-1">{unit}</span>
        </p>
        {sub && <p className="text-xs text-stone-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Well card ────────────────────────────────────────────────────────────────
function WellCard({ well, onClick }: { well: FleetWell; onClick: () => void }) {
  const cfg = STATUS_CFG[well.status];
  return (
    <button
      onClick={onClick}
      className={`
        bg-white border rounded-xl p-5 text-left shadow-sm
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full
        ${cfg.ringCls} ${cfg.bgCls}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotCls} ${well.status === 'optimal' ? 'animate-pulse' : ''}`} />
          <span className="font-bold text-stone-900 text-base">{well.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${cfg.textCls} ${cfg.ringCls}`}>
            {cfg.label}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Droplets,    label:'Production', value: well.status === 'offline' ? '—' : `${well.production}`, unit:'BOPD' },
          { icon: Thermometer, label:'Temp',       value: `${well.temperature}`,                                   unit:'°C'  },
          { icon: Gauge,       label:'SPM',        value: `${well.spm.toFixed(1)}`,                                unit:'spm' },
          { icon: Zap,         label:'Energy',     value: well.status === 'offline' ? '—' : `${well.energy}`,      unit:'kW'  },
        ].map(({ icon: Icon, label, value, unit }) => (
          <div key={label} className="bg-stone-50 border border-stone-200 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className="w-3 h-3 text-stone-400" />
              <span className="text-[10px] text-stone-500 font-medium">{label}</span>
            </div>
            <span className="text-sm font-bold font-mono text-stone-900">
              {value}<span className="text-[10px] text-stone-500 ml-1">{unit}</span>
            </span>
          </div>
        ))}
      </div>

      {well.alerts > 0 ? (
        <div className="mt-3 flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-red-500" />
          <span className="text-xs text-red-600 font-medium">{well.alerts} active alert{well.alerts > 1 ? 's' : ''}</span>
          <span className="ml-auto text-[10px] text-stone-400">{well.lastUpdated}</span>
        </div>
      ) : (
        <div className="mt-3 text-right text-[10px] text-stone-400">{well.lastUpdated}</div>
      )}
    </button>
  );
}

// ─── Tab definition ───────────────────────────────────────────────────────────
type Tab = 'fleet' | 'users';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'fleet', label: 'Fleet View',       icon: Activity },
  { id: 'users', label: 'User Management',  icon: Users    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>('fleet');
  const [wells,     setWells]     = useState<FleetWell[]>(MOCK_WELLS);
  const [alerts]                  = useState<FleetAlert[]>(MOCK_ALERTS);

  // Live fluctuations every 4 s
  useEffect(() => {
    const id = setInterval(() => {
      setWells((prev) => prev.map((w) => {
        if (w.status === 'offline') return w;
        const d = (Math.random() - 0.5) * 0.4;
        return {
          ...w,
          production:  Math.max(1,  parseFloat((w.production  + d * 2.0).toFixed(1))),
          temperature: Math.max(35, parseFloat((w.temperature + d * 0.3).toFixed(1))),
          energy:      Math.max(10, parseFloat((w.energy      + d * 1.5).toFixed(1))),
          lastUpdated: 'just now',
        };
      }));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const totalProduction = wells.reduce((s, w) => s + w.production, 0);
  const totalEnergy     = wells.reduce((s, w) => s + w.energy,     0);
  const criticalCount   = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const activeWells     = wells.filter((w) => w.status !== 'offline').length;

  return (
    <div className="min-h-screen bg-[#faf8f5]">

      {/* ── Top nav ───────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center border"
              style={{ backgroundColor: 'rgba(139,90,43,0.1)', borderColor: 'rgba(139,90,43,0.25)' }}
            >
              <Layers className="w-4 h-4" style={{ color: '#8b5a2b' }} />
            </div>
            <span className="font-extrabold tracking-widest text-sm" style={{ color: '#8b5a2b' }}>
              BAGHEWALA FIELD OPS
            </span>
            <span className="text-stone-300 text-xs select-none">|</span>
            <span className="text-stone-500 text-xs font-medium">SUPERVISOR DASHBOARD</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span className="text-xs text-stone-500">{activeWells}/{wells.length} wells online</span>
            </div>
            <span className="text-xs text-stone-700 border border-stone-200 rounded-lg px-2.5 py-1 font-medium bg-stone-50">
              {user?.name}
            </span>
            <button
              onClick={() => { logout(); navigate('/login', { replace: true }); }}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Field Command Center</h1>
          <p className="text-stone-500 text-sm mt-1">
            Baghewala Heavy Oil Field · Rajasthan, India · Real-time monitoring
          </p>
        </div>

        {/* KPI strip — always visible */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard icon={Droplets}      label="TOTAL FIELD PRODUCTION"   value={totalProduction.toFixed(0)} unit="BOPD"   sub={`${activeWells} producing wells`}                                         accent />
          <KpiCard icon={Zap}           label="FIELD ENERGY CONSUMPTION" value={totalEnergy.toFixed(1)}     unit="kW"     sub={`${(totalEnergy / Math.max(totalProduction, 1) * 1000).toFixed(0)} Wh/bbl`} />
          <KpiCard icon={AlertTriangle} label="ACTIVE CRITICAL ALERTS"   value={criticalCount}               unit="alerts" sub={`${alerts.length} total across all wells`} />
        </div>

        {/* ── Tab bar ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1 w-fit shadow-sm">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                  transition-all duration-150
                  ${active
                    ? 'text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'}
                `}
                style={active ? { backgroundColor: '#8b5a2b' } : {}}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ─────────────────────────────────────────────── */}

        {/* Fleet View */}
        {activeTab === 'fleet' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Well grid — 2/3 */}
            <div className="xl:col-span-2 space-y-3">
              <h2 className="text-xs font-extrabold tracking-widest uppercase" style={{ color: '#8b5a2b' }}>
                Fleet View
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wells.map((w) => (
                  <WellCard
                    key={w.id}
                    well={w}
                    onClick={() => navigate(`/well/${w.id}/overview`)}
                  />
                ))}
              </div>
            </div>

            {/* Alert feed — 1/3 */}
            <div className="space-y-3">
              <h2 className="text-xs font-extrabold tracking-widest uppercase flex items-center gap-2" style={{ color: '#8b5a2b' }}>
                Alert Feed
                {criticalCount > 0 && (
                  <span className="text-[10px] bg-red-100 text-red-600 border border-red-200 rounded-full px-2 py-0.5 font-bold">
                    {criticalCount} CRITICAL
                  </span>
                )}
              </h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                {alerts.map((alert, i) => {
                  const cfg = SEV_CFG[alert.severity];
                  return (
                    <button
                      key={i}
                      onClick={() => navigate(`/well/${alert.wellId}/overview`)}
                      className={`
                        w-full text-left rounded-xl p-3 border shadow-sm
                        hover:shadow-md transition-shadow
                        ${cfg.bgCls} ${cfg.borderCls}
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-extrabold tracking-wider ${cfg.textCls}`}>
                          {alert.severity}
                        </span>
                        <span className="text-[10px] text-stone-400">{alert.time}</span>
                      </div>
                      <p className="text-xs font-bold text-stone-900 mb-1">{alert.wellName}</p>
                      <p className="text-xs text-stone-500 leading-snug">{alert.message}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* User Management */}
        {activeTab === 'users' && <UserManagementPanel />}

        <p className="text-xs text-stone-400 text-center pb-4">
          {activeTab === 'fleet'
            ? 'Data refreshes every 4 s · Click any well card to open its Digital Twin'
            : 'Changes are saved instantly · New accounts can log in immediately'}
        </p>
      </main>
    </div>
  );
}
