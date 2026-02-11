
import React, { useEffect } from 'react';
import { CampaignInputs } from '../types';
import { GOAL_TYPES, GENDERS, COUNTRIES } from '../constants';

interface Props {
  inputs: CampaignInputs;
  setInputs: React.Dispatch<React.SetStateAction<CampaignInputs>>;
}

const InputSection: React.FC<Props> = ({ inputs, setInputs }) => {
  // Auto-calculate duration in weeks when dates change
  useEffect(() => {
    if (inputs.campaign_start_date && inputs.campaign_end_date) {
      const start = new Date(inputs.campaign_start_date);
      const end = new Date(inputs.campaign_end_date);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const diffWeeks = Math.max(1, Math.floor(diffDays / 7));
      
      if (diffWeeks !== inputs.campaign_duration) {
        setInputs(prev => ({ ...prev, campaign_duration: diffWeeks }));
      }
    }
  }, [inputs.campaign_start_date, inputs.campaign_end_date]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? (value === '' ? '' : Number(value)) 
        : value
    }));
  };

  const setGoalType = (type: string) => {
    setInputs(prev => ({ ...prev, goal_type: type }));
  };

  const setCountry = (country: string) => {
    setInputs(prev => ({ ...prev, country }));
  };

  const setGender = (gender: string) => {
    setInputs(prev => ({ ...prev, gender }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent 'e', 'E', '+', '-' in number inputs
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl mb-6 shadow-xl">
      <h2 className="text-xl font-bold mb-6 text-blue-400 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Campaign Parameters
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
        {/* Column 1 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Customer Name</label>
            <input type="text" name="customer_name" value={inputs.customer_name} onChange={handleChange} className="input-field w-full px-3 py-2 rounded-lg text-sm" placeholder="Enter customer" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Campaign Name</label>
            <input type="text" name="campaign_name" value={inputs.campaign_name} onChange={handleChange} className="input-field w-full px-3 py-2 rounded-lg text-sm" placeholder="Summer 2026 Launch" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Total Budget (€)</label>
            <input type="number" name="total_budget" value={inputs.total_budget} onKeyDown={handleKeyDown} onChange={handleChange} className="input-field w-full px-3 py-2 rounded-lg text-sm" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Goal Type</label>
            <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-800 h-[42px]">
              {GOAL_TYPES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoalType(g)}
                  className={`flex-1 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    inputs.goal_type === g
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Start Date</label>
              <input type="date" name="campaign_start_date" value={inputs.campaign_start_date} onChange={handleChange} className="input-field w-full px-2 py-2 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">End Date</label>
              <input type="date" name="campaign_end_date" value={inputs.campaign_end_date} onChange={handleChange} className="input-field w-full px-2 py-2 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Duration (Weeks)</label>
            <input type="number" name="campaign_duration" value={inputs.campaign_duration} readOnly className="input-field w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 cursor-not-allowed text-slate-400" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Target Country</label>
            <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-800 h-[42px]">
              {COUNTRIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCountry(c)}
                  className={`flex-1 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    inputs.country === c
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Gender</label>
            <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-800 h-[42px]">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    inputs.gender === g
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Min Age</label>
              <input type="number" name="age_min" value={inputs.age_min} onKeyDown={handleKeyDown} onChange={handleChange} className="input-field w-full px-3 py-2 rounded-lg text-sm" placeholder="e.g. 18" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Max Age</label>
              <input type="number" name="age_max" value={inputs.age_max} onKeyDown={handleKeyDown} onChange={handleChange} className="input-field w-full px-3 py-2 rounded-lg text-sm" placeholder="e.g. 65" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Min Contact Frequency</label>
            <input type="number" name="minimal_contact_frequency" value={inputs.minimal_contact_frequency} onKeyDown={handleKeyDown} onChange={handleChange} className="input-field w-full px-3 py-2 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Max Channels</label>
            <input type="number" name="max_channels" value={inputs.max_channels} onKeyDown={handleKeyDown} onChange={handleChange} className="input-field w-full px-3 py-2 rounded-lg text-sm" />
          </div>
        </div>

        {/* Column 4 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Target Reach</label>
            <input type="number" name="target_reach" value={inputs.target_reach} onKeyDown={handleKeyDown} onChange={handleChange} className="input-field w-full px-3 py-2 rounded-lg text-sm" placeholder="0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputSection;
