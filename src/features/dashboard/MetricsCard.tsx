import React from 'react';
import { Card, CardContent } from '../../components/common/Card';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, icon, trend, trendUp }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            {trend && (
              <p className={`text-sm mt-2 font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {trendUp ? '↑' : '↓'} {trend}
              </p>
            )}
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
