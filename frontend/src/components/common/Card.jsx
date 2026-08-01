import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  action, 
  className = '', 
  hover = true,
  variant = 'default' 
}) => {
  const baseStyle = "bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm";
  const hoverStyle = hover ? "card-hover transition-all duration-200" : "";
  const variantStyle = variant === 'blue' ? "blue-gradient-bg text-white border-transparent" : "";

  return (
    <div className={`${baseStyle} ${hoverStyle} ${variantStyle} ${className}`}>
      {(title || Icon || action) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2.5 rounded-xl ${variant === 'blue' ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && <h3 className={`font-semibold text-lg ${variant === 'blue' ? 'text-white' : 'text-slate-900'}`}>{title}</h3>}
              {subtitle && <p className={`text-xs ${variant === 'blue' ? 'text-blue-100' : 'text-slate-500'}`}>{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
