// src/app/admin/components/cards/StatCard.tsx
/**
 * StatCard Component
 * Displays a single statistic with icon, value, and trend indicator.
 */
"use client";

import { BsArrowDown, BsArrowUp } from 'react-icons/bs';
import { StatCardProps } from '../../types/admin';
import { LoadingSkeleton } from '../common/Loading';

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  trend,
  loading = false
}) => {
  const getTrendColor = () => {
    if (!trend) return '';
    return trend === 'up' 
      ? 'text-green-500' 
      : 'text-red-500';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    const TrendIcon = trend === 'up' ? BsArrowUp : BsArrowDown;
    return (
      <TrendIcon className={`h-4 w-4 ${getTrendColor()}`} />
    );
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg">
        <LoadingSkeleton variant="rectangular" height={100} />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <dt className="text-sm font-medium text-gray-500 truncate mb-1">
            {title}
          </dt>
          <dd>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">
                {value}
              </p>
              {(change !== undefined && trend) && (
                <p className={`
                  ml-2 flex items-center text-sm
                  ${getTrendColor()}
                `}>
                  {getTrendIcon()}
                  <span className="ml-1">
                    {change > 0 ? '+' : ''}{change}%
                  </span>
                </p>
              )}
            </div>
          </dd>
        </div>
        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
