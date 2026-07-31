import React from 'react';

const Skeleton = ({ className = '', height = 'h-4', width = 'w-full', rounded = 'rounded-lg' }) => {
  return (
    <div className={`bg-slate-200 animate-skeleton ${height} ${width} ${rounded} ${className}`} />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton width="w-1/3" height="h-6" />
      <Skeleton width="w-10" height="h-10" rounded="rounded-xl" />
    </div>
    <Skeleton width="w-1/2" height="h-8" />
    <Skeleton width="w-3/4" height="h-4" />
  </div>
);

export const TableSkeleton = () => (
  <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
    <Skeleton height="h-10" width="w-full" rounded="rounded-xl" />
    {[1, 2, 3, 4].map(i => (
      <Skeleton key={i} height="h-12" width="w-full" rounded="rounded-lg" />
    ))}
  </div>
);

export default Skeleton;
