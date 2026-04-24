import { useState } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Plus, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { BudgetItem, categoryLabels } from '../data/mockData';
import AddBudgetModal from '../components/AddBudgetModal';
import { useFinance } from '../hooks/useFinance';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const PAGE_SIZE = 20;

const fmt = (n: number) => `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const statusInfo = (pct: number) => {
  if (pct >= 100) return { label: `超支`, color: `expense-text`, bg: `expense-bg`, icon: <AlertTriangle size={12} /> };
  if (pct >= 80) return { label: `警告`, color: `warning-text`, bg: `warning-bg`, icon: <AlertTriangle size={12} /> };
  return { label: `正常`, color: `income-text`, bg: `income-bg`, icon: <CheckCircle size={12} /> };
};

export default function Budget() {
  const { budgets, isLoading } = useFinance();
  const [activeTab, setActiveTab] = useState<`overview` | `details`>(`overview`);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalPct = Math.round((totalSpent / totalBudget) * 100);
  const remaining = totalBudget - totalSpent;

  const totalPages = Math.ceil(budgets.length / PAGE_SIZE);
  const paginatedBudgets = budgets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const barData = budgets.map(b => ({
    name: categoryLabels[b.category] || b.category,
    budget: b.limit,
    spent: b.spent,
    color: b.color,
  }));

  // 处理新预算添加 (自动刷新)
  const handleBudgetAdded = (budget: BudgetItem) => {
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">加载中...</div>;
  }

  return (
    <div data-cmp="Budget" className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">预算规划</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">追踪和管理每月支出限额</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-secondary rounded-lg p-1">
            {(['overview', 'details'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md font-medium capitalize transition-all ${activeTab === tab ? `bg-card text-foreground shadow-card` : `text-muted-foreground hover:text-foreground`}`}
              >
                {tab === 'overview' ? '概览' : '详情'}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 gradient-blue text-white text-xs sm:text-sm font-semibold rounded-lg hover:opacity-90 transition-all"
          >
            <Plus size={15} />
            添加预算
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: `总预算`, value: fmt(totalBudget), icon: <Target size={18} className="text-white" />, gradient: `gradient-blue` },
          { label: `总支出`, value: fmt(totalSpent), icon: <TrendingUp size={18} className="text-white" />, gradient: totalPct > 80 ? `gradient-amber` : `gradient-green` },
          { label: `剩余`, value: fmt(remaining), icon: <CheckCircle size={18} className="text-white" />, gradient: `gradient-purple` },
          { label: `已用`, value: `${totalPct}%`, icon: <BarChart3 size={18} className="text-white" />, gradient: totalPct > 90 ? `gradient-rose` : `gradient-amber` },
        ].map(card => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-card flex items-center gap-2 sm:gap-3 hover:shadow-hover transition-all hover:-translate-y-0.5">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 ${card.gradient} rounded-xl flex items-center justify-center shrink-0`}>{card.icon}</div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{card.label}</p>
              <p className="text-lg sm:text-xl font-bold text-foreground truncate">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">月度总预算</span>
          <span className={`text-sm font-bold ${totalPct > 90 ? `expense-text` : totalPct > 70 ? `warning-text` : `income-text`}`}>{totalPct}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${totalPct > 90 ? `gradient-rose` : totalPct > 70 ? `gradient-amber` : `gradient-green`}`}
            style={{ width: `${Math.min(totalPct, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>已支出: {fmt(totalSpent)}</span>
          <span>限额: {fmt(totalBudget)}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
        {/* Budget Cards */}
        <div className="flex-[3]">
          <div className={activeTab === 'overview' ? `flex flex-col gap-3` : `hidden`}>
            {paginatedBudgets.map((b, i) => {
              const pct = Math.round((b.spent / b.limit) * 100);
              const status = statusInfo(pct);
              return (
                <div key={b.id} className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card hover:shadow-hover transition-all hover:-translate-y-0.5 animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${b.color}18` }}>
                      <div className="w-3 h-3 rounded-full" style={{ background: b.color }}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="font-medium text-foreground text-sm">{categoryLabels[b.category] || b.category}</span>
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                            {status.icon}
                            {status.label}
                          </span>
                          <span className="text-sm font-bold text-foreground">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? '#EF4444' : pct >= 80 ? '#F59E0B' : b.color }}
                        ></div>
                      </div>
                      <div className="flex flex-wrap justify-between gap-1 text-xs text-muted-foreground">
                        <span>已支出: <span className="font-semibold text-foreground">{fmt(b.spent)}</span></span>
                        <span>限额: <span className="font-semibold text-foreground">{fmt(b.limit)}</span></span>
                        <span>剩余: <span className={`font-semibold ${b.limit - b.spent < 0 ? `expense-text` : `income-text`}`}>{fmt(b.limit - b.spent)}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 text-xs rounded-lg transition-colors ${currentPage === pageNum ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-secondary'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          <div className={activeTab === 'details' ? `bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card overflow-x-auto` : `hidden`}>
            <h3 className="font-semibold text-foreground mb-4">预算与支出对比</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.8)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `¥${v}`} />
                <Tooltip formatter={(v: number, name: string) => [`¥${v.toLocaleString()}`, name]} />
                <Bar dataKey="budget" fill="#E5E7EB" radius={[4, 4, 0, 0]} name="预算" />
                <Bar dataKey="spent" radius={[4, 4, 0, 0]} name="已支出">
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-[2] flex flex-col gap-4 lg:gap-5">
          {/* Donut */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">支出分布</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={budgets} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="spent" stroke="none">
                  {budgets.map((b, i) => <Cell key={i} fill={b.color} />)}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
                        <p className="font-medium text-foreground">{categoryLabels[data.category] || data.category}</p>
                        <p className="text-muted-foreground">已支出: <span className="font-semibold text-foreground">¥{data.spent.toLocaleString()}</span></p>
                      </div>
                    );
                  }
                  return null;
                }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {budgets.map(b => (
                <div key={b.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: b.color }}></div>
                    <span className="text-muted-foreground truncate">{categoryLabels[b.category] || b.category}</span>
                  </div>
                  <span className="font-semibold text-foreground shrink-0">{fmt(b.spent)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget health */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">预算健康度</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 income-bg rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="income-text" />
                  <span className="text-foreground font-medium">正常</span>
                </div>
                <span className="income-text font-bold">{budgets.filter(b => (b.spent / b.limit) < 0.8).length} 个分类</span>
              </div>
              <div className="flex items-center justify-between p-3 warning-bg rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="warning-text" />
                  <span className="text-foreground font-medium">警告</span>
                </div>
                <span className="warning-text font-bold">{budgets.filter(b => { const p = b.spent / b.limit; return p >= 0.8 && p < 1; }).length} 个分类</span>
              </div>
              <div className="flex items-center justify-between p-3 expense-bg rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="expense-text" />
                  <span className="text-foreground font-medium">超支</span>
                </div>
                <span className="expense-text font-bold">{budgets.filter(b => b.spent >= b.limit).length} 个分类</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 添加预算弹窗 */}
      <AddBudgetModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onBudgetAdded={handleBudgetAdded}
      />
    </div>
  );
}
