/**
 * ScenarioSelector — demo scenario buttons (light theme).
 */

import { useDigitalTwinStore } from '../store/digitalTwinStore';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { FlaskConical, CheckCircle, AlertTriangle, Zap, LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

type ScenarioId =
  | 'normal'
  | 'cooling'
  | 'high_viscosity'
  | 'rod_float'
  | 'impact_loading'
  | 'optimized';

interface ScenarioDef {
  id:    ScenarioId;
  icon:  LucideIcon;
  color: 'green' | 'cyan' | 'amber' | 'critical';
}

const SCENARIOS: ScenarioDef[] = [
  { id: 'normal',         icon: CheckCircle,   color: 'green'    },
  { id: 'cooling',        icon: FlaskConical,  color: 'cyan'     },
  { id: 'high_viscosity', icon: AlertTriangle, color: 'amber'    },
  { id: 'rod_float',      icon: AlertTriangle, color: 'critical' },
  { id: 'impact_loading', icon: Zap,           color: 'critical' },
  { id: 'optimized',      icon: CheckCircle,   color: 'green'    },
];

const SCENARIO_ALERTS: Partial<Record<ScenarioId, {
  type:      'critical' | 'warning';
  message:   string;
  parameter: string;
}>> = {
  rod_float: {
    type:      'critical',
    message:   'ROD FLOAT DETECTED — downstroke fluid load insufficient. Reduce SPM immediately.',
    parameter: 'rod_float_probability',
  },
  impact_loading: {
    type:      'critical',
    message:   'IMPACT LOADING PREDICTED — possible gas void in pump barrel. Reduce SPM.',
    parameter: 'impact_loading_risk',
  },
  high_viscosity: {
    type:      'warning',
    message:   'HIGH VISCOSITY ALERT — reservoir temperature declining, fluid resistance elevated.',
    parameter: 'viscosity',
  },
};

// Tailwind classes per colour variant
const ICON_CLASS: Record<string, string> = {
  green:    'text-green',
  cyan:     'text-cyan',
  amber:    'text-amber',
  critical: 'text-critical',
};

const ACTIVE_BG: Record<string, string> = {
  green:    'bg-green/10  border-green/30',
  cyan:     'bg-cyan/10   border-cyan/30',
  amber:    'bg-amber/10  border-amber/30',
  critical: 'bg-red-50    border-red-200',
};

export default function ScenarioSelector() {
  const { t } = useTranslation();
  const { currentScenario, setScenario } = useDigitalTwinStore();
  const addAlert = useNotificationStore((s) => s.addAlert);
  const user     = useAuthStore((s) => s.user);
  const params   = useParams<{ wellId?: string }>();
  const [isApplying, setIsApplying] = useState(false);

  const wellId = params.wellId ?? user?.assignedWellId ?? 'well-14';

  const applyScenario = async (id: ScenarioId) => {
    setIsApplying(true);
    try {
      await apiService.setScenario(id, wellId);
      setScenario(id);
      const alertDef = SCENARIO_ALERTS[id];
      if (alertDef) {
        addAlert({
          wellId,
          type:      alertDef.type,
          message:   alertDef.message,
          parameter: alertDef.parameter,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error applying scenario:', err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4">
      <h3 className="text-sm font-bold text-stone-900 mb-4 uppercase tracking-wide">
        {t('scenarios.title')}
      </h3>

      <div className="space-y-2">
        {SCENARIOS.map(({ id, icon: Icon, color }) => {
          const isActive = currentScenario === id;
          return (
            <button
              key={id}
              onClick={() => applyScenario(id)}
              disabled={isApplying}
              className={`
                w-full py-2.5 px-3 rounded-lg text-left transition-all border
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isActive
                  ? `${ACTIVE_BG[color]} shadow-sm`
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200'}
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 flex-shrink-0 ${ICON_CLASS[color]}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isActive ? ICON_CLASS[color] : 'text-stone-800'}`}>
                    {t(`scenarios.${id}`)}
                  </p>
                  <p className="text-xs text-muted truncate mt-0.5">
                    {id === 'normal'         && t('normalProduction')}
                    {id === 'cooling'        && 'Temperature decline and viscosity increase'}
                    {id === 'high_viscosity' && t('highViscosity')}
                    {id === 'rod_float'      && 'Mechanical instability risk'}
                    {id === 'impact_loading' && 'High stress conditions'}
                    {id === 'optimized'      && 'AI-recommended settings'}
                  </p>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-green rounded-full animate-pulse flex-shrink-0" />
                )}
                {SCENARIO_ALERTS[id] && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0
                    ${SCENARIO_ALERTS[id]!.type === 'critical'
                      ? 'bg-red-100 text-red-600 border border-red-200'
                      : 'bg-amber/15 text-amber border border-amber/30'}`}>
                    {SCENARIO_ALERTS[id]!.type.toUpperCase()}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {isApplying && (
        <p className="mt-3 text-center text-xs text-muted">{t('scenarios.applying')}</p>
      )}
    </div>
  );
}
