
import React from 'react';
import { AVAILABLE_CHANNELS, DIGITAL_CHANNELS, TV_OFFLINE_CHANNELS, CHANNEL_DEFAULTS } from '../constants';
import { CampaignInputs, ChannelConfig } from '../types';

interface Props {
  inputs: CampaignInputs;
  onChange: (inputs: CampaignInputs) => void;
}

const ChannelSelector: React.FC<Props> = ({ inputs, onChange }) => {
  const selected = inputs.channel_selection;
  const settings = inputs.channel_settings;

  const updateChannels = (newSelection: string[]) => {
    const newSettings = { ...settings };
    newSelection.forEach(ch => {
      if (!newSettings[ch]) {
        const defaults = CHANNEL_DEFAULTS[ch] || { cpm: 0, tv_factor: 1 };
        newSettings[ch] = { 
          always_include: false, 
          frequency_capping: false,
          cpm: defaults.cpm,
          tv_factor: defaults.tv_factor
        };
      }
    });
    
    onChange({
      ...inputs,
      channel_selection: newSelection,
      channel_settings: newSettings
    });
  };

  const toggleChannel = (channel: string) => {
    if (selected.includes(channel)) {
      updateChannels(selected.filter(c => c !== channel));
    } else {
      updateChannels([...selected, channel]);
    }
  };

  const updateSetting = (channel: string, field: keyof ChannelConfig, value: any) => {
    onChange({
      ...inputs,
      channel_settings: {
        ...settings,
        [channel]: {
          ...settings[channel],
          [field]: value
        }
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const selectAll = () => updateChannels([...AVAILABLE_CHANNELS]);
  const clearAll = () => updateChannels([]);
  const selectDigital = () => updateChannels([...DIGITAL_CHANNELS]);
  const selectTV = () => updateChannels([...TV_OFFLINE_CHANNELS]);

  return (
    <div className="glass-card p-6 rounded-2xl shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Channels Configuration
        </h2>
        <div className="flex flex-wrap gap-2 text-xs">
          <button onClick={selectAll} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700">All</button>
          <button onClick={selectDigital} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700">Digital Only</button>
          <button onClick={selectTV} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700">TV Only</button>
          <button onClick={clearAll} className="px-3 py-1 bg-slate-800 hover:bg-rose-500/20 hover:border-rose-500/50 rounded-lg transition border border-slate-700">Clear</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {AVAILABLE_CHANNELS.map(channel => {
          const isSelected = selected.includes(channel);
          const config = settings[channel] || { always_include: false, frequency_capping: false };

          return (
            <div 
              key={channel} 
              className={`flex flex-col rounded-2xl border transition-all duration-300 ${
                isSelected 
                  ? 'bg-emerald-500/5 border-emerald-500/40 shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)]' 
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <label className="flex items-center gap-3 p-4 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={isSelected}
                  onChange={() => toggleChannel(channel)}
                />
                <div className={`w-5 h-5 flex-shrink-0 rounded border transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 bg-slate-800'}`}>
                  {isSelected && (
                    <svg className="w-4 h-4 text-white mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm font-semibold truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {channel}
                </span>
              </label>

              {isSelected && (
                <div className="p-4 pt-0 space-y-3 border-t border-emerald-500/10 mt-1 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Always Include</label>
                    <button 
                      onClick={() => updateSetting(channel, 'always_include', !config.always_include)}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${config.always_include ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${config.always_include ? 'translate-x-4.5' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Frequency Capping</label>
                    <button 
                      onClick={() => updateSetting(channel, 'frequency_capping', !config.frequency_capping)}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${config.frequency_capping ? 'bg-blue-500' : 'bg-slate-700'}`}
                    >
                      <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${config.frequency_capping ? 'translate-x-4.5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Fixed Budget (€)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">€</span>
                      <input 
                        type="number"
                        placeholder="Dynamic"
                        className="input-field w-full pl-7 pr-2 py-1.5 rounded-lg text-xs"
                        value={config.fixed_budget || ''}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => updateSetting(channel, 'fixed_budget', e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">CPM (€)</label>
                      <input 
                        type="number"
                        placeholder="0.00"
                        className="input-field w-full px-2 py-1.5 rounded-lg text-xs"
                        value={config.cpm || ''}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => updateSetting(channel, 'cpm', e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">TV Factor</label>
                      <input 
                        type="number"
                        placeholder="1.0"
                        className="input-field w-full px-2 py-1.5 rounded-lg text-xs"
                        value={config.tv_factor || ''}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => updateSetting(channel, 'tv_factor', e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Scale Factor</label>
                    <input 
                      type="number"
                      placeholder="1.0"
                      className="input-field w-full px-2 py-1.5 rounded-lg text-xs"
                      value={config.scale_factor || ''}
                      onKeyDown={handleKeyDown}
                      onChange={(e) => updateSetting(channel, 'scale_factor', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChannelSelector;
