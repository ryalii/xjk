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
import { Plus, Target } from 'lucide-react';
import { BudgetItem, TransactionCategory } from '../data/mockData';
import { useFinance } from '../hooks/useFinance';
import { categoryIcons, categoryLabels } from '../lib/categoryConfig';
import { toast } from 'sonner';

// 可用于预算的支出分类
const budgetCategories: TransactionCategory[] = [
  'Food', 'Transport', 'Housing', 'Entertainment',
  'Healthcare', 'Shopping', 'Utilities', 'Education', 'Other'
];

// 分类颜色
const categoryColors: Record<string, string> = {
  Food: '#10B981',
  Transport: '#3B82F6',
  Entertainment: '#A855F7',
  Shopping: '#F59E0B',
  Healthcare: '#EF4444',
  Utilities: '#06B6D4',
  Education: '#8B5CF6',
  Housing: '#3B82F6',
  Other: '#6B7280',
};

interface AddBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBudgetAdded: (budget: BudgetItem) => void;
}

export default function AddBudgetModal({
  open,
  onOpenChange,
  onBudgetAdded,
}: AddBudgetModalProps) {
  const { budgets, addBudget } = useFinance();
  // 表单状态
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [limit, setLimit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 重置表单
  const resetForm = () => {
    setCategory('Food');
    setLimit('');
  };

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 验证表单
    if (!limit || parseFloat(limit) <= 0) {
      toast.error('请输入有效的预算限额');
      setIsSubmitting(false);
      return;
    }

    // 检查是否已存在该分类的预算
    const existingBudget = budgets.find(b => b.category === category);
    if (existingBudget) {
      toast.error(`「${categoryLabels[category] || category}」分类的预算已存在，请编辑现有预算`);
      setIsSubmitting(false);
      return;
    }

    // 生成新预算 ID
    const newId = `b${Date.now()}`;

    // 创建新预算
    const newBudget: BudgetItem = {
      id: newId,
      category,
      limit: parseFloat(limit),
      spent: 0,
      color: categoryColors[category] || '#6B7280',
    };

    try {
      await addBudget(newBudget);
      
      // 回调更新 (if still needed, though useFinance handles it)
      onBudgetAdded(newBudget);

      // 显示成功消息
      toast.success(`「${categoryLabels[category] || category}」预算添加成功！`);

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
            添加预算
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
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
                {budgetCategories.map((cat) => {
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

          {/* Limit Input */}
          <div className="space-y-2">
            <Label htmlFor="limit" className="text-foreground font-medium">
              预算限额
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ¥
              </span>
              <input
                id="limit"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-7 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>

          {/* 提示信息 */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <Target className="w-3 h-3 inline mr-1" />
              设置每月支出上限，帮助你更好地控制开支
            </p>
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
              {isSubmitting ? '添加中...' : '添加预算'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
