import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TransactionCategory, TransactionType } from '../data/mockData';
import { useFinance } from '../hooks/useFinance';
import { incomeCategories } from '../lib/categoryConfig';
import { categoryIcons, categoryLabels } from '../lib/categoryConfig';

interface AddIncomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddIncomeModal({ open, onOpenChange, onSuccess }: AddIncomeModalProps) {
  const { addTransaction: apiAddTransaction } = useFinance();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Salary');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('请输入有效金额');
      return;
    }

    setLoading(true);
    try {
      const newTransaction = {
        id: `income-${Date.now()}`,
        title: description || categoryLabels[category] || '收入',
        amount: parseFloat(amount),
        type: 'income' as TransactionType,
        category,
        date,
        note: description,
      };

      await apiAddTransaction(newTransaction);
      setAmount('');
      setCategory('Salary');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      onSuccess?.();
      onOpenChange(false);
    } catch {
      setError('添加失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setCategory('Salary');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] animate-fade-in" showCloseButton={false}>
        <DialogHeader className="relative">
          <DialogTitle className="text-lg font-semibold text-foreground pr-8">添加收入</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">金额</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 h-11 bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">收入类型</label>
            <Select value={category} onValueChange={(v) => setCategory(v as TransactionCategory)}>
              <SelectTrigger className="h-11 bg-card border-border text-foreground">
                <SelectValue placeholder="选择收入类型">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const catConfig = categoryIcons[category] || categoryIcons['Other'];
                      const Icon = catConfig.icon;
                      return (
                        <>
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${catConfig.bg}`}>
                            <Icon className="w-3 h-3" style={{ color: catConfig.color }} />
                          </div>
                          <span>{categoryLabels[category] || category}</span>
                        </>
                      );
                    })()}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {incomeCategories.map((cat) => {
                  const catConfig = categoryIcons[cat];
                  const Icon = catConfig.icon;
                  return (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${catConfig.bg}`}>
                          <Icon className="w-3 h-3" style={{ color: catConfig.color }} />
                        </div>
                        <span>{categoryLabels[cat] || cat}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">描述</label>
            <Input
              placeholder="输入收入描述..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11 bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">日期</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 bg-card border-border text-foreground focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-11 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 px-4 rounded-lg gradient-blue text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? '添加中...' : '添加收入'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
