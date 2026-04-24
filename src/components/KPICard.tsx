import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title?: string;
  value?: string;
  subtitle?: string;
  trend?: number;
  icon?: ReactNode;
  gradient?: string;
  delay?: number;
}

export default function KPICard({
  title = `Total Balance`,
  value = `$0.00`,
  subtitle = `This month`,
  trend = 0,
  icon = null,
  gradient = `gradient-blue`,
  delay = 0,
}: KPICardProps) {
  const isPositive = trend >= 0;
  return (
    <div
      data-cmp="KPICard"
      className="bg-card rounded-xl p-5 border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-0.5 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        </div>
        <div className={`w-10 h-10 ${gradient} rounded-xl flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${isPositive ? `income-bg income-text` : `expense-bg expense-text`}`}>
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(trend)}%
        </div>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
    </div>
  );
}
