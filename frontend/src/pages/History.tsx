import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

export default function History() {
  const selectCls = "w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 text-sm focus:outline-none focus:border-cyan/60 focus:ring-1 focus:ring-cyan/20 transition-colors";

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 mb-1">Historical Analytics</h2>
        <p className="text-muted text-sm">Historical data and trend analysis</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-150px)]">
        <div className="col-span-8 space-y-4 overflow-y-auto">
          {/* CSS Cycle Timeline */}
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
              <Calendar className="w-4 h-4 text-cyan" /> CSS Cycle Timeline
            </h3>
            <div className="space-y-3">
              {[
                { cycle: 5, start: '2024-01-15', end: '2024-02-20', production: 150, status: 'active'   },
                { cycle: 4, start: '2023-12-10', end: '2024-01-14', production: 145, status: 'complete' },
                { cycle: 3, start: '2023-11-05', end: '2023-12-09', production: 138, status: 'complete' },
                { cycle: 2, start: '2023-10-01', end: '2023-11-04', production: 132, status: 'complete' },
                { cycle: 1, start: '2023-08-25', end: '2023-09-30', production: 125, status: 'complete' },
              ].map((c) => (
                <div key={c.cycle} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900">Cycle {c.cycle}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.status==='active'?'bg-green/10 text-green border border-green/20':'bg-stone-100 text-stone-600 border border-stone-200'}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-muted">{c.start} – {c.end}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Production',   value: `${c.production} m³` },
                      { label: 'Steam Volume', value: '500 t'              },
                      { label: 'SOR',          value: '3.3'                },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-muted">{label}</p>
                        <p className="text-sm font-bold font-mono text-stone-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trends */}
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-sm font-bold text-stone-900 mb-4 uppercase tracking-wide">Historical Trends</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green/5 border border-green/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-green" />
                  <span className="text-sm font-bold text-green">Production Trend</span>
                </div>
                <div className="space-y-2">
                  {[{ label: '30-day avg', value: '15.2 m³/d' }, { label: 'Trend', value: '+2.3%', cls: 'text-green' }, { label: 'Peak', value: '18.5 m³/d' }].map(({ label, value, cls = 'text-stone-900' }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-muted">{label}</span>
                      <span className={`font-bold font-mono ${cls}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-amber/5 border border-amber/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-4 h-4 text-amber" />
                  <span className="text-sm font-bold text-amber">SOR Trend</span>
                </div>
                <div className="space-y-2">
                  {[{ label: '30-day avg', value: '3.4' }, { label: 'Trend', value: '-0.2', cls: 'text-green' }, { label: 'Best', value: '3.1' }].map(({ label, value, cls = 'text-stone-900' }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-muted">{label}</span>
                      <span className={`font-bold font-mono ${cls}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-4 space-y-4">
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Filters</h3>
            <div className="space-y-3">
              {[
                { label: 'Date Range', opts: ['Last 30 days','Last 90 days','Last 6 months','Last year','All time'] },
                { label: 'Cycle',     opts: ['All cycles','Cycle 5','Cycle 4','Cycle 3','Cycle 2','Cycle 1']       },
                { label: 'Event Type',opts: ['All events','CSS cycles','Production','Steam injection','Alerts','Maintenance'] },
              ].map(({ label, opts }) => (
                <div key={label}>
                  <label className="text-xs text-muted mb-1.5 block font-medium">{label}</label>
                  <select className={selectCls}>
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Event Statistics</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Total CSS Cycles',       value: '5',       cls: 'text-stone-900' },
                { label: 'Total Production',        value: '690 m³',  cls: 'text-stone-900' },
                { label: 'Steam Consumed',          value: '2,400 t', cls: 'text-stone-900' },
                { label: 'Rod Float Events',        value: '3',       cls: 'text-amber'     },
                { label: 'Impact Loading Events',   value: '2',       cls: 'text-amber'     },
                { label: 'Maintenance Events',      value: '1',       cls: 'text-stone-900' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{label}</span>
                  <span className={`text-xs font-bold font-mono ${cls}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Key Metrics</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Avg Production',  value: '15.0 m³/d', cls: 'text-stone-900' },
                { label: 'Avg SOR',          value: '3.5',       cls: 'text-stone-900' },
                { label: 'Avg Energy/Barrel',value: '2.1 GJ',    cls: 'text-stone-900' },
                { label: 'Uptime',           value: '94.5%',     cls: 'text-green'     },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{label}</span>
                  <span className={`text-xs font-bold font-mono ${cls}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
