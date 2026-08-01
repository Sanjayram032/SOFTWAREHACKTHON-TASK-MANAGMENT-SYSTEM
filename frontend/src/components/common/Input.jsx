import React from 'react';

export const Input = ({ 
  label, 
  error, 
  helpText,
  icon: Icon, 
  type = 'text', 
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-hidden transition-all duration-150 ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''} ${className}`}
          {...props}
        />
      </div>
      {helpText && <p className="text-[11px] text-slate-500">{helpText}</p>}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
};

export const Select = ({ 
  label, 
  options = [], 
  error, 
  helpText,
  icon: Icon, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <select
          className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 ${Icon ? 'pl-10' : 'pl-3.5'} pr-8 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-hidden appearance-none transition-all duration-150 ${error ? 'border-rose-500' : ''} ${className}`}
          {...props}
        >
          {options.map((opt, i) => (
            <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
              {typeof opt === 'object' ? opt.label : opt}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 text-slate-400 pointer-events-none">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {helpText && <p className="text-[11px] text-slate-500">{helpText}</p>}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
};
