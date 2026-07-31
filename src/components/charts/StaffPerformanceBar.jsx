import React from 'react';

const StaffPerformanceBar = () => {
  const staffData = [
    { name: 'Prof. Sarah Jenkins', dept: 'Computer Science', total: 18, completed: 15, pct: 83 },
    { name: 'Dr. Robert Chen', dept: 'Data Science & AI', total: 14, completed: 10, pct: 71 },
    { name: 'Prof. Elena Rostova', dept: 'Electrical Engineering', total: 12, completed: 9, pct: 75 },
    { name: 'Dr. Marcus Vance', dept: 'Mechanical Engineering', total: 10, completed: 8, pct: 80 }
  ];

  return (
    <div className="space-y-4">
      {staffData.map((item, index) => (
        <div key={index} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <div>
              <span className="font-bold text-slate-800">{item.name}</span>
              <span className="text-slate-400 ml-2">({item.dept})</span>
            </div>
            <span className="font-bold text-blue-600">{item.completed}/{item.total} Done ({item.pct}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-700" 
              style={{ width: `${item.pct}%` }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StaffPerformanceBar;
