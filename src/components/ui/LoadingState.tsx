import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'กำลังโหลดข้อมูล...', size = 'md' }) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }[size];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className={`${iconSizes} text-mcu-primary animate-spin mb-3`} />
      <p className="text-sm text-gray-500 font-medium">{message}</p>
    </div>
  );
};
