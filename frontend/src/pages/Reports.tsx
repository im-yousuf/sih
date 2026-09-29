import { FileText, Download } from 'lucide-react';

export default function Reports() {
  const selectCls = "w-full bg-white border border-stone-200 rounded-lg px-4 py-2 text-stone-900 text-sm focus:outline-none focus:border-cyan/60 transition-colors";

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 mb-1">Engineering Reports</h2>
        <p className="text-muted text-sm">Generate and export digital twin reports</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-150px)]">
        <div className="col-span-8 space-y-4">
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
              <FileText className="w-4 h-4 text-cyan" /> Generate Report
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs text-muted mb-1.5 block font-medium">Report Type</label>
                <select className={selectCls}>
                  {['Complete Digital Twin Report','Reservoir Analysis','Wellbore Analysis','SRP Performance','CSS Performance','AI Predictions','Optimization Summary','Alert Summary'].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block font-medium">Date Range</label>
                <select className={selectCls}>
                  {['Last 24 hours','Last 7 days','Last 30 days','Last 90 days','Custom range'].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Export PDF','Export CSV'].map((label) => (
                <button key={label} className="flex items-center justify-center gap-2 py-3 px-4 bg-[#8b5a2b] hover:bg-[#7a4f26] border border-[#7a4f26] rounded-xl text-white font-bold shadow-sm transition-colors">
                  <Download className="w-4 h-4" />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Report preview */}
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-sm font-bold text-stone-900 mb-4 uppercase tracking-wide">Report Preview</h3>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
              <div className="text-center border-b border-stone-200 pb-4">
                <h2 className="text-lg font-bold text-stone-900">Baghewala Digital Twin Report</h2>
                <p className="text-sm text-muted mt-1">Well BW-07 | Baghewala Field, Rajasthan, India</p>
                <p className="text-xs text-muted mt-1">Generated: {new Date().toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Well Summary', rows: [{ l:'Well Name', v:'BW-07' }, { l:'Field', v:'Baghewala' }, { l:'Depth', v:'1500 m' }, { l:'Status', v:'PRODUCING', cls:'text-green' }] },
                  { title: 'Reservoir Condition', rows: [{ l:'Temperature', v:'55.0°C' }, { l:'Pressure', v:'300 kPa' }, { l:'Viscosity', v:'1200 cP' }, { l:'Mobility', v:'0.42 mD/cP' }] },
                  { title: 'CSS Performance', rows: [{ l:'Current Cycle', v:'5' }, { l:'Steam Volume', v:'500 t' }, { l:'SOR', v:'3.5' }, { l:'Cycle Production', v:'150 m³' }] },
                  { title: 'SRP Performance', rows: [{ l:'SPM', v:'5.0' }, { l:'Rod Load', v:'30.0 kN' }, { l:'Pump Efficiency', v:'85%' }, { l:'Vibration', v:'0.5 mm/s' }] },
                ].map(({ title, rows }) => (
                  <div key={title}>
                    <h4 className="text-xs font-bold text-stone-900 mb-2 uppercase tracking-wide">{title}</h4>
                    <div className="space-y-1">
                      {rows.map(({ l, v, cls = 'text-stone-900' }) => (
                        <div key={l} className="flex justify-between text-xs">
                          <span className="text-muted">{l}:</span>
                          <span className={`font-bold font-mono ${cls}`}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-200 pt-4 text-center">
                <p className="text-xs text-muted">DEMONSTRATION / SIMULATION DATA — Not for operational use</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-4 space-y-4">
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Recent Reports</h3>
            <div className="space-y-2">
              {[
                { name: 'Digital Twin Report', date: '2024-01-20', type: 'PDF' },
                { name: 'CSS Performance',     date: '2024-01-15', type: 'PDF' },
                { name: 'SRP Analysis',        date: '2024-01-10', type: 'CSV' },
                { name: 'Alert Summary',       date: '2024-01-05', type: 'PDF' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 text-cyan" />
                    <span className="text-stone-800 font-medium">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <span>{r.date}</span>
                    <span className="font-bold text-stone-500">{r.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Report Templates</h3>
            <div className="space-y-2">
              {['Daily Operations Report','Weekly Performance Summary','Monthly CSS Analysis','Quarterly Optimization Review','Annual Well Performance'].map((tpl) => (
                <button key={tpl} className="w-full py-2 px-3 bg-stone-50 hover:bg-cyan/5 border border-stone-200 rounded-lg text-stone-700 text-sm text-left transition-colors hover:text-cyan hover:border-cyan/30">
                  {tpl}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wide">Scheduled Reports</h3>
            <div className="space-y-2.5">
              {['Daily Report','Weekly Summary','Monthly Analysis'].map((label) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{label}</span>
                  <span className="text-xs font-bold text-green">● Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
