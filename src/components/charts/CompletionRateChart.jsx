import React from 'react';

const CompletionRateChart = ({ rate = 78, completed = 74, inProgress = 32, overdue = 12 }) => {
  const strokeDasharray = 2 * Math.PI * 52;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * rate) / 100;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4">
      {/* SVG Ring Progress */}
      <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="52"
            className="text-slate-100"
            strokeWidth="12"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            className="text-blue-600 transition-all duration-1000 ease-out"
            strokeWidth="12"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-slate-900">{rate}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion</span>
        </div>
      </div>

      {/* Legend Breakdown */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-700">Completed Tasks</span>
          </div>
          <span className="text-xs font-bold text-emerald-700">{completed}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/60 border border-blue-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-slate-700">In Progress</span>
          </div>
          <span className="text-xs font-bold text-blue-700">{inProgress}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-orange-50/60 border border-orange-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs font-semibold text-slate-700">Overdue Tasks</span>
          </div>
          <span className="text-xs font-bold text-orange-700">{overdue}</span>
        </div>
      </div>
    </div>
  );
};

export default CompletionRateChart;
