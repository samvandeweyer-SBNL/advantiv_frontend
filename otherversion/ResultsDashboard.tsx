
import React, { useState } from 'react';
import { OptimizationResult, CampaignInputs } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, BarChart, Bar, Cell
} from 'recharts';
import * as XLSX from 'xlsx';

interface Props {
  results: OptimizationResult;
  inputs: CampaignInputs;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const formatNumber = (val: number) => {
  if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
  return val.toString();
};

const ResultsDashboard: React.FC<Props> = ({ results, inputs }) => {
  const [activeTab, setActiveTab] = useState<'results' | 'insights'>('results');
  const [showUpSet, setShowUpSet] = useState(true);
  const [hiddenCandidates, setHiddenCandidates] = useState<string[]>([]);
  const [hiddenChannels, setHiddenChannels] = useState<string[]>([]);

  const toggleCandidate = (o: any) => {
    const { dataKey } = o;
    setHiddenCandidates(prev => 
      prev.includes(dataKey) ? prev.filter(k => k !== dataKey) : [...prev, dataKey]
    );
  };

  const toggleChannel = (o: any) => {
    const { value } = o; 
    setHiddenChannels(prev => 
      prev.includes(value) ? prev.filter(k => k !== value) : [...prev, value]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('results')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'results' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Optimization Results
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'insights' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Audience Insights
          </button>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const wb = XLSX.utils.book_new();
              const wsKpi = XLSX.utils.json_to_sheet(results.channels);
              XLSX.utils.book_append_sheet(wb, wsKpi, 'Results');
              XLSX.writeFile(wb, `Advantiv_Export_${new Date().getTime()}.xlsx`);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-5-4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Excel Export
          </button>
        </div>
      </div>

      {activeTab === 'results' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Summary Section */}
          <div className="glass-card p-6 rounded-2xl border-indigo-500/20">
            <h3 className="text-lg font-bold text-indigo-400 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Executive Summary
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line italic opacity-90">
              {results.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl text-center">
              <span className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1 block">Net Reach</span>
              <span className="text-3xl font-black text-white">{formatNumber(results.totalProjectedReach)}</span>
            </div>
            <div className="glass-card p-6 rounded-2xl text-center border-rose-500/20">
              <span className="text-rose-400/80 text-xs uppercase font-bold tracking-widest mb-1 block">Overlap Waste</span>
              <span className="text-3xl font-black text-rose-400">{formatNumber(results.usersLostToOverlap)}</span>
            </div>
            <div className="glass-card p-6 rounded-2xl text-center">
              <span className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1 block">Total Budget</span>
              <span className="text-3xl font-black text-blue-400">€{formatNumber(results.channels.reduce((acc, c) => acc + c.media_budget, 0))}</span>
            </div>
            <div className="glass-card p-6 rounded-2xl text-center">
              <span className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1 block">Target Audience</span>
              <span className="text-3xl font-black text-indigo-400">{formatNumber(results.targetPopulation)}</span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-6 text-emerald-400">Scenario Comparison (Budget)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={results.candidateComparison} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="budget" stroke="#64748b" fontSize={10} tickFormatter={(v) => `€${formatNumber(v)}`} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={formatNumber} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                <Legend onClick={toggleCandidate} />
                {Object.keys(results.candidateComparison[0]).filter(k => k !== 'step' && k !== 'budget').map((key, i) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} hide={hiddenCandidates.includes(key)} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-6 text-blue-400">Efficiency Progression</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis type="number" dataKey="budget" stroke="#64748b" fontSize={10} tickFormatter={(v) => `€${formatNumber(v)}`} />
                  <YAxis type="number" dataKey="reach" stroke="#64748b" fontSize={10} tickFormatter={formatNumber} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                  <Legend onClick={toggleChannel} />
                  {Object.entries(results.channelCurves).map(([ch, data], i) => (
                    <Line key={ch} data={data} name={ch} type="monotone" dataKey="reach" stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} hide={hiddenChannels.includes(ch)} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-6 text-rose-400">Reach Overlap Analysis</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={results.overlapData}>
                  <defs>
                    <linearGradient id="colNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colWaste" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="budget" stroke="#64748b" fontSize={10} tickFormatter={(v) => `€${formatNumber(v)}`} />
                  <YAxis stroke="#64748b" fontSize={10} tickFormatter={formatNumber} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                  <Area stackId="1" dataKey="netReach" name="Net Reach" stroke="#10b981" fill="url(#colNet)" />
                  <Area stackId="1" dataKey="overlap" name="Overlap Waste" stroke="#ef4444" fill="url(#colWaste)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Distribution */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-6 text-indigo-400">Audience Age Distribution (Total)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={results.ageDemographics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="bucket" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} tickFormatter={formatNumber} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} cursor={{fill: '#1e293b'}} />
                  <Bar dataKey="total_users" name="Potential Users" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* User Activity Trends */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-6 text-blue-400">Platform Activity (DAU vs MAU)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={results.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} tickFormatter={formatNumber} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                  <Legend />
                  <Line type="monotone" dataKey="dau" name="Daily Active Users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="mau" name="Monthly Active Users" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* UpSet Plot Section */}
          <div className="glass-card p-6 rounded-2xl border-indigo-500/10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-bold text-indigo-300">Channel Intersection Profile (UpSet Matrix)</h3>
                <p className="text-xs text-slate-500">Visualizing user overlap percentage between channel combinations</p>
              </div>
              <button 
                onClick={() => setShowUpSet(!showUpSet)}
                className="px-4 py-1.5 rounded-lg border border-slate-700 text-xs font-bold hover:bg-slate-800 transition-all"
              >
                {showUpSet ? 'Hide Plot' : 'Show Plot'}
              </button>
            </div>

            {showUpSet && (
              <div className="space-y-6 animate-in zoom-in-95 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
                  {/* The Matrix */}
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex flex-col gap-4">
                      {inputs.channel_selection.slice(0, 5).map((ch, i) => (
                        <div key={ch} className="flex items-center gap-4 group">
                          <div className="w-24 text-right text-[10px] font-bold text-slate-500 uppercase truncate" title={ch}>{ch}</div>
                          <div className="flex gap-4">
                            {results.intersections.map((inter, j) => (
                              <div 
                                key={j} 
                                className={`w-4 h-4 rounded-full border-2 transition-all ${inter.channels.includes(ch) ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)] scale-110' : 'bg-slate-800 border-slate-700 opacity-20'}`}
                              ></div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* The Bar Chart of intersection sizes */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.intersections} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={formatNumber} />
                        <YAxis type="category" dataKey="overlap_pct" stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}%`} />
                        <Tooltip 
                          cursor={{fill: '#1e293b'}} 
                          contentStyle={{ backgroundColor: '#0f172a', border: 'none' }}
                          formatter={(v: any) => [formatNumber(v), 'Users']}
                        />
                        <Bar dataKey="size" name="Intersection Size" radius={[0, 4, 4, 0]}>
                          {results.intersections.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.channels.length > 1 ? '#10b981' : '#3b82f6'} fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="text-center text-[10px] text-slate-500 italic mt-4">
                  * Dots indicate which channels are being intersected. Bars represent the number of users unique to that specific combination.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDashboard;
