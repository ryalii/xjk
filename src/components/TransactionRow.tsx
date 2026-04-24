import { Transaction } from '../data/mockData';
import { categoryIcons } from '../lib/categoryConfig';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TransactionRowProps {
  transaction?: Transaction;
  compact?: boolean;
}

export default function TransactionRow({ transaction, compact = false }: TransactionRowProps) {
  if (!transaction) return null;
  const { icon: Icon, color, bg } = categoryIcons[transaction.category] || categoryIcons['Other'];
  const isIncome = transaction.type === 'income';
  const dateLabel = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      data-cmp="TransactionRow"
      className={`flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 rounded-lg transition-colors duration-150 group ${compact ? `` : `border-b border-border last:border-0`}`}
    >
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{transaction.title}</p>
        <p className="text-xs text-muted-foreground">{transaction.category} · {dateLabel}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isIncome
          ? <ArrowUpRight size={13} className="income-text" />
          : <ArrowDownRight size={13} className="expense-text" />
        }
        <span className={`text-sm font-bold ${isIncome ? `income-text` : `expense-text`}`}>
          {isIncome ? `+` : `-`}${transaction.amount.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
