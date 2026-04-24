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
import { Button } from './ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { RecurringBill, TransactionCategory } from '../data/mockData';
import { useFinance } from '../hooks/useFinance';
import { categoryIcons, categoryLabels } from '../lib/categoryConfig';
import { toast } from 'sonner';

// 账单周期类型
type BillFrequency = 'monthly' | 'weekly' | 'yearly' | 'quarterly';

// 可用于账单支出的分类
const billCategories: TransactionCategory[] = [
  'Food', 'Transport', 'Housing', 'Entertainment',
  'Healthcare', 'Shopping', 'Utilities', 'Education', 'Other'
];

// 周期选项
const frequencyOptions: { value: BillFrequency; label: string }[] = [
  { value: 'monthly', label: '每月' },
  { value: 'weekly', label: '每周' },
  { value: 'quarterly', label: '每季度' },
  { value: 'yearly', label: '每年' },
];

interface AddRecurringBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBillAdded: (bill: RecurringBill) => void;
}

export default function AddRecurringBillModal({
  open,
  onOpenChange,
  onBillAdded,
}: AddRecurringBillModalProps) {
  const { addRecurring } = useFinance();
  // 表单状态
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<BillFrequency>('monthly');
  const [category, setCategory] = useState<TransactionCategory>('Utilities');
  const [nextDate, setNextDate] = useState(new Date().toISOString().split('T')[0]);
  const [isActive, setIsActive] = useState(true);
  const [isAutopay, setIsAutopay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 重置表单
  const resetForm = () => {
    setName('');
    setAmount('');
    setFrequency('monthly');
    setCategory('Utilities');
    setNextDate(new Date().toISOString().split('T')[0]);
    setIsActive(true);
    setIsAutopay(false);
  };

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 验证表单
    if (!name.trim()) {
      toast.error('请输入账单名称');
      setIsSubmitting(false);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('请输入有效的金额');
      setIsSubmitting(false);
      return;
    }

    if (!nextDate) {
      toast.error('请选择下次扣款日期');
      setIsSubmitting(false);
      return;
    }

    // 生成新账单 ID
    const newId = `r${Date.now()}`;

    // 分类颜色映射
    const categoryColors: Record<string, string> = {
      Food: '#10B981',
      Transport: '#3B82F6',
      Housing: '#3B82F6',
      Entertainment: '#A855F7',
      Healthcare: '#EF4444',
      Shopping: '#F59E0B',
      Utilities: '#06B6D4',
      Education: '#F97316',
      Other: '#6B7280',
    };

    // 创建新账单
    const newBill: RecurringBill = {
      id: newId,
      name: name.trim(),
      amount: parseFloat(amount),
      frequency,
      nextDate,
      category,
      color: categoryColors[category] || '#6B7280',
      status: isActive ? 'active' : 'paused',
      autopay: isAutopay,
    };

    try {
      await addRecurring(newBill);
      
      // 回调更新
      onBillAdded(newBill);

      // 显示成功消息
      toast.success(`「${name.trim()}」账单添加成功！`);

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
            添加定期账单
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">
              账单名称
            </Label>
            <input
              id="name"
              type="text"
              placeholder="例如：Netflix会员、手机套餐"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

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

          {/* Frequency Select */}
          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-foreground font-medium">
              付款周期
            </Label>
            <Select value={frequency} onValueChange={(value) => setFrequency(value as BillFrequency)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择周期" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                {billCategories.map((cat) => {
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

          {/* Next Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="nextDate" className="text-foreground font-medium">
              下次扣款日期
            </Label>
            <input
              id="nextDate"
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              立即启用
            </Label>
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
              {isSubmitting ? '添加中...' : '添加账单'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
