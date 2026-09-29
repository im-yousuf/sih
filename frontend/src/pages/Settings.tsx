import { User, Bell, Cpu, Database, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const [role, setRole] = useState('ENGINEER');
  const inputCls = "w-full bg-white border border-stone-200 rounded-lg px-4 py-2 text-stone-900 text-sm focus:outline-none focus:border-cyan/60 focus:ring-1 focus:ring-cyan/20 transition-colors";

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 mb-1">Settings</h2>
        <p className="text-muted text-sm">System configuration and preferences</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-150px)]">
        <div className="col-span-8 space-y-4">
          {/* User Settings */}
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
              <User className="w-4 h-4 text-cyan" /> User Settings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted mb-1.5 block font-medium">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
                  <option value="ENGINEER">ENGINEER</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block font-medium">Permissions</label>
                <div className="bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 text-stone-900 text-sm">
                  {role === 'ENGINEER' ? 'Full access' : 'Read-only access'}
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <p className="text-xs text-stone-600"><strong className="text-stone-900">ENGINEER:</strong> Can simulate, optimize, and approve demo actions</p>
              <p className="text-xs text-stone-600 mt-1"><strong className="text-stone-900">VIEWER:</strong> Can view data but cannot apply actions</p>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
              <Bell className="w-4 h-4 text-cyan" /> Notification Settings
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Email Alerts',       sub: 'Receive critical alerts via email',    on: true  },
                { label: 'SMS Alerts',          sub: 'Receive critical alerts via SMS',      on: true  },
                { label: 'Push Notifications',  sub: 'Receive in-app notifications',         on: true  },
                { label: 'Sound Alerts',        sub: 'Play sound for critical alerts',       on: false },
              ].map(({ label, sub, on }) => (
                <div key={label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{label}</p>
                    <p className="text-xs text-muted">{sub}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative transition-colors ${on ? 'bg-cyan' : 'bg-stone-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Settings */}
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
              <Cpu className="w-4 h-4 text-cyan" /> System Settings
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Data Refresh Rate', opts: ['1 second','2 seconds','5 seconds','10 seconds'] },
                { label: 'Time Zone',          opts: ['UTC+5:30 (India)','UTC (Coordinated Universal Time)','EST (Eastern Standard Time)'] },
                { label: 'Units',              opts: ['Metric (m, °C, kPa)','Imperial (ft, °F, psi)'] },
              ].map(({ label, opts }) => (
                <div key={label}>
                  <label className="text-xs text-muted mb-1.5 block font-medium">{label}</label>
                  <select className={inputCls}>{opts.map(o=><option key={o}>{o}</option>)}</select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-4 space-y-4">
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">System Status</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Digital Twin',   status: '● ONLINE',     cls: 'text-green' },
                { label: 'Reservoir Model',status: '● RUNNING',    cls: 'text-green' },
                { label: 'Wellbore Model', status: '● RUNNING',    cls: 'text-green' },
                { label: 'Surface Model',  status: '● RUNNING',    cls: 'text-green' },
                { label: 'AI Engine',      status: '● ACTIVE',     cls: 'text-green' },
                { label: 'VFD Link',       status: '● SIMULATED',  cls: 'text-amber' },
                { label: 'Data Pipeline',  status: '● HEALTHY',    cls: 'text-green' },
              ].map(({ label, status, cls }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{label}</span>
                  <span className={`text-xs font-bold ${cls}`}>{status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
              <Database className="w-4 h-4 text-cyan" /> Database
            </h3>
            <div className="space-y-2.5">
              {[
                { label: 'Status',       value: '● Connected',  cls: 'text-green' },
                { label: 'Type',         value: 'PostgreSQL',   cls: 'text-stone-900' },
                { label: 'Records',      value: '1,234,567',    cls: 'text-stone-900' },
                { label: 'Last Backup',  value: '2 hours ago',  cls: 'text-stone-900' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{label}</span>
                  <span className={`text-xs font-bold ${cls}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
              <Shield className="w-4 h-4 text-cyan" /> Security
            </h3>
            <div className="space-y-2.5">
              {[
                { label: 'Authentication', value: '● Enabled', cls: 'text-green' },
                { label: 'Encryption',     value: '● AES-256', cls: 'text-green' },
                { label: 'Audit Log',      value: '● Active',  cls: 'text-green' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{label}</span>
                  <span className={`text-xs font-bold ${cls}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 border-l-4 border-amber">
            <h3 className="text-sm font-bold text-amber mb-2">Disclaimer</h3>
            <p className="text-xs text-muted leading-relaxed">
              This is a demonstration / simulation system. All values are simulated data unless explicitly stated otherwise. This system is not connected to actual Oil India Limited production control systems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
