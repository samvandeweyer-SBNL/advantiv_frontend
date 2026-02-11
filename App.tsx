
import React, { useState, useEffect, useCallback } from 'react';
import InputSection from './components/InputSection';
import ChannelSelector from './components/ChannelSelector';
import StatusProgress from './components/StatusProgress';
import ResultsDashboard from './components/ResultsDashboard';
import CustomerDropdown from './components/CustomerDropdown';
import { CampaignInputs, RunStatus, OptimizationResult } from './types';
import { STATUS_STEPS } from './constants';
import { generateCampaignInsights, generateMockResults } from './services/geminiService';

const App: React.FC = () => {
  const getInitialInputs = useCallback((): CampaignInputs => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    return {
      total_budget: '',
      goal_type: 'Budget',
      campaign_start_date: formatDate(today),
      campaign_end_date: formatDate(nextWeek),
      campaign_duration: 1, // calculated in weeks
      country: 'NL',
      age_min: '',
      age_max: '',
      minimal_contact_frequency: 1,
      channel_selection: [],
      channel_settings: {},
      max_channels: 2,
      target_reach: '',
      gender: 'All',
      customer_name: '',
      campaign_name: ''
    };
  }, []);

  const [inputs, setInputs] = useState<CampaignInputs>(getInitialInputs());
  const [status, setStatus] = useState<RunStatus>(RunStatus.IDLE);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [results, setResults] = useState<OptimizationResult | null>(null);

  const startOptimization = async () => {
    if (inputs.channel_selection.length === 0) {
      alert("Please select at least one channel.");
      return;
    }

    if (inputs.total_budget === '' || inputs.target_reach === '') {
      alert("Please fill in the Total Budget and Target Reach.");
      return;
    }

    setResults(null);
    setStatus(RunStatus.ANALYZING);
    setCurrentStepIndex(0);

    // Simulated progress steps
    for (let i = 1; i < STATUS_STEPS.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStepIndex(i);
      if (i === 1) setStatus(RunStatus.OPTIMIZING);
      if (i === 2) setStatus(RunStatus.SIMULATING);
      if (i === 3) setStatus(RunStatus.FINALIZING);
    }

    // Call Gemini API for summary & generate data
    const summary = await generateCampaignInsights(inputs);
    const mockData = generateMockResults(inputs);

    setResults({
      summary,
      ...mockData
    });
    setStatus(RunStatus.COMPLETED);
  };

  const handleReset = () => {
    setInputs(getInitialInputs());
    setStatus(RunStatus.IDLE);
    setResults(null);
    setCurrentStepIndex(-1);
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <nav className="pt-8 pb-4">
        <CustomerDropdown 
          selected={inputs.customer_name} 
          onSelect={(name) => setInputs(prev => ({ ...prev, customer_name: name === "All Customers" ? "" : name }))} 
        />
      </nav>

      <header className="py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1">
          <h1 className="text-5xl font-black tracking-tight text-white mb-3">
            Advantiv
          </h1>
          <p className="text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed">
            Advantiv helps you get the most reach from your advertising budget by automatically finding the best way to spend across different channels.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={handleReset}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all font-semibold flex items-center gap-2 border border-slate-700"
          >
            Reset
          </button>
          <button 
            onClick={startOptimization}
            disabled={status !== RunStatus.IDLE && status !== RunStatus.COMPLETED}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-3 transition-all transform active:scale-95 ${
              status === RunStatus.IDLE || status === RunStatus.COMPLETED
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {status === RunStatus.IDLE ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Run Optimization
              </>
            ) : status === RunStatus.COMPLETED ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Rerun Engine
              </>
            ) : (
              <>
                <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                Optimizing...
              </>
            )}
          </button>
        </div>
      </header>

      <main className="space-y-6">
        <InputSection inputs={inputs} setInputs={setInputs} />
        
        <ChannelSelector 
          inputs={inputs}
          onChange={(newInputs) => setInputs(newInputs)}
        />

        <StatusProgress status={status} currentStepIndex={currentStepIndex} />

        {results && <ResultsDashboard results={results} inputs={inputs} />}

        {!results && status === RunStatus.IDLE && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg text-center px-6">Fill in your campaign parameters and click "Run Optimization" to see results.</p>
          </div>
        )}
      </main>

      <footer className="mt-20 py-8 border-t border-slate-800 flex justify-between items-center text-slate-500 text-sm">
        <div>&copy; 2026 Advantiv - Proprietary Optimization Engine by Springbok Media</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition">BigQuery Docs</a>
          <a href="#" className="hover:text-white transition">API Status</a>
          <a href="#" className="hover:text-white transition">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
