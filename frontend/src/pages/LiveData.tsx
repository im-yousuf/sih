import { useDigitalTwinStore } from '../store/digitalTwinStore';
import { useState, useEffect, useRef } from 'react';
import RealTimeChart from '../components/RealTimeChart';
import { apiService } from '../services/api';

export default function LiveData() {
  const { telemetry, isConnected } = useDigitalTwinStore();
  const [chartData, setChartData] = useState<any[]>([]);
  // Keep a ref to the latest telemetry so the interval closure always
  // reads the freshest value without needing to be re-registered.
  const telemetryRef = useRef(telemetry);
  useEffect(() => { telemetryRef.current = telemetry; }, [telemetry]);

  // Seed steam_injection_rate from CSS endpoint and merge into telemetry snapshots
  const [steamRate, setSteamRate] = useState<number>(0);
  const steamRateRef = useRef(steamRate);
  useEffect(() => { steamRateRef.current = steamRate; }, [steamRate]);

  // Poll CSS state for steam_injection_rate every 4 s
  useEffect(() => {
    const fetchSteam = async () => {
      try {
        const css = await apiService.getCSSState();
        setSteamRate(css.steam_injection_rate ?? 0);
      } catch (_) { /* ignore */ }
    };
    fetchSteam();
    const id = setInterval(fetchSteam, 4000);
    return () => clearInterval(id);
  }, []);

  // Append a new chart point every 2 s (matches WS cadence)
  useEffect(() => {
    const id = setInterval(() => {
      const t = telemetryRef.current;
      const point = {
        timestamp:            new Date().toISOString(),
        temperature:          t.temperature,
        pressure:             t.pressure,
        flow_rate:            t.flow_rate,
        spm:                  t.spm,
        rod_load:             t.rod_load,
        surface_vibration:    t.surface_vibration,
        motor_load:           t.motor_load,
        vfd_frequency:        t.vfd_frequency,
        // prefer the field already on telemetry (backend sends it via WS)
        // fall back to the CSS-polled value
        steam_injection_rate: (t as any).steam_injection_rate ?? steamRateRef.current,
      };
      setChartData(prev => [...prev.slice(-59), point]);
    }, 2000);
    return () => clearInterval(id);
  }, []); // empty deps — uses refs only

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">REAL-TIME TELEMETRY</h2>
        <p className="text-muted">Live sensor data streaming</p>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green animate-pulse' : 'bg-critical'}`} />
          <span className="text-sm text-muted">
            SENSOR NETWORK {isConnected ? '● CONNECTED' : '● DISCONNECTED'}
          </span>
        </div>
        <div className="text-sm text-muted">24/24 SENSORS ONLINE</div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <RealTimeChart title="Reservoir Temperature" data={chartData} dataKey="temperature"       unit="°C"   color="#0284c7" />
        <RealTimeChart title="Wellbore Pressure"     data={chartData} dataKey="pressure"           unit="kPa"  color="#16a34a" />
        <RealTimeChart title="Flow Rate (Darcy)"     data={chartData} dataKey="flow_rate"          unit="m³/d" color="#d97706" />
        <RealTimeChart title="SPM"                   data={chartData} dataKey="spm"                unit="spm"  color="#7c3aed" />
        <RealTimeChart title="Rod Load"              data={chartData} dataKey="rod_load"           unit="kN"   color="#dc2626" />
        <RealTimeChart title="Surface Vibration"     data={chartData} dataKey="surface_vibration"  unit="mm/s" color="#ea580c" />
        <RealTimeChart title="Motor Load"            data={chartData} dataKey="motor_load"         unit="kW"   color="#0891b2" />
        <RealTimeChart title="VFD Frequency"         data={chartData} dataKey="vfd_frequency"      unit="Hz"   color="#8b5a2b" />
        <RealTimeChart title="Steam Injection Rate"  data={chartData} dataKey="steam_injection_rate" unit="t/d" color="#be185d" />
      </div>
    </div>
  );
}
