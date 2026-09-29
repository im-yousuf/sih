import { useDigitalTwinStore } from '../store/digitalTwinStore';
import { Brain, ArrowRight, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function AIRecommendationPanel() {
  const { ai, telemetry } = useDigitalTwinStore();
  const [showReasoning, setShowReasoning] = useState(false);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'normal':              return 'text-green';
      case 'increasing_viscosity': return 'text-amber';
      case 'rod_float_risk':      return 'text-critical';
      case 'impact_loading_risk': return 'text-critical';
      default:                    return 'text-cyan';
    }
  };

  const getConditionBg = (condition: string) => {
    switch (condition) {
      case 'normal':              return 'bg-green/10 border-green/30';
      case 'increasing_viscosity': return 'bg-amber/10 border-amber/30';
      case 'rod_float_risk':      return 'bg-red-50 border-red-200';
      case 'impact_loading_risk': return 'bg-red-50 border-red-200';
      default:                    return 'bg-cyan/10 border-cyan/30';
    }
  };

  const getRecommendationText = (condition: string) => {
    switch (condition) {
      case 'normal':              return 'Operation optimal. Continue current settings.';
      case 'increasing_viscosity': return 'Reduce pump speed to maintain efficiency.';
      case 'rod_float_risk':      return 'Immediate SPM reduction required.';
      case 'impact_loading_risk': return 'Reduce pump speed to prevent damage.';
      default:                    return 'Monitor conditions closely.';
    }
  };

  const riskColor = (val: number, hi: number, mid: number) =>
    val > hi ? 'text-critical font-bold' : val > mid ? 'text-amber font-bold' : 'text-green font-bold';

  return (
    <div className="glass-panel rounded-xl p-4">
      {/* Header */}
      <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
        <Brain className="w-4 h-4 text-cyan flex-shrink-0" />
        AI Recommendation
      </h3>

      <div className="space-y-3">
        {/* Condition badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted font-medium">Condition</span>
          <span className={`
            text-xs font-bold px-2 py-0.5 rounded-full border
            ${getConditionColor(ai.condition)} ${getConditionBg(ai.condition)}
          `}>
            {ai.condition.toUpperCase().replace(/_/g, ' ')}
          </span>
        </div>

        {/* Confidence */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted font-medium">Confidence</span>
          <span className="text-sm font-bold font-mono text-stone-900">
            {(ai.confidence * 100).toFixed(0)}%
          </span>
        </div>

        {/* Confidence bar */}
        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan rounded-full transition-all duration-500"
            style={{ width: `${(ai.confidence * 100).toFixed(0)}%` }}
          />
        </div>

        {/* Rod Float Risk */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted font-medium">Rod Float Risk</span>
          <span className={`text-sm font-mono ${riskColor(ai.rod_float_probability, 0.7, 0.5)}`}>
            {(ai.rod_float_probability * 100).toFixed(0)}%
          </span>
        </div>

        {/* Impact Loading Risk */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted font-medium">Impact Loading Risk</span>
          <span className={`text-sm font-mono ${riskColor(ai.impact_loading_risk, 0.6, 0.4)}`}>
            {(ai.impact_loading_risk * 100).toFixed(0)}%
          </span>
        </div>

        <div className="h-px bg-stone-100" />

        {/* SPM comparison */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-stone-50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-muted font-medium mb-0.5">Current SPM</p>
            <p className="text-base font-bold font-mono text-stone-900">
              {telemetry.spm.toFixed(1)}
            </p>
          </div>
          <div className="bg-green/8 border border-green/20 rounded-lg p-2 text-center">
            <p className="text-[10px] text-muted font-medium mb-0.5">Recommended</p>
            <div className="flex items-center justify-center gap-1">
              <ArrowRight className="w-3 h-3 text-green flex-shrink-0" />
              <p className="text-base font-bold font-mono text-green">
                {ai.recommended_spm.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-stone-100" />

        {/* Advice text */}
        <p className="text-xs text-stone-600 leading-relaxed">
          {getRecommendationText(ai.condition)}
        </p>

        {/* Why button */}
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className="
            w-full py-2 px-4 rounded-lg text-sm font-semibold transition-colors
            bg-cyan/10 hover:bg-cyan/20 border border-cyan/30 text-cyan
          "
        >
          {showReasoning ? 'Hide Reasoning' : 'WHY?'}
        </button>

        {/* Physics reasoning */}
        {showReasoning && (
          <div className="space-y-2 mt-1 p-3 bg-stone-50 border border-stone-200 rounded-lg">
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-2">
              Physics Evidence
            </p>
            {ai.reasoning.map((reason, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-green mt-0.5 flex-shrink-0" />
                <span className="text-xs text-stone-600">{reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
