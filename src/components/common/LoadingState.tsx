import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
        <p className="text-sm font-medium text-slate-500">Loading...</p>
      </div>
    </div>
  );
};
