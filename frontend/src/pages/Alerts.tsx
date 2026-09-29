import { useDigitalTwinStore } from '../store/digitalTwinStore';
import { useFilteredNotifications, useNotificationStore, NotifType } from '../store/notificationStore';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle, Clock, Filter, BellOff } from 'lucide-react';

function backendSeverityToType(severity: string): NotifType {
  const s = severity.toUpperCase();
  if (s === 'CRITICAL') return 'critical';
  if (s === 'HIGH')     return 'warning';
  return 'info';
}

const SEVERITY_STYLE: Record<string, { text: string; border: string; bg: string }> = {
  CRITICAL: { text: 'text-red-600',    border: 'border-red-400',    bg: 'bg-red-50'      },
  HIGH:     { text: 'text-amber',      border: 'border-amber',      bg: 'bg-amber/10'    },
  MEDIUM:   { text: 'text-cyan',       border: 'border-cyan/50',    bg: 'bg-cyan/5'      },
  LOW:      { text: 'text-green',      border: 'border-green/50',   bg: 'bg-green/5'     },
  INFO:     { text: 'text-cyan',       border: 'border-cyan/50',    bg: 'bg-cyan/5'      },
};
const TYPE_STYLE: Record<NotifType, { text: string; bg: string; border: string }> = {
  critical: { text: 'text-red-600',  bg: 'bg-red-50',    border: 'border-red-300'   },
  warning:  { text: 'text-amber',    bg: 'bg-amber/10',  border: 'border-amber/30'  },
  info:     { text: 'text-cyan',     bg: 'bg-cyan/5',    border: 'border-cyan/30'   },
};

export default function Alerts() {
  const { t } = useTranslation();
  const { alerts: backendAlerts } = useDigitalTwinStore();
  const { filtered: appAlerts, markAllRead, markAsRead } = useFilteredNotifications();
  const clearAll = useNotificationStore((s) => s.clearAll);

  const critCount = [...appAlerts.filter(a=>a.type==='critical'), ...backendAlerts.filter(a=>a.severity==='CRITICAL')].length;
  const highCount = [...appAlerts.filter(a=>a.type==='warning'),  ...backendAlerts.filter(a=>a.severity==='HIGH')].length;
  const medCount  = backendAlerts.filter(a=>a.severity==='MEDIUM').length;
  const infoCount = [...appAlerts.filter(a=>a.type==='info'),     ...backendAlerts.filter(a=>a.severity==='INFO')].length;

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 mb-1">{t('alerts.title')}</h2>
        <p className="text-muted text-sm">{t('alerts.subtitle')}</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-150px)]">
        <div className="col-span-8 space-y-4 overflow-y-auto">
          {/* KPI */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: t('alerts.critical'), count: critCount, icon: AlertTriangle, cls: 'text-red-600'  },
              { label: t('alerts.high'),     count: highCount, icon: AlertTriangle, cls: 'text-amber'    },
              { label: t('alerts.medium'),   count: medCount,  icon: AlertTriangle, cls: 'text-cyan'     },
              { label: t('alerts.info'),     count: infoCount, icon: CheckCircle,   cls: 'text-green'    },
            ].map(({ label, count, icon: Icon, cls }) => (
              <div key={label} className="glass-panel rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${cls}`} />
                  <span className="text-xs text-muted">{label}</span>
                </div>
                <p className={`text-2xl font-bold font-mono ${cls}`}>{count}</p>
              </div>
            ))}
          </div>

          {/* In-app alerts */}
          {appAlerts.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-stone-900">{t('alerts.activeAlerts')}</h3>
                <div className="flex items-center gap-3">
                  <button onClick={markAllRead} className="text-xs text-muted hover:text-cyan transition-colors">{t('alerts.markAllRead')}</button>
                  <button onClick={clearAll}    className="text-xs text-muted hover:text-red-500 transition-colors">Clear</button>
                </div>
              </div>
              <div className="space-y-2">
                {appAlerts.map((alert) => {
                  const s = TYPE_STYLE[alert.type];
                  return (
                    <button key={alert.id} onClick={() => markAsRead(alert.id)}
                      className={`w-full text-left rounded-xl p-3 border transition-colors ${s.bg} ${s.border} ${alert.isRead ? 'opacity-50' : ''}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {!alert.isRead && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${alert.type==='critical'?'bg-red-500':alert.type==='warning'?'bg-amber':'bg-cyan'}`} />}
                          <p className="text-sm text-stone-800">{alert.message}</p>
                        </div>
                        <span className={`text-xs font-bold uppercase flex-shrink-0 ${s.text}`}>{alert.type}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-muted font-mono">{alert.wellId}</span>
                        <span className="text-xs text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />{new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Backend alerts */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-stone-900">{t('alerts.activeAlerts')}</h3>
              <button className="flex items-center gap-2 text-cyan text-sm hover:text-cyan/80 transition-colors">
                <Filter className="w-4 h-4" />{t('alerts.filter')}
              </button>
            </div>
            {backendAlerts.length === 0 && appAlerts.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-muted">
                <BellOff className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">{t('alerts.noAlerts')}</p>
              </div>
            ) : backendAlerts.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">{t('alerts.noAlerts')}</p>
            ) : (
              <div className="space-y-3">
                {backendAlerts.map((alert, i) => {
                  const s = SEVERITY_STYLE[alert.severity] ?? SEVERITY_STYLE.INFO;
                  return (
                    <div key={i} className={`p-4 rounded-xl border ${s.bg} ${s.border}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${s.text}`} />
                          <span className={`text-sm font-bold ${s.text}`}>{alert.severity}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {[
                          { label: t('alerts.parameter'), value: alert.parameter                },
                          { label: t('alerts.value'),     value: alert.value.toFixed(2)          },
                          { label: t('alerts.threshold'), value: alert.threshold.toFixed(2)      },
                          { label: t('alerts.prediction'),value: alert.prediction                },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-xs text-muted">{label}</p>
                            <p className="text-sm font-bold font-mono text-stone-900">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted mb-0.5">{t('alerts.recommendedAction')}</p>
                          <p className="text-sm font-semibold text-green">{alert.recommended_action}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="col-span-4 space-y-4">
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Alert Configuration</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Rod Float Threshold',      value: '0.5'      },
                { label: 'Impact Loading Threshold', value: '0.6'      },
                { label: 'Temperature Threshold',    value: '45°C'     },
                { label: 'Vibration Threshold',      value: '2.0 mm/s' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{label}</span>
                  <span className="text-xs font-bold font-mono text-stone-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Recent History</h3>
            <div className="space-y-2">
              {[
                { time: '2h ago', event: 'Rod float resolved',     severity: 'success' },
                { time: '5h ago', event: 'Steam injection started', severity: 'info'   },
                { time: '1d ago', event: 'Pressure warning',        severity: 'warning' },
                { time: '2d ago', event: 'Maintenance completed',   severity: 'success' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted">{item.time}</span>
                  <span className={item.severity==='success'?'text-green font-semibold':item.severity==='warning'?'text-amber font-semibold':'text-cyan'}>
                    {item.event}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Notifications</h3>
            <div className="space-y-2">
              {['Email Alerts', 'SMS Alerts', 'Push Notifications'].map((label) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{label}</span>
                  <span className="text-xs font-bold text-green">● ON</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
