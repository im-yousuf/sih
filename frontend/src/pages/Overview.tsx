import { useDigitalTwinStore } from '../store/digitalTwinStore';
import { useState, useEffect } from 'react';
import DigitalTwin3D from '../components/DigitalTwin3D';
import WellStatusPanel from '../components/WellStatusPanel';
import AIRecommendationPanel from '../components/AIRecommendationPanel';
import ScenarioSelector from '../components/ScenarioSelector';

export default function Overview() {
  const { isLoading } = useDigitalTwinStore();
  const [loadingState, setLoadingState] = useState('');

  useEffect(() => {
    if (isLoading) {
      const steps = [
        'INITIALIZING DIGITAL TWIN...',
        'LOADING RESERVOIR MODEL...',
        'LOADING WELLBORE MODEL...',
        'CONNECTING SENSOR NETWORK...',
        'LOADING AI ENGINE...',
        'SYNCHRONIZING SURFACE MODEL...',
        'DIGITAL TWIN ONLINE',
      ];
      let step = 0;
      const interval = setInterval(() => {
        if (step < steps.length) { setLoadingState(steps[step]); step++; }
        else clearInterval(interval);
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-stone-200 border-t-cyan rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-700 text-sm font-mono font-semibold tracking-widest">{loadingState}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 mb-1">Digital Twin Interface</h2>
        <p className="text-muted text-sm">Well-to-Surface Optimization Platform</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* 3D canvas */}
        <div className="col-span-8">
          <div className="h-full glass-panel rounded-xl overflow-hidden">
            <DigitalTwin3D />
          </div>
        </div>
        {/* Right panels */}
        <div className="col-span-4 space-y-4 overflow-y-auto">
          <ScenarioSelector />
          <WellStatusPanel />
          <AIRecommendationPanel />
        </div>
      </div>
    </div>
  );
}
