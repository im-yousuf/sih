import { useDigitalTwinStore } from '../store/digitalTwinStore';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Play, RotateCcw, Loader2, Sparkles } from 'lucide-react';

const BASELINE = {
  steam_volume:        500,
  steam_injection_rate:100,
  injection_pressure:  8,
  target_temperature:  180,
  injection_duration:  5,
  soak_duration:       5,
  production_duration: 30,
  steam_oil_ratio:     3.5,
  cycle_production:    150,
  oil_recovery:        12.5,
  energy_per_barrel:   2.1,
};

const OPTIMISED = {
  steam_volume:         420,
  steam_injection_rate:  85,
  injection_pressure:    7.2,
  target_temperature:   175,
  injection_duration:    4,
  soak_duration:         7,
  production_duration:   35,
  steam_oil_ratio:       2.8,
  cycle_production:     165,
  oil_recovery:         13.8,
  energy_per_barrel:    1.76,
};

export default function CSSControl() {
  const { telemetry } = useDigitalTwinStore();
  const addAlert = useNotificationStore((s) => s.addAlert);
  const user     = useAuthStore((s) => s.user);
  const params   = useParams<{ wellId?: string }>();
  const wellId   = params.wellId ?? user?.assignedWellId ?? 'well-14';

  const [params_, setParams] = useState({ ...BASELINE });
  const set = (key: keyof typeof BASELINE) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setParams((p) => ({ ...p, [key]: Number(e.target.value) }));

  const [perf, setPerf] = useState({
    steam_oil_ratio:   BASELINE.steam_oil_ratio,
    cycle_production:  BASELINE.cycle_production,
    oil_recovery:      BASELINE.oil_recovery,
    energy_per_barrel: BASELINE.energy_per_barrel,
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimized,    setOptimized]    = useState(false);

  const runOptimization = () => {
    setIsOptimizing(true);
    setOptimized(false);
    setTimeout(() => {
      setParams({ ...OPTIMISED });
      setPerf({
        steam_oil_ratio:   OPTIMISED.steam_oil_ratio,
        cycle_production:  OPTIMISED.cycle_production,
        oil_recovery:      OPTIMISED.oil_recovery,
        energy_per_barrel: OPTIMISED.energy_per_barrel,
      });
      setIsOptimizing(false);
      setOptimized(true);
      addAlert({
        wellId, type: 'info',
        message:   'CSS Cycle AI Optimization Complete. SOR improved by 20% (3.5 → 2.8). Cycle production increased to 165 m³.',
        parameter: 'css_optimization',
        timestamp: new Date().toISOString(),
      });
    }, 1500);
  };

  const resetToBaseline = () => {
    setParams({ ...BASELINE });
    setPerf({ steam_oil_ratio: BASELINE.steam_oil_ratio, cycle_production: BASELINE.cycle_production, oil_recovery: BASELINE.oil_recovery, energy_per_barrel: BASELINE.energy_per_barrel });
    setOptimized(false);
  };

  const inputCls = `w-full bg-white border border-stone-200 rounded-lg px-4 py-2
    text-stone-900 text-sm focus:outline-none focus:border-cyan/60
    focus:ring-1 focus:ring-cyan/20 transition-colors`;

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 mb-1">CSS Optimization</h2>
        <p className="text-muted text-sm">Cyclic Steam Stimulation control and optimization</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-150px)]">

        {/* ── Left column ─────────────────────────────────────────────── */}
        <div className="col-span-8 space-y-4 overflow-y-auto scrollbar-hide">

          {/* Cycle status */}
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-sm font-bold text-stone-900 mb-4 uppercase tracking-wide">Current Cycle Status</h3>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: 'INJECTION',  status: 'COMPLETE', statusColor: 'text-green',  note: 'Cycle 5'          },
                { label: 'SOAK',       status: 'ACTIVE',   statusColor: 'text-amber',  note: 'Day 3 of 5'       },
                { label: 'PRODUCTION', status: 'READY',    statusColor: 'text-cyan',   note: 'Scheduled: Day 6' },
              ].map(({ label, status, statusColor, note }) => (
                <div key={label} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted font-medium">{label}</span>
                    <span className={`text-xs font-bold ${statusColor}`}>● {status}</span>
                  </div>
                  <p className="text-sm text-stone-600">{note}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
              <p className="text-xs text-muted font-medium mb-4 uppercase tracking-wide">Cycle Timeline</p>
              <div className="space-y-3">
                {[
                  { label: 'INJECTION',  fill: 'w-full', color: 'bg-green',  track: 'bg-green/20',  display: `${params_.injection_duration} days`  },
                  { label: 'SOAK',       fill: 'w-3/5',  color: 'bg-amber',  track: 'bg-amber/20',  display: `3/${params_.soak_duration} days`     },
                  { label: 'PRODUCTION', fill: 'w-0',    color: 'bg-cyan',   track: 'bg-cyan/20',   display: `${params_.production_duration} days` },
                ].map(({ label, fill, color, track, display }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-muted font-medium">{label}</div>
                    <div className={`flex-1 h-3 ${track} rounded-full relative overflow-hidden`}>
                      <div className={`absolute inset-y-0 left-0 ${fill} ${color} rounded-full`} />
                    </div>
                    <div className="w-20 text-xs font-mono font-semibold text-stone-700 text-right">{display}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">CSS Parameters</h3>
              {optimized && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-green bg-green/10 border border-green/30 rounded-full px-3 py-1">
                  <Sparkles className="w-3 h-3" /> AI OPTIMIZED
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Steam Volume (tons)',       key: 'steam_volume'         },
                { label: 'Injection Rate (t/d)',      key: 'steam_injection_rate' },
                { label: 'Injection Pressure (MPa)',  key: 'injection_pressure'   },
                { label: 'Target Temperature (°C)',   key: 'target_temperature'   },
                { label: 'Injection Duration (days)', key: 'injection_duration'   },
                { label: 'Soak Duration (days)',      key: 'soak_duration'        },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-xs text-muted mb-1.5 block font-medium">{label}</label>
                  <input type="number" value={params_[key as keyof typeof BASELINE]}
                    onChange={set(key as keyof typeof BASELINE)} className={inputCls} />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-xs text-muted mb-1.5 block font-medium">Production Duration (days)</label>
                <input type="number" value={params_.production_duration}
                  onChange={set('production_duration')} className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={runOptimization} disabled={isOptimizing}
                className="flex-1 py-3 px-4 bg-[#8b5a2b] hover:bg-[#7a4f26] border border-[#7a4f26] rounded-xl text-white font-bold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {isOptimizing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Optimizing…</span></>
                  : <><Play className="w-4 h-4" /><span>RUN OPTIMIZATION</span></>}
              </button>
              <button onClick={resetToBaseline} disabled={isOptimizing} title="Reset"
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-stone-600 transition-colors disabled:opacity-60">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <div className="col-span-4 space-y-4">

          {/* KPIs */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-4 uppercase tracking-wide">CSS Performance</h3>
            <div className="space-y-3">
              {[
                { label: 'Steam-Oil Ratio',  value: perf.steam_oil_ratio.toFixed(1),      baseline: BASELINE.steam_oil_ratio,   lowerIsBetter: true  },
                { label: 'Cycle Production', value: `${perf.cycle_production} m³`,         baseline: BASELINE.cycle_production,  lowerIsBetter: false },
                { label: 'Oil Recovery',     value: `${perf.oil_recovery.toFixed(1)}%`,    baseline: BASELINE.oil_recovery,      lowerIsBetter: false },
                { label: 'Energy/Barrel',    value: `${perf.energy_per_barrel.toFixed(2)} GJ`, baseline: BASELINE.energy_per_barrel, lowerIsBetter: true },
              ].map(({ label, value, baseline, lowerIsBetter }) => {
                const num      = parseFloat(value);
                const improved = lowerIsBetter ? num < baseline : num > baseline;
                return (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-muted">{label}</span>
                    <span className={`text-xs font-bold font-mono ${optimized && improved ? 'text-green' : 'text-stone-900'}`}>{value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sync info */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">CSS + SRP Synchronization</h3>
            <div className="space-y-2 text-xs text-muted">
              <p>STEAM INJECTION → RESERVOIR HEATING → VISCOSITY REDUCTION → FLUID MOBILITY → SRP PERFORMANCE</p>
              <div className="h-px bg-stone-100" />
              <p>RESERVOIR COOLING → VISCOSITY INCREASE → ROD RESISTANCE → ROD FLOAT RISK → SRP OPTIMIZATION</p>
            </div>
          </div>

          {/* Current SPM */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Current SPM</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Current</span>
                <span className="text-lg font-bold font-mono text-stone-900">{telemetry.spm.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">AI Target</span>
                <span className="text-lg font-bold font-mono text-green">3.5</span>
              </div>
              <div className="h-px bg-stone-100" />
              <p className="text-xs text-muted leading-relaxed">During cooling phase, reduce SPM to maintain efficiency and reduce rod float risk</p>
            </div>
          </div>

          {/* Historical cycles */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Historical Cycles</h3>
            <div className="space-y-2">
              {[
                { cycle: 4, production: 145, sor: 3.6 },
                { cycle: 3, production: 138, sor: 3.8 },
                { cycle: 2, production: 132, sor: 4.0 },
                { cycle: 1, production: 125, sor: 4.2 },
              ].map(({ cycle, production, sor }) => (
                <div key={cycle} className="flex items-center justify-between text-xs">
                  <span className="text-muted">Cycle {cycle}</span>
                  <div className="flex gap-4">
                    <span className="font-bold font-mono text-stone-900">{production} m³</span>
                    <span className="text-muted">SOR: {sor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
