import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction } from '../data/mockData';
import { categoryIcons, categoryLabels } from '../lib/categoryConfig';
import { useFinance } from '../hooks/useFinance';

const WEEKDAYS = [`日`, `一`, `二`, `三`, `四`, `五`, `六`];
const MONTHS = [`一月`, `二月`, `三月`, `四月`, `五月`, `六月`,
  `七月`, `八月`, `九月`, `十月`, `十一月`, `十二月`];

const fmt = (n: number) => `¥${n.toFixed(0)}`;

export default function CalendarPage() {
  const { transactions: mockTransactions, isLoading } = useFinance();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const goBack = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const goForward = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const pad = (n: number) => String(n).padStart(2, `0`);
  const dateStr = (d: number) => `${year}-${pad(month + 1)}-${pad(d)}`;

  const txByDay: Record<string, typeof mockTransactions> = {};
  mockTransactions.forEach(tx => {
    if (!txByDay[tx.date]) txByDay[tx.date] = [];
    txByDay[tx.date].push(tx);
  });

  const selectedDateStr = selectedDay !== null ? dateStr(selectedDay) : null;
  const selectedTxs = selectedDateStr ? (txByDay[selectedDateStr] || []) : [];

  const monthTxs = mockTransactions.filter(tx => {
    const [ty, tm] = tx.date.split('-').map(Number);
    return ty === year && tm === month + 1;
  });
  const monthIncome = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">加载中...</div>;
  }

  return (
    <div data-cmp="CalendarPage" className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">日历</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">追踪每日收入和支出</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <ArrowUpRight size={14} className="income-text" />
            <span className="font-semibold income-text">{fmt(monthIncome)} 收入</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDownRight size={14} className="expense-text" />
            <span className="font-semibold expense-text">{fmt(monthExpense)} 支出</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
        {/* Calendar */}
        <div className="flex-[3] bg-card border border-border rounded-xl shadow-card overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
            <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-sm sm:text-base font-bold text-foreground">{MONTHS[month]} {year}</h2>
            <button onClick={goForward} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="flex border-b border-border">
            {WEEKDAYS.map(d => (
              <div key={d} className="flex-1 text-center py-2 text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div>
            {Array.from({ length: cells.length / 7 }, (_, rowIdx) => (
              <div key={rowIdx} className="flex border-b border-border last:border-0">
                {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
                  const ds = day !== null ? dateStr(day) : null;
                  const dayTxs = ds ? (txByDay[ds] || []) : [];
                  const dayIncome = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                  const dayExpense = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                  const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  const isSelected = day === selectedDay;
                  const hasTx = dayTxs.length > 0;

                  return (
                    <div
                      key={colIdx}
                      onClick={() => day !== null && setSelectedDay(day)}
                      className={`flex-1 min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 border-r border-border last:border-0 transition-all duration-150 ${day !== null ? `cursor-pointer hover:bg-secondary/40` : `bg-muted/20`} ${isSelected ? `bg-accent` : ``}`}
                    >
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-semibold rounded-full mb-0.5 sm:mb-1 ${isToday ? `gradient-blue text-white` : isSelected ? `bg-primary text-primary-foreground` : `text-foreground`}`}>
                        {day}
                      </div>
                      {hasTx && (
                        <div className="space-y-0.5">
                          {dayIncome > 0 && (
                            <div className="flex items-center gap-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                              <span className="text-[9px] sm:text-[10px] income-text font-medium truncate">+{fmt(dayIncome)}</span>
                            </div>
                          )}
                          {dayExpense > 0 && (
                            <div className="flex items-center gap-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                              <span className="text-[9px] sm:text-[10px] expense-text font-medium truncate">-{fmt(dayExpense)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex-[2] flex flex-col gap-4">
          {/* Selected day */}
          <div className="bg-card border border-border rounded-xl shadow-card flex-1">
            <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-2 sm:pb-3 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                {selectedDay !== null
                  ? `${MONTHS[month]} ${selectedDay}日, ${year}`
                  : `请选择日期`}
              </h3>
              {selectedTxs.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">{selectedTxs.length} 笔交易</p>
              )}
            </div>
            <div className="p-2 sm:p-3">
              <div className={selectedTxs.length === 0 ? `` : `hidden`}>
                <div className="py-6 sm:py-8 text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground">当天暂无交易记录</p>
                </div>
              </div>
              <div className={selectedTxs.length > 0 ? `space-y-1` : `hidden`}>
                {selectedTxs.map(tx => {
                  const { icon: Icon, color, bg } = categoryIcons[tx.category] || categoryIcons['Other'];
                  return (
                    <div key={tx.id} className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                        <Icon size={14} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{tx.title}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{categoryLabels[tx.category] || tx.category}</p>
                      </div>
                      <span className={`text-xs sm:text-sm font-bold ${tx.type === 'income' ? `income-text` : `expense-text`}`}>
                        {tx.type === 'income' ? `+` : `-`}${tx.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Month summary */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">本月汇总</h3>
            <div className="space-y-2 sm:space-y-3">
              {[
                { label: `交易总数`, value: `${monthTxs.length}` },
                { label: `总收入`, value: `¥${monthIncome.toFixed(2)}`, cls: `income-text` },
                { label: `总支出`, value: `¥${monthExpense.toFixed(2)}`, cls: `expense-text` },
                { label: `净余额`, value: `¥${(monthIncome - monthExpense).toFixed(2)}`, cls: monthIncome >= monthExpense ? `income-text` : `expense-text` },
                { label: `活跃天数`, value: `${new Set(monthTxs.map(t => t.date)).size}` },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={`font-bold ${row.cls || `text-foreground`}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
