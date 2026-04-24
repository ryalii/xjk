import { useState, useMemo } from 'react';
import {
  Wallet, TrendingUp, PiggyBank, BarChart3,
  ArrowUpRight, ArrowDownRight, Clock, Plus
} from 'lucide-react';
import KPICard from '../components/KPICard';
import TransactionRow from '../components/TransactionRow';
import AddTransactionModal from '../components/AddTransactionModal';
import {
  Transaction, categoryLabels
} from '../data/mockData';
import { useFinance } from '../hooks/useFinance';
import {
  CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

const fmt = (n: number) => `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// 分类颜色映射
const categoryColors: Record<string, string> = {
  Housing: '#3B82F6',
  Food: '#10B981',
  Transport: '#06B6D4',
  Entertainment: '#A855F7',
  Shopping: '#F59E0B',
  Healthcare: '#EF4444',
  Utilities: '#8B5CF6',
  Education: '#F97316',
  Other: '#6B7280',
  Salary: '#3B82F6',
  Freelance: '#6366F1',
  Investment: '#10B981',
  Gift: '#F59E0B',
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-hover text-xs">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.name === 'income' ? `#10B981` : `#EF4444` }}></div>
          <span className="text-muted-foreground capitalize">{p.name === 'income' ? '收入' : '支出'}:</span>
          <span className="font-bold text-foreground">¥{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  // Modal 状态
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 从 useFinance 获取实时数据
  const { transactions, kpi: kpiStats, summary: mockMonthlySummary, isLoading } = useFinance();

  // 计算最近的 6 条交易
  const recentTx = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  }, [transactions]);

  // 计算本月分类支出
  const currentMonthCategorySpending = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 按分类汇总本月支出
    const categoryTotals: Record<string, number> = {};
    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (tx.type === 'expense' && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      }
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name: categoryLabels[name] || name,
      value,
      color: categoryColors[name] || '#6B7280',
    }));
  }, [transactions]);

  // 处理新交易添加 (由 hook 处理，这里只需占位或做额外逻辑)
  const handleTransactionAdded = () => {
    // 自动刷新由 useFinance 内部 queryClient.invalidateQueries 处理
  };

  const { totalIncome, totalExpense, netSavings, savingsRate, totalBalance, budgetUsed, monthlyBudget } = kpiStats;
  const budgetPct = Math.round((budgetUsed / monthlyBudget) * 100);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">加载中...</div>;
  }

  return (
    <div data-cmp="Dashboard" className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">财务概览</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 添加交易按钮 */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-xs sm:text-sm shadow-sm"
          >
            <Plus size={16} className="sm:w-[18px]" />
            添加交易
          </button>
          <select className="text-xs sm:text-sm px-2 sm:px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option>本月</option>
            <option>上月</option>
            <option>最近3个月</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-7">
        <KPICard title={`总余额`} value={fmt(totalBalance)} subtitle={`较上月`} trend={5.4} icon={<Wallet size={18} className="text-white" />} gradient={`gradient-blue`} delay={0} />
        <KPICard title={`本月收入`} value={fmt(totalIncome)} subtitle={`较上月`} trend={2.1} icon={<ArrowUpRight size={18} className="text-white" />} gradient={`gradient-green`} delay={60} />
        <KPICard title={`本月支出`} value={fmt(totalExpense)} subtitle={`较上月`} trend={-8.3} icon={<ArrowDownRight size={18} className="text-white" />} gradient={`gradient-rose`} delay={120} />
        <KPICard title={`净储蓄`} value={fmt(netSavings)} subtitle={`储蓄率 ${savingsRate}%`} trend={12.7} icon={<PiggyBank size={18} className="text-white" />} gradient={`gradient-purple`} delay={180} />
      </div>

      {/* Charts Row */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 mb-5 sm:mb-7">
        {/* Area Chart */}
        <div className="flex-1 bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-3 sm:mb-5">
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">收入支出趋势</h3>
              <p className="text-xs text-muted-foreground mt-0.5">近6个月</p>
            </div>
            <BarChart3 size={18} className="text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockMonthlySummary} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.8)" vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2.5} fill="url(#incomeGrad)" dot={false} activeDot={{ r: 4, fill: '#10B981' }} />
              <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2.5} fill="url(#expenseGrad)" dot={false} activeDot={{ r: 4, fill: '#EF4444' }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-muted-foreground">收入</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-muted-foreground">支出</span>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="lg:w-[280px] xl:w-[320px] bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card animate-slide-up" style={{ animationDelay: '260ms' }}>
          <div className="mb-3 sm:mb-4">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">分类支出</h3>
            <p className="text-xs text-muted-foreground mt-0.5">本月</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={currentMonthCategorySpending}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {currentMonthCategorySpending.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number, name: string) => [`¥${v.toLocaleString()}`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {currentMonthCategorySpending.slice(0, 4).map(cat => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }}></div>
                  <span className="text-muted-foreground">{cat.name}</span>
                </div>
                <span className="font-semibold text-foreground">¥{cat.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">
        {/* Recent Transactions */}
        <div className="lg:flex-[3] bg-card border border-border rounded-xl shadow-card animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
            <div>
              <h3 className="font-semibold text-foreground">最近交易</h3>
              <p className="text-xs text-muted-foreground mt-0.5">最新活动</p>
            </div>
            <a href="/transactions" className="text-xs font-medium text-primary hover:opacity-80 flex items-center gap-1 transition-opacity">
              查看全部 <ArrowUpRight size={12} />
            </a>
          </div>
          <div className="px-2 pb-3">
            {recentTx.map(tx => (
              <TransactionRow key={tx.id} transaction={tx} compact />
            ))}
          </div>
        </div>

        {/* Budget Snapshot */}
        <div className="lg:flex-[2] bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card animate-slide-up" style={{ animationDelay: '340ms' }}>
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h3 className="font-semibold text-foreground">预算状态</h3>
              <p className="text-xs text-muted-foreground mt-0.5">本月已用 {budgetPct}%</p>
            </div>
            <TrendingUp size={18} className="text-muted-foreground" />
          </div>
          {/* Overall bar */}
          <div className="mb-4 sm:mb-5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">总预算</span>
              <span className="font-semibold text-foreground">{fmt(budgetUsed)} / {fmt(monthlyBudget)}</span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${budgetPct > 90 ? `gradient-rose` : budgetPct > 70 ? `gradient-amber` : `gradient-green`}`}
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: `餐饮`, used: 734, limit: 1200, color: `#10B981` },
              { label: `购物`, used: 745, limit: 800, color: `#F59E0B` },
              { label: `娱乐`, used: 354, limit: 400, color: `#A855F7` },
              { label: `交通`, used: 282, limit: 600, color: `#06B6D4` },
            ].map(b => {
              const pct = Math.round((b.used / b.limit) * 100);
              return (
                <div key={b.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{b.label}</span>
                    <span className="text-foreground font-medium">¥{b.used} / ¥{b.limit}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: b.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <a href="/budget" className="mt-4 flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80 transition-opacity">
            管理预算 <ArrowUpRight size={12} />
          </a>
        </div>

        {/* Quick Stats */}
        <div className="lg:flex-[2] bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card animate-slide-up" style={{ animationDelay: '380ms' }}>
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <Clock size={16} className="text-muted-foreground" />
            <h3 className="font-semibold text-foreground text-sm sm:text-base">快速统计</h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {[
              { label: `日均支出`, value: `¥341.40`, change: `-5.2%`, up: false },
              { label: `最大支出`, value: `¥3,600`, tag: `住房` },
              { label: `主要收入`, value: `¥17,000`, tag: `工资` },
              { label: `储蓄目标进度`, value: `72%`, progress: 72 },
              { label: `定期账单`, value: `¥4,479`, tag: `11个活跃` },
            ].map((stat, i) => (
              <div key={i} className="flex items-start justify-between">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground">{stat.value}</span>
                  {stat.tag && <span className="ml-2 text-xs px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">{stat.tag}</span>}
                  {stat.change && (
                    <span className={`ml-1 text-xs font-medium ${stat.up ? `income-text` : `expense-text`}`}>{stat.change}</span>
                  )}
                  {stat.progress !== undefined && (
                    <div className="mt-1 w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full gradient-blue rounded-full" style={{ width: `${stat.progress}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 添加交易弹窗 */}
      <AddTransactionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  );
}
