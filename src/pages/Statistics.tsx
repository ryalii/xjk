import { useMemo } from 'react';
import {
  BarChart2, TrendingUp, PieChart as PieIcon, Activity
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { categoryLabels } from '../lib/categoryConfig';
import { useFinance } from '../hooks/useFinance';

const fmt = (n: number) => `¥${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

// Build weekly data for current month
const weeklyData = [
  { week: `第1周`, income: 8500, expense: 1988.5 },
  { week: `第2周`, income: 1200, expense: 736.67 },
  { week: `第3周`, income: 650, expense: 688.79 },
  { week: `第4周`, income: 340, expense: 0 },
];

// Category pie slices with % share

export default function Statistics() {
  const { summary: mockMonthlySummary, transactions, isLoading } = useFinance();

  // Calculate current month category spending
  const categorySpending = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const categoryTotals: Record<string, number> = {};
    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (tx.type === 'expense' && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      }
    });

    const categoryColors: Record<string, string> = {
      Housing: '#3B82F6', Food: '#10B981', Transport: '#06B6D4', Entertainment: '#A855F7',
      Shopping: '#F59E0B', Healthcare: '#EF4444', Utilities: '#8B5CF6', Education: '#F97316', Other: '#6B7280',
    };

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name: categoryLabels[name] || name,
      value,
      color: categoryColors[name] || '#6B7280',
    }));
  }, [transactions]);

  const totalCatSpend = useMemo(() => categorySpending.reduce((s, c) => s + c.value, 0), [categorySpending]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">加载中...</div>;
  }

  return (
    <div data-cmp="Statistics" className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">统计分析</h1>
          <p className="text-sm text-muted-foreground mt-0.5">详细的财务分析和建议</p>
        </div>
        <select className="text-sm px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option>近6个月</option>
          <option>今年</option>
          <option>去年</option>
        </select>
      </div>

      {/* Top row */}
      <div className="flex gap-5 mb-5">
        {/* Monthly Trend Area Chart */}
        <div className="lg:flex-[3] bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">收支趋势</h3>
              <p className="text-xs text-muted-foreground mt-0.5">6个月概览</p>
            </div>
            <Activity size={16} className="text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockMonthlySummary} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeG2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseG2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="savingsG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.8)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `¥${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number, n: string) => [`¥${v.toLocaleString()}`, n.charAt(0).toUpperCase() + n.slice(1)]} />
              <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2.5} fill="url(#incomeG2)" name="收入" dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2.5} fill="url(#expenseG2)" name="支出" dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Net Savings Line */}
        <div className="lg:flex-[2] bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">净储蓄</h3>
              <p className="text-xs text-muted-foreground mt-0.5">月度盈余</p>
            </div>
            <TrendingUp size={16} className="text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mockMonthlySummary.map(m => ({ ...m, savings: m.income - m.expense }))} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.8)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `¥${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`¥${v.toLocaleString()}`, `储蓄`]} />
              <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Middle row */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 mb-4 lg:mb-5">
        {/* Weekly Bars */}
        <div className="lg:flex-1 bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card overflow-x-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">每周明细</h3>
              <p className="text-xs text-muted-foreground mt-0.5">本月</p>
            </div>
            <BarChart2 size={16} className="text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.8)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `¥${v}`} />
              <Tooltip formatter={(v: number, name: string) => [`¥${v.toLocaleString()}`, name]} />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="收入" />
              <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="支出" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Donut */}
        <div className="lg:flex-1 bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">支出分类</h3>
              <p className="text-xs text-muted-foreground mt-0.5">本月分布</p>
            </div>
            <PieIcon size={16} className="text-muted-foreground" />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={categorySpending} cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                  {categorySpending.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [`¥${v}`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 w-full space-y-2">
              {categorySpending.map(cat => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }}></div>
                    <span className="text-xs text-muted-foreground truncate">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-foreground">{((cat.value / totalCatSpend) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Insights */}
        <div className="lg:flex-1 bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">关键洞察</h3>
          <div className="space-y-2 sm:space-y-3">
            {[
              { title: `最高收入月份`, value: `¥12,000`, sub: `3个月前`, color: `income-text`, icon: `↑` },
              { title: `最低支出月份`, value: `¥4,120`, sub: `6个月前`, color: `income-text`, icon: `↓` },
              { title: `最佳储蓄率`, value: `48.2%`, sub: `3个月前`, color: `income-text`, icon: `✦` },
              { title: `平均月收入`, value: `¥10,253`, sub: `6个月平均`, color: `text-primary`, icon: `≈` },
              { title: `平均月支出`, value: `¥5,031`, sub: `6个月平均`, color: `warning-text`, icon: `≈` },
              { title: `总储蓄(6个月)`, value: `¥31,332`, sub: `累计`, color: `income-text`, icon: `¥` },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                <div className={`text-sm font-bold ${item.color} w-5 text-center shrink-0 mt-0.5`}>{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{item.title}</p>
                  <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly comparison table */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm sm:text-base">月度汇总表</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                {[`月份`, `收入`, `支出`, `净储蓄`, `储蓄率`, `状态`].map(h => (
                  <th key={h} className="px-4 sm:px-5 py-2.5 sm:py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockMonthlySummary.map((row, i) => {
                const net = row.income - row.expense;
                const rate = ((net / row.income) * 100).toFixed(1);
                return (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium text-foreground">{row.month}</td>
                    <td className="px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold income-text">{fmt(row.income)}</td>
                    <td className="px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold expense-text">{fmt(row.expense)}</td>
                    <td className="px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold text-foreground">{fmt(net)}</td>
                    <td className="px-4 sm:px-5 py-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[60px] sm:max-w-[80px] h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full gradient-blue rounded-full" style={{ width: `${rate}%` }}></div>
                        </div>
                        <span className="text-muted-foreground">{rate}%</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${parseFloat(rate) >= 40 ? `income-bg income-text` : parseFloat(rate) >= 25 ? `warning-bg warning-text` : `expense-bg expense-text`}`}>
                        {parseFloat(rate) >= 40 ? `优秀` : parseFloat(rate) >= 25 ? `良好` : `一般`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
