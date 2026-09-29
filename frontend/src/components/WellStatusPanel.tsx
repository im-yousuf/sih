import { useDigitalTwinStore } from '../store/digitalTwinStore';
import { Activity, Thermometer, Gauge, Droplets, Zap } from 'lucide-react';

export default function WellStatusPanel() {
  const { telemetry, reservoir } = useDigitalTwinStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRODUCING': return 'text-green';
      case 'WARNING':   return 'text-amber';
      case 'CRITICAL':  return 'text-critical';
      default:          return 'text-cyan';
    }
  };

  const getAlertLevel = (value: number, threshold: number) => {
    if (value > threshold * 1.2) return 'critical';
    if (value > threshold)       return 'warning';
    return 'normal';
  };

  return (
    <div className="glass-panel rounded-xl p-4">
      {/* Header */}
      <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
        <Activity className="w-4 h-4 text-cyan flex-shrink-0" />
        Well Status
      </h3>

      <div className="space-y-3">
        {/* Overall status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted font-medium">Status</span>
          <span className={`text-sm font-bold ${getStatusColor('PRODUCING')}`}>
            ● PRODUCING
          </span>
        </div>

        <div className="h-px bg-stone-100" />

        {/* Temperature */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-cyan flex-shrink-0" />
            <span className="text-xs text-muted font-medium">Temperature</span>
          </div>
          <span className="text-sm font-bold font-mono text-stone-900">
            {reservoir.current_temperature.toFixed(1)}°C
          </span>
        </div>

        {/* Pressure */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan flex-shrink-0" />
            <span className="text-xs text-muted font-medium">Pressure</span>
          </div>
          <span className="text-sm font-bold font-mono text-stone-900">
            {telemetry.pressure.toFixed(1)} kPa
          </span>
        </div>

        {/* Flow Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan flex-shrink-0" />
            <span className="text-xs text-muted font-medium">Flow Rate</span>
          </div>
          <span className="text-sm font-bold font-mono text-stone-900">
            {telemetry.flow_rate.toFixed(1)} m³/d
          </span>
        </div>

        {/* SPM */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted font-medium">SPM</span>
          <span className="text-sm font-bold font-mono text-stone-900">
            {telemetry.spm.toFixed(1)}
          </span>
        </div>

        {/* Rod Load */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted font-medium">Rod Load</span>
          <span className="text-sm font-bold font-mono text-stone-900">
            {telemetry.rod_load.toFixed(1)} kN
          </span>
        </div>

        {/* Vibration — colour-coded by alert level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan flex-shrink-0" />
            <span className="text-xs text-muted font-medium">Vibration</span>
          </div>
          <span className={`text-sm font-bold font-mono ${
            getAlertLevel(telemetry.surface_vibration, 2.0) === 'critical' ? 'text-critical' :
            getAlertLevel(telemetry.surface_vibration, 2.0) === 'warning'  ? 'text-amber'    :
            'text-stone-900'
          }`}>
            {telemetry.surface_vibration.toFixed(2)} mm/s
          </span>
        </div>

        <div className="h-px bg-stone-100" />

        {/* Steam Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted font-medium">Steam Status</span>
          <span className="text-sm font-bold text-green">● ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
