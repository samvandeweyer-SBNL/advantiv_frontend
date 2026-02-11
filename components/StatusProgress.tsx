
import React from 'react';
import { RunStatus } from '../types';
import { STATUS_STEPS } from '../constants';

interface Props {
  status: RunStatus;
  currentStepIndex: number;
}

const StatusProgress: React.FC<Props> = ({ status, currentStepIndex }) => {
  if (status === RunStatus.IDLE) return null;

  const getProgressWidth = () => {
    if (status === RunStatus.COMPLETED) return '100%';
    const stepPercent = 100 / STATUS_STEPS.length;
    return `${(currentStepIndex + 0.5) * stepPercent}%`;
  };

  return (
    <div className="glass-card p-6 rounded-2xl mb-6 border-blue-500/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-300">Engine Progress</h3>
        <span className="text-sm px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/30 animate-pulse">
          {status === RunStatus.COMPLETED ? 'Optimization Complete' : 'Calculating Scenarios...'}
        </span>
      </div>

      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-8">
        <div 
          className="absolute h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-700 ease-in-out" 
          style={{ width: getProgressWidth() }}
        ></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {STATUS_STEPS.map((step, idx) => {
          const isActive = idx <= currentStepIndex || status === RunStatus.COMPLETED;
          const isCurrent = idx === currentStepIndex && status !== RunStatus.COMPLETED;
          
          return (
            <div key={step.key} className={`flex flex-col gap-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-blue-500 animate-ping' : isActive ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                <span className={`text-xs font-medium uppercase tracking-wider ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>Step {idx + 1}</span>
              </div>
              <span className="text-sm text-slate-300 truncate">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusProgress;
