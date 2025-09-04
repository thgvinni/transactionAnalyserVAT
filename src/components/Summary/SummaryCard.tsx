import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  subtitle?: string;
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  subtitle,
}) => {
  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs mt-1 opacity-70">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};