import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Transaction, TransactionType, TransactionCategory, mockKPIStats } from '../data/mockData';
import { useFinance } from '../hooks/useFinance';
import { categoryIcons, categoryLabels } from '../lib/categoryConfig';
import { toast } from 'sonner';

// 获取可用的分类（根据类型过滤）
const getCategoriesByType = (type: TransactionType): TransactionCategory[] => {
  const incomeCategories: TransactionCategory[] = ['Salary', 'Freelance', 'Investment', 'Gift'];
  const expenseCategories: TransactionCategory[] = [
    'Food', 'Transport', 'Housing', 'Entertainment',
    'Healthcare', 'Shopping', 'Utilities', 'Education', 'Other'
  ];
  return type === 'income' ? incomeCategories : expenseCategories;
};

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionAdded: (transaction: Transaction) => void;
}

export default function AddTransactionModal({
  open,
  onOpenChange,
  onTransactionAdded,
}: AddTransactionModalProps) {
  // 表单状态
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addTransaction } = useFinance();

  // 根据当前类型获取可用分类
  const availableCategories = getCategoriesByType(type);

  // 重置表单
  const resetForm = () => {
    setAmount('');
    setType('expense');
    setCategory('Food');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  // 处理类型变更
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    // 当类型变更时，重置分类
    const newCategories = getCategoriesByType(newType);
    if (!newCategories.includes(category)) {
      setCategory(newCategories[0]);
    }
  };

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 验证表单
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('请输入有效金额');
      setIsSubmitting(false);
      return;
    }

    if (!description.trim()) {
      toast.error('请输入交易描述');
      setIsSubmitting(false);
      return;
    }

    // 生成新交易 ID
    const newId = `t${Date.now()}`;

    // 创建新交易
    const newTransaction: Transaction = {
      id: newId,
      title: description.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date,
      note: description.trim(),
    };

    try {
      await addTransaction(newTransaction);
      
      // 显示成功消息
      toast.success(
        type === 'income'
          ? `收入 ¥${parseFloat(amount).toLocaleString()} 添加成功！`
          : `支出 ¥${parseFloat(amount).toLocaleString()} 记录成功！`
      );

      // 重置并关闭
      resetForm();
      onOpenChange(false);
    } catch (err) {
      toast.error('添加失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 取消并关闭
  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] animate-fade-in p-0 overflow-hidden"
        showCloseButton={true}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            添加交易
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground font-medium">
              金额
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ¥
              </span>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-7 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">交易类型</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                  type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-border bg-background text-muted-foreground hover:border-red-200'
                }`}
              >
                <ArrowDownCircle className={`w-5 h-5 ${type === 'expense' ? 'text-red-500' : ''}`} />
                <span className="font-medium">支出</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                  type === 'income'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-border bg-background text-muted-foreground hover:border-emerald-200'
                }`}
              >
                <ArrowUpCircle className={`w-5 h-5 ${type === 'income' ? 'text-emerald-500' : ''}`} />
                <span className="font-medium">收入</span>
              </button>
            </div>
          </div>

          {/* Category Select */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground font-medium">
              分类
            </Label>
            <Select value={category} onValueChange={(value) => setCategory(value as TransactionCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择分类">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const catConfig = categoryIcons[category];
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
                {availableCategories.map((cat) => {
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
            <Label htmlFor="description" className="text-foreground font-medium">
              描述
            </Label>
            <Textarea
              id="description"
              placeholder="输入交易描述..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
              required
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-foreground font-medium">
              日期
            </Label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? '添加中...' : '添加交易'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
