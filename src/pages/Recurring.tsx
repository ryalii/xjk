import { useState } from 'react';
import { RefreshCw, TrendingUp, DollarSign, Plus, Calendar, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { RecurringBill, frequencyLabels, categoryLabels } from '../data/mockData';
import AddRecurringBillModal from '../components/AddRecurringBillModal';
import { useFinance } from '../hooks/useFinance';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PAGE_SIZE = 20;

const fmt = (n: number) => `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Recurring() {
  const { recurring: bills, isLoading } = useFinance();
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'stats'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalMonthly = bills.reduce((s, b) => s + b.amount, 0);
  const activeCount = bills.filter(b => b.status === 'active').length;
  const avgAmount = Math.round(totalMonthly / bills.length);

  const totalPages = Math.ceil(bills.length / PAGE_SIZE);
  const paginatedBills = bills.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // 趋势数据：最近6个月
  const trendData = [
    { month: '10月', amount: 4120 },
    { month: '11月', amount: 4380 },
    { month: '12月', amount: 4250 },
    { month: '1月', amount: 4479 },
    { month: '2月', amount: 4479 },
    { month: '3月', amount: 4479 },
  ];

  // 处理新账单添加 (自动刷新)
  const handleBillAdded = (bill: RecurringBill) => {
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">加载中...</div>;
  }

  return (
    <div data-cmp="Recurring" className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">定期账单</h1>
          <p className="text-sm text-muted-foreground mt-0.5">管理订阅和固定支出</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex bg-secondary rounded-lg p-1">
            {([
              { key: 'list', label: '列表' },
              { key: 'calendar', label: '日历' },
              { key: 'stats', label: '统计' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md font-medium transition-all ${activeTab === tab.key ? `bg-card text-foreground shadow-card` : `text-muted-foreground hover:text-foreground`}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 gradient-blue text-white text-xs sm:text-sm font-semibold rounded-lg hover:opacity-90 transition-all"
          >
            <Plus size={15} />
            添加账单
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: `每月总额`, value: fmt(totalMonthly), icon: <DollarSign size={18} className="text-white" />, gradient: `gradient-blue` },
          { label: `活跃账单`, value: `${activeCount} 个`, icon: <RefreshCw size={18} className="text-white" />, gradient: `gradient-green` },
          { label: `年均支出`, value: fmt(avgAmount * 12), icon: <TrendingUp size={18} className="text-white" />, gradient: `gradient-purple` },
          { label: `下月待付`, value: fmt(totalMonthly), icon: <Calendar size={18} className="text-white" />, gradient: `gradient-amber` },
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

      {/* List view */}
      <div className={activeTab === 'list' ? `flex flex-col gap-4` : `hidden`}>
        {/* Upcoming */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">即将到期</h3>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
            {bills.slice(0, 4).map((b) => (
              <div key={b.id} className="p-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-red-600">{b.nextDate.slice(5)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{b.name}</p>
                  <p className="text-xs text-red-500 font-medium">{fmt(b.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All bills */}
        {paginatedBills.map((b, i) => (
          <div key={b.id} className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card hover:shadow-hover transition-all hover:-translate-y-0.5 animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${b.color}18` }}>
                <RefreshCw size={18} style={{ color: b.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm">{b.name}</span>
                  <span className="text-sm font-bold text-foreground">{fmt(b.amount)} <span className="text-xs text-muted-foreground font-normal">/{frequencyLabels[b.frequency] || b.frequency}</span></span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: b.color }}></span>
                    {categoryLabels[b.category] || b.category}
                  </span>
                  <span>下次: {b.nextDate}</span>
                  <span>自动: {b.autopay ? `已启用` : `未启用`}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
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

      {/* Calendar view */}
      <div className={activeTab === 'calendar' ? `bg-card border border-border rounded-xl p-5 shadow-card` : `hidden`}>
        <h3 className="font-semibold text-foreground mb-4">账单日历</h3>
        <div className="grid grid-cols-7 gap-2">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="text-center text-xs text-muted-foreground py-2">{d}</div>
          ))}
          {/* 简化日历 */}
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 3; // 从4号开始
            const billsOnDay = bills.filter(b => {
              const dayNum = parseInt(b.nextDate.split('-')[2]);
              return dayNum === day;
            });
            return (
              <div key={i} className={`min-h-12 p-1 rounded-lg border ${day < 1 || day > 31 ? 'border-transparent' : 'border-border'} ${billsOnDay.length > 0 ? 'bg-primary/5' : ''}`}>
                {day >= 1 && day <= 31 && (
                  <>
                    <span className="text-xs text-muted-foreground">{day}</span>
                    {billsOnDay.slice(0, 2).map(b => (
                      <div key={b.id} className="text-xs truncate font-medium mt-0.5" style={{ color: b.color }}>{b.name}</div>
                    ))}
                    {billsOnDay.length > 2 && <div className="text-xs text-muted-foreground">+{billsOnDay.length - 2}</div>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats view */}
      <div className={activeTab === 'stats' ? `flex flex-col gap-5` : `hidden`}>
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">年度趋势</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="billGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.8)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `¥${v}`} />
              <Tooltip formatter={(v: number) => [`¥${v.toLocaleString()}`, `金额`]} />
              <Area type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={2.5} fill="url(#billGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 账单类型分布 */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">账单类型分布</h3>
            <div className="space-y-3">
              {[
                { label: `住房相关`, amount: 3600, pct: 80, color: `#3B82F6` },
                { label: `通讯网络`, amount: 299, pct: 7, color: `#10B981` },
                { label: `流媒体`, amount: 180, pct: 4, color: `#F59E0B` },
                { label: `健身`, amount: 200, pct: 5, color: `#A855F7` },
                { label: `其他`, amount: 200, pct: 4, color: `#6B7280` },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">{fmt(item.amount)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 节省建议 */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={16} className="text-amber-500" />
              <h3 className="font-semibold text-foreground">节省建议</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: '💡', text: `考虑取消不常用的流媒体订阅，预计节省 ¥50/月` },
                { icon: '🔔', text: `您的健身房会员使用率较低，建议暂停或降级` },
                { icon: '📊', text: `您的通讯费用高于平均，考虑更换套餐` },
                { icon: '⏰', text: `部分订阅可以改为按年付费，通常可节省15%` },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span>{tip.icon}</span>
                  <span className="text-muted-foreground">{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 添加账单弹窗 */}
      <AddRecurringBillModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onBillAdded={handleBillAdded}
      />
    </div>
  );
}
