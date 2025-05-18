import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white'
  };

  return (
    <div className="flex justify-center items-center">
      <div 
        className={`animate-spin rounded-full border-t-2 border-b-2 ${colorClasses[color]} ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default LoadingSpinner; 