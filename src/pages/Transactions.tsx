import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, ArrowUpRight, ArrowDownRight, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction, TransactionCategory, TransactionType } from '../data/mockData';
import { categoryIcons, categoryLabels } from '../lib/categoryConfig';
import AddIncomeModal from '../components/AddIncomeModal';
import { useFinance } from '../hooks/useFinance';

type SortField = 'date' | 'amount' | 'title';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 20;

const fmt = (n: number) => `¥${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Transactions() {
  const { transactions: mockTransactions, isLoading } = useFinance();
  const [search, setSearch] = useState(``);
  const [typeFilter, setTypeFilter] = useState<`all` | TransactionType>(`all`);
  const [catFilter, setCatFilter] = useState<`all` | TransactionCategory>(`all`);
  const [sortField, setSortField] = useState<SortField>(`date`);
  const [sortDir, setSortDir] = useState<SortDir>(`desc`);
  const [showFilters, setShowFilters] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...mockTransactions];
    if (search) list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter !== 'all') list = list.filter(t => t.type === typeFilter);
    if (catFilter !== 'all') list = list.filter(t => t.category === catFilter);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortField === 'amount') cmp = a.amount - b.amount;
      else cmp = a.title.localeCompare(b.title);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [search, typeFilter, catFilter, sortField, sortDir, mockTransactions]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">加载中...</div>;
  }

  return (
    <div data-cmp="Transactions" className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">交易记录</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">共 {filtered.length} 条记录</p>
        </div>
        <button onClick={() => setShowIncomeModal(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2 gradient-blue text-white text-xs sm:text-sm font-semibold rounded-lg hover:opacity-90 transition-all">
          <ArrowUpRight size={14} />
          添加收入
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {[
          { label: `收入合计`, value: fmt(totalIncome), color: `income-text`, bg: `income-bg`, icon: <ArrowUpRight size={13} /> },
          { label: `支出合计`, value: fmt(totalExpense), color: `expense-text`, bg: `expense-bg`, icon: <ArrowDownRight size={13} /> },
          { label: `净额`, value: fmt(totalIncome - totalExpense), color: totalIncome >= totalExpense ? `income-text` : `expense-text`, bg: totalIncome >= totalExpense ? `income-bg` : `expense-bg`, icon: <Filter size={13} /> },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl px-2 sm:px-4 py-2 sm:py-3 shadow-card flex items-center gap-2 sm:gap-3">
            <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
              <span className={s.color}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 shadow-card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`搜索交易记录...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            {([`all`, `income`, `expense`] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${typeFilter === t ? `gradient-blue text-white` : `bg-secondary text-muted-foreground hover:text-foreground`}`}
              >
                {t === 'all' ? `全部` : t === 'income' ? `收入` : `支出`}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border transition-all ${showFilters ? `bg-accent text-primary` : `bg-secondary text-muted-foreground hover:text-foreground`}`}
          >
            <SlidersHorizontal size={14} />
            筛选
          </button>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${showFilters ? `max-h-20 mt-3` : `max-h-0`}`}>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground shrink-0">分类:</span>
            <div className="flex gap-2 flex-wrap">
              {([`all`, ...Object.keys(categoryIcons)] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c as `all` | TransactionCategory)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${catFilter === c ? `bg-primary text-primary-foreground` : `bg-secondary text-muted-foreground hover:text-foreground`}`}
                >
                  {c === 'all' ? '全部' : categoryLabels[c as TransactionCategory] || c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table - hide type column on mobile */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {([
                { key: 'title', label: '标题' },
                { key: null, label: '分类' },
                { key: null, label: '类型', hide: true },
                { key: 'amount', label: '金额' },
                { key: 'date', label: '日期' },
              ] as { key: SortField | null; label: string; hide?: boolean }[]).map(col => !col.hide && (
                <th
                  key={col.label}
                  className={`text-left px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${col.key ? `cursor-pointer hover:text-foreground select-none` : ``}`}
                  onClick={() => col.key && toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.key && <ArrowUpDown size={12} className={sortField === col.key ? `text-primary` : ``} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((tx, idx) => {
              const { icon: Icon, color, bg } = categoryIcons[tx.category] || categoryIcons['Other'];
              const dateLabel = new Date(tx.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' });
              return (
                <tr
                  key={tx.id}
                  className={`border-b border-border last:border-0 hover:bg-secondary/40 transition-colors duration-100 animate-slide-up`}
                  style={{ animationDelay: `${idx * 20}ms` }}
                >
                  <td className="px-4 sm:px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                        <Icon size={14} style={{ color }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.title}</p>
                        <p className="text-xs text-muted-foreground">{tx.note || `—`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-5 py-3.5">
                    <span className="text-xs px-2.5 py-1 bg-secondary rounded-lg text-muted-foreground font-medium">{categoryLabels[tx.category] || tx.category}</span>
                  </td>
                  <td className="px-4 sm:px-5 py-3.5 hidden sm:table-cell">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold capitalize ${tx.type === 'income' ? `income-bg income-text` : `expense-bg expense-text`}`}>
                      {tx.type === 'income' ? '收入' : '支出'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      {tx.type === 'income' ? <ArrowUpRight size={13} className="income-text" /> : <ArrowDownRight size={13} className="expense-text" />}
                      <span className={`text-sm font-bold ${tx.type === 'income' ? `income-text` : `expense-text`}`}>{fmt(tx.amount)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{dateLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-5 py-2.5 sm:py-3 border-t border-border bg-secondary/30">
          <div className="text-xs text-muted-foreground">
            显示 {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)} 条记录，共 {filtered.length} 条
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
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
      </div>

      {/* Add Income Modal */}
      <AddIncomeModal
        open={showIncomeModal}
        onOpenChange={setShowIncomeModal}
      />
    </div>
  );
}
