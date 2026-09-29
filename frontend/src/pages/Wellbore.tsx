import { useDigitalTwinStore } from '../store/digitalTwinStore';
import { useState, useMemo } from 'react';
import Wellbore3D from '../components/Wellbore3D';

const SURFACE_DEPTH_M = 0;
const TD_DEPTH_M      = 2000;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
function depthFraction(d: number) { return d / TD_DEPTH_M; }

interface DepthProps { temperature: number; pressure: number; viscosity: number; rodVelocity: number; rodDisplace: number; stress: number; }

function interpolateAtDepth(d: number, surfT: number, surfP: number): DepthProps {
  const t = depthFraction(d);
  return {
    temperature: lerp(surfT - 15, Math.max(surfT, surfT + 30), t),
    pressure:    surfP + 940 * 9.81 * d / 1000,
    viscosity:   lerp(3200, 400, t),
    rodVelocity: lerp(0.55, 0.18, t),
    rodDisplace: lerp(2.5, 0.8, t),
    stress:      lerp(12, 58, t),
  };
}

function zoneLabel(d: number): { label: string; color: string } {
  if (d < 50)   return { label: 'SURFACE / WELLHEAD', color: '#0ea5e9' };
  if (d < 600)  return { label: 'CASING SHOE ZONE',   color: '#16a34a' };
  if (d < 1100) return { label: 'INTERMEDIATE ZONE',  color: '#d97706' };
  if (d < 1400) return { label: 'PRODUCTION ZONE',    color: '#d97706' };
  if (d < 1500) return { label: 'PERFORATIONS',       color: '#dc2626' };
  return { label: 'BELOW TD', color: '#78716c' };
}

export default function Wellbore() {
  const { wellbore, telemetry } = useDigitalTwinStore();
  const [selectedDepth, setSelectedDepth] = useState(1300);
  const props = useMemo(
    () => interpolateAtDepth(selectedDepth, telemetry.temperature, telemetry.pressure),
    [selectedDepth, telemetry.temperature, telemetry.pressure],
  );
  const zone = zoneLabel(selectedDepth);

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 mb-1">Wellbore Digital Twin</h2>
        <p className="text-muted text-sm">Interactive wellbore mechanics and fluid dynamics</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-150px)]">
        <div className="col-span-8">
          <div className="h-full glass-panel rounded-xl overflow-hidden">
            <Wellbore3D selectedDepth={selectedDepth} />
          </div>
        </div>

        <div className="col-span-4 space-y-4 overflow-y-auto">
          {/* Wellbore Parameters */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Wellbore Parameters</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Depth',       value: `${wellbore.depth.toFixed(0)} m`             },
                { label: 'Casing Depth',      value: `${wellbore.casing_depth.toFixed(0)} m`      },
                { label: 'Tubing Depth',      value: `${wellbore.tubing_depth.toFixed(0)} m`      },
                { label: 'Pump Depth',        value: `${wellbore.pump_depth.toFixed(0)} m`        },
                { label: 'Perforation Depth', value: `${wellbore.perforation_depth.toFixed(0)} m` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{label}</span>
                  <span className="text-xs font-bold font-mono text-stone-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Depth Inspector */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Depth Inspector</h3>
            <div className="mb-4">
              <label className="text-xs text-muted mb-2 block">Depth (m)</label>
              <input
                type="range" min={SURFACE_DEPTH_M} max={TD_DEPTH_M} step={10}
                value={selectedDepth}
                onChange={(e) => setSelectedDepth(Number(e.target.value))}
                className="w-full accent-[#8b5a2b]"
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>0m</span>
                <span className="font-bold font-mono text-cyan">{selectedDepth}m</span>
                <span>2000m</span>
              </div>
            </div>
            {/* Zone badge */}
            <div className="flex items-center justify-center rounded-lg py-1.5 mb-3 border"
              style={{ backgroundColor: zone.color + '18', borderColor: zone.color + '50' }}>
              <span className="text-xs font-bold" style={{ color: zone.color }}>{zone.label}</span>
            </div>
            <div className="h-px bg-stone-100 mb-3" />
            <div className="space-y-2.5">
              {[
                { label: 'Temperature',     value: `${props.temperature.toFixed(1)} °C`,         color: props.temperature > 60 ? '#dc2626' : props.temperature > 50 ? '#d97706' : '#0ea5e9' },
                { label: 'Pressure',        value: `${(props.pressure / 100).toFixed(1)} MPa`,    color: '#8b5a2b' },
                { label: 'Viscosity',       value: `${Math.round(props.viscosity).toLocaleString()} cP`, color: props.viscosity > 2000 ? '#dc2626' : props.viscosity > 1000 ? '#d97706' : '#16a34a' },
                { label: 'Rod Velocity',    value: `${props.rodVelocity.toFixed(2)} m/s`,         color: '#8b5a2b' },
                { label: 'Rod Displacement',value: `${props.rodDisplace.toFixed(2)} m`,           color: '#8b5a2b' },
                { label: 'Mech. Stress',    value: `${props.stress.toFixed(1)} MPa`,              color: props.stress > 50 ? '#dc2626' : props.stress > 35 ? '#d97706' : '#16a34a' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{label}</span>
                  <span className="text-xs font-bold font-mono" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rod String Status */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Rod String Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Status</span>
                <span className="text-xs font-bold text-green">● OPERATING</span>
              </div>
              {[
                { label: 'Surface Load',      value: `${telemetry.rod_load.toFixed(1)} kN`           },
                { label: 'Surface Vibration', value: `${telemetry.surface_vibration.toFixed(2)} mm/s` },
                { label: 'SPM',               value: `${telemetry.spm.toFixed(1)}`                    },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{label}</span>
                  <span className="text-xs font-bold font-mono text-stone-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
