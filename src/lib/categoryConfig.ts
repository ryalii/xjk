import {
  ShoppingCart,
  Car,
  Home,
  Gamepad2,
  Heart,
  ShoppingBag,
  Zap,
  GraduationCap,
  DollarSign,
  Briefcase,
  TrendingUp,
  Gift,
  MoreHorizontal,
} from 'lucide-react';
import { TransactionCategory } from '../data/mockData';

export const categoryIcons: Record<TransactionCategory, { icon: typeof DollarSign; color: string; bg: string }> = {
  Salary: { icon: DollarSign, color: `#3B82F6`, bg: `bg-blue-50` },
  Freelance: { icon: Briefcase, color: `#6366F1`, bg: `bg-indigo-50` },
  Investment: { icon: TrendingUp, color: `#10B981`, bg: `bg-emerald-50` },
  Gift: { icon: Gift, color: `#F59E0B`, bg: `bg-amber-50` },
  Food: { icon: ShoppingCart, color: `#10B981`, bg: `bg-emerald-50` },
  Transport: { icon: Car, color: `#06B6D4`, bg: `bg-cyan-50` },
  Housing: { icon: Home, color: `#3B82F6`, bg: `bg-blue-50` },
  Entertainment: { icon: Gamepad2, color: `#A855F7`, bg: `bg-purple-50` },
  Healthcare: { icon: Heart, color: `#EF4444`, bg: `bg-red-50` },
  Shopping: { icon: ShoppingBag, color: `#F59E0B`, bg: `bg-amber-50` },
  Utilities: { icon: Zap, color: `#8B5CF6`, bg: `bg-violet-50` },
  Education: { icon: GraduationCap, color: `#F97316`, bg: `bg-orange-50` },
  Other: { icon: MoreHorizontal, color: `#6B7280`, bg: `bg-gray-100` },
};

export const incomeCategories: TransactionCategory[] = ['Salary', 'Freelance', 'Investment', 'Gift'];

export const expenseCategories: TransactionCategory[] = ['Food', 'Transport', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Education', 'Other'];

// 分类中文标签映射
export const categoryLabels: Record<TransactionCategory, string> = {
  // 收入分类
  Salary: '工资',
  Freelance: '自由职业',
  Investment: '投资',
  Gift: '礼金',
  // 支出分类
  Food: '餐饮',
  Transport: '交通',
  Housing: '住房',
  Entertainment: '娱乐',
  Healthcare: '医疗',
  Shopping: '购物',
  Utilities: '账单',
  Education: '教育',
  Other: '其他',
};
