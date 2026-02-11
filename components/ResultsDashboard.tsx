
import React, { useState } from 'react';
import { OptimizationResult, CampaignInputs } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line
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

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Inputs Sheet
    const inputsData = [
      { Parameter: 'Customer Name', Value: inputs.customer_name },
      { Parameter: 'Campaign Name', Value: inputs.campaign_name },
      { Parameter: 'Total Budget', Value: inputs.total_budget },
      { Parameter: 'Goal Type', Value: inputs.goal_type },
      { Parameter: 'Start Date', Value: inputs.campaign_start_date },
      { Parameter: 'End Date', Value: inputs.campaign_end_date },
      { Parameter: 'Duration (Weeks)', Value: inputs.campaign_duration },
      { Parameter: 'Country', Value: inputs.country },
      { Parameter: 'Min Age', Value: inputs.age_min },
      { Parameter: 'Max Age', Value: inputs.age_max },
      { Parameter: 'Gender', Value: inputs.gender },
      { Parameter: 'Min Contact Frequency', Value: inputs.minimal_contact_frequency },
      { Parameter: 'Max Channels', Value: inputs.max_channels },
      { Parameter: 'Target Reach', Value: inputs.target_reach },
      { Parameter: 'Selected Channels', Value: inputs.channel_selection.join(', ') },
    ];
    const wsInputs = XLSX.utils.json_to_sheet(inputsData);
    XLSX.utils.book_append_sheet(wb, wsInputs, 'Campaign Inputs');

    // 2. KPI Forecast Sheet
    const wsKpi = XLSX.utils.json_to_sheet(results.channels);
    XLSX.utils.book_append_sheet(wb, wsKpi, 'KPI Forecast');

    // 3. Scenario Comparison Sheet
    const wsScenarios = XLSX.utils.json_to_sheet(results.candidateComparison);
    XLSX.utils.book_append_sheet(wb, wsScenarios, 'Optimization Scenarios');

    // 4. Reach Efficiency Sheet (Flattened)
    const efficiencyData: any[] = [];
    Object.entries(results.channelCurves).forEach(([channel, points]) => {
      points.forEach(p => {
        efficiencyData.push({ Channel: channel, Budget: p.budget, Reach: p.reach });
      });
    });
    const wsEfficiency = XLSX.utils.json_to_sheet(efficiencyData);
    XLSX.utils.book_append_sheet(wb, wsEfficiency, 'Reach Efficiency');

    // 5. Age Demographics Sheet
    const wsDemographics = XLSX.utils.json_to_sheet(results.ageDemographics);
    XLSX.utils.book_append_sheet(wb, wsDemographics, 'Age Demographics');

    // 6. Overlap Analysis Sheet
    const wsOverlap = XLSX.utils.json_to_sheet(results.overlapData);
    XLSX.utils.book_append_sheet(wb, wsOverlap, 'Overlap Analysis');

    // Save File
    const fileName = `Advantiv_Export_${inputs.customer_name || 'Campaign'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <button 
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all transform active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Results to Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Projected Reach */}
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-slate-400 text-sm mb-1">Projected Reach</span>
          <span className="text-4xl font-bold text-white tracking-tight">{formatNumber(results.totalProjectedReach)}</span>
          <div className="flex items-center gap-1 text-emerald-400 text-sm mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span>8.4% efficient</span>
          </div>
        </div>

        {/* Card 2: Users Lost to Overlap */}
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-slate-400 text-sm mb-1">Users Lost to Overlap</span>
          <span className="text-4xl font-bold text-rose-400 tracking-tight">{formatNumber(results.usersLostToOverlap)}</span>
          <div className="flex items-center gap-1 text-rose-400 text-sm mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>-2.1% waste</span>
          </div>
        </div>

        {/* Card 3: Total Budget Invested */}
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-slate-400 text-sm mb-1">Total Budget Invested</span>
          <span className="text-4xl font-bold text-blue-400 tracking-tight">
            €{formatNumber(results.channels.reduce((acc, c) => acc + c.media_budget, 0))}
          </span>
          <span className="text-xs text-slate-500 mt-2">Across {results.channels.length} channels</span>
        </div>

        {/* Card 4: Target Population */}
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-slate-400 text-sm mb-1">Target Population</span>
          <span className="text-4xl font-bold text-indigo-400 tracking-tight">{formatNumber(results.targetPopulation)}</span>
          <span className="text-xs text-slate-500 mt-2">Total addressable market</span>
        </div>
      </div>

      {/* KPI FORECAST TABLE */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            KPI Forecast Table
          </h3>
          <div className="text-[10px] text-slate-500 font-mono text-right">
            <div>Run ID: {results.channels[0]?.run_id}</div>
            <div>Generated: {results.channels[0]?.run_ts}</div>
          </div>
        </div>
        
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse min-w-[1500px]">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 border-b border-slate-800 sticky left-0 bg-slate-900">Row</th>
                <th className="py-3 px-4 border-b border-slate-800">Channel</th>
                <th className="py-3 px-4 border-b border-slate-800 text-right">Media Budget</th>
                <th className="py-3 px-4 border-b border-slate-800 text-right">Budget %</th>
                <th className="py-3 px-4 border-b border-slate-800 text-right">CPM</th>
                <th className="py-3 px-4 border-b border-slate-800 text-right">TV Factor</th>
                <th className="py-3 px-4 border-b border-slate-800 text-right">TV Reach (#)</th>
                <th className="py-3 px-4 border-b border-slate-800 text-right">TV Reach (%)</th>
                <th className="py-3 px-4 border-b border-slate-800 text-right">Dig. Impressions</th>
                <th className="py-3 px-4 border-b border-slate-800 text-right">Dig. Reach (#)</th>
                <th className="py-3 px-4 border-b border-slate-800 text-right">Dig. Reach (%)</th>
                <th className="py-3 px-4 border-b border-slate-800 text-right">Contact Freq.</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {results.channels.map((ch, idx) => (
                <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition">
                  <td className="py-4 px-4 font-mono text-slate-500 sticky left-0 bg-[#161b2c]">{idx + 1}</td>
                  <td className="py-4 px-4 font-bold text-slate-200">{ch.channel}</td>
                  <td className="py-4 px-4 text-right text-slate-300">€{ch.media_budget.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                  <td className="py-4 px-4 text-right text-slate-400">{ch.budget_share_pct.toFixed(2)}%</td>
                  <td className="py-4 px-4 text-right text-slate-400">{ch.cpm.toFixed(2)}</td>
                  <td className="py-4 px-4 text-right text-slate-400">{ch.tv_factor.toFixed(1)}</td>
                  <td className="py-4 px-4 text-right text-slate-400">{ch.tv_reach_num.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right text-blue-400">{ch.tv_reach_pct.toFixed(2)}%</td>
                  <td className="py-4 px-4 text-right text-slate-400">{ch.digital_impressions.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right text-slate-400">{ch.digital_reach_num.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right text-emerald-400">{ch.digital_reach_pct.toFixed(2)}%</td>
                  <td className="py-4 px-4 text-right font-medium text-slate-300">{ch.contact_freq.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Candidate Comparison Chart */}
      <div className="glass-card p-6 rounded-2xl min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-emerald-400">Optimization Scenario Comparison</h3>
          <span className="text-[10px] text-slate-500 italic">Click legend items to toggle visibility</span>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={results.candidateComparison} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="budget" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `€${formatNumber(val)}`}
              label={{ value: 'Budget', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              width={70}
              tickFormatter={formatNumber} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
              formatter={(val: number) => [val.toLocaleString(), 'Reach']}
              labelFormatter={(val) => `Budget: €${val.toLocaleString()}`}
            />
            <Legend verticalAlign="top" align="right" height={36} iconType="circle" onClick={toggleCandidate} wrapperStyle={{ cursor: 'pointer' }} />
            {Object.keys(results.candidateComparison[0]).filter(k => k !== 'step' && k !== 'budget').map((key, i) => (
              <Line 
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
                hide={hiddenCandidates.includes(key)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Channel Budget vs Reach Progression */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-blue-400">Reach Efficiency per Channel</h3>
            <span className="text-[10px] text-slate-500 italic">Click to toggle</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart margin={{ top: 10, right: 30, left: 10, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                type="number" 
                dataKey="budget" 
                name="Budget" 
                unit="€" 
                stroke="#64748b" 
                fontSize={10} 
                tickFormatter={(val) => `${val / 1000}k`}
                label={{ value: 'Budget (€)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10 }}
              />
              <YAxis 
                type="number" 
                dataKey="reach" 
                name="Reach" 
                stroke="#64748b" 
                fontSize={10} 
                width={60}
                tickFormatter={formatNumber}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                formatter={(val: number) => [val.toLocaleString(), 'Reach']}
              />
              <Legend verticalAlign="bottom" align="center" iconType="circle" onClick={toggleChannel} wrapperStyle={{ cursor: 'pointer', paddingTop: '40px' }} />
              {Object.entries(results.channelCurves).map(([channel, data], i) => (
                <Line 
                  key={channel}
                  data={data}
                  name={channel}
                  type="monotone"
                  dataKey="reach"
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  hide={hiddenChannels.includes(channel)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 3a. Age Reach Distribution Chart */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-6 text-amber-400">Demographic Reach Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={results.ageDemographics} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorAgeReach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="bucket" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                label={{ value: 'Age Bucket', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10 }}
              />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={60} tickFormatter={formatNumber} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                formatter={(val: number) => [val.toLocaleString(), 'Reach']}
              />
              <Area 
                type="monotone" 
                dataKey="reach" 
                stroke="#f59e0b" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAgeReach)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 3b. Age Budget Distribution Chart */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-6 text-indigo-400">Demographic Budget Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={results.ageDemographics} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorAgeBudget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="bucket" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                label={{ value: 'Age Bucket', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10 }}
              />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={60} tickFormatter={(val) => `€${formatNumber(val)}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                formatter={(val: number) => [`€${val.toLocaleString()}`, 'Budget']}
              />
              <Area 
                type="monotone" 
                dataKey="budget" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAgeBudget)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Overlap & Efficiency Line Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-bold mb-6 text-emerald-400">Net vs Gross Reach (Overlap Analysis)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={results.overlapData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorOverlap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="budget" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `€${formatNumber(val)}`}
              label={{ value: 'Budget', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }}
            />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={70} tickFormatter={formatNumber} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
              formatter={(val: number) => [val.toLocaleString(), 'Reach']}
              labelFormatter={(val) => `Budget: €${val.toLocaleString()}`}
            />
            <Legend verticalAlign="top" align="center" iconType="line" />
            <Area 
              type="monotone" 
              dataKey="netReach" 
              name="Net Reach"
              stackId="1"
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorNet)" 
            />
            <Area 
              type="monotone" 
              dataKey="overlap" 
              name="Gross Reach"
              stackId="1"
              stroke="#ef4444" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorOverlap)" 
            />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-500 mt-4 text-center">
          * The red area represents users reached multiple times across different channels (efficiency loss).
        </p>
      </div>
    </div>
  );
};

export default ResultsDashboard;
