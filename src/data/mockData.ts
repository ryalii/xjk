// ─── 个人财务追踪器模拟数据 ───────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense';
export type TransactionCategory =
  | 'Salary' | 'Freelance' | 'Investment' | 'Gift'
  | 'Food' | 'Transport' | 'Housing' | 'Entertainment'
  | 'Healthcare' | 'Shopping' | 'Utilities' | 'Education' | 'Other';

// 收入分类中文映射
export const incomeCategoryLabels: Record<string, string> = {
  Salary: '工资',
  Freelance: '自由职业',
  Investment: '投资收益',
  Gift: '礼金/红包',
};

// 支出分类中文映射
export const expenseCategoryLabels: Record<string, string> = {
  Food: '餐饮',
  Transport: '交通',
  Housing: '住房',
  Entertainment: '娱乐',
  Healthcare: '医疗',
  Shopping: '购物',
  Utilities: '水电账单',
  Education: '教育',
  Other: '其他',
};

// 通用分类中文映射
export const categoryLabels: Record<string, string> = {
  ...incomeCategoryLabels,
  ...expenseCategoryLabels,
};

// 账单周期中文映射
export const frequencyLabels: Record<string, string> = {
  monthly: '月',
  weekly: '周',
  yearly: '年',
  quarterly: '季度',
};

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  note?: string;
  tags?: string[];
}

export interface BudgetItem {
  id: string;
  category: TransactionCategory;
  limit: number;
  spent: number;
  color: string;
}

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'yearly' | 'quarterly';
  nextDate: string;
  category: TransactionCategory;
  color: string;
  status: 'active' | 'paused';
  autopay: boolean;
}

// ─── 辅助函数 ─────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');
const dateStr = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const today = new Date();
const Y = today.getFullYear();
const M = today.getMonth() + 1;

// ─── 交易数据 ─────────────────────────────────────────────────────────────────
export const mockTransactions: Transaction[] = [
  // 本月
  { id: 't001', title: '工资', amount: 17000, type: 'income', category: 'Salary', date: dateStr(Y, M, 1), note: '每月固定工资' },
  { id: 't002', title: '房租', amount: 3600, type: 'expense', category: 'Housing', date: dateStr(Y, M, 1), note: '侯双双' },
  { id: 't003', title: '超市购物', amount: 468.9, type: 'expense', category: 'Food', date: dateStr(Y, M, 2) },
  { id: 't004', title: '视频会员', amount: 32, type: 'expense', category: 'Entertainment', date: dateStr(Y, M, 3) },
  { id: 't005', title: '自由职业项目', amount: 2400, type: 'income', category: 'Freelance', date: dateStr(Y, M, 4), note: '李松' },
  { id: 't006', title: '电费', amount: 178.8, type: 'expense', category: 'Utilities', date: dateStr(Y, M, 5) },
  { id: 't007', title: '咖啡下午茶', amount: 90.4, type: 'expense', category: 'Food', date: dateStr(Y, M, 6) },
  { id: 't008', title: '打车费用', amount: 125, type: 'expense', category: 'Transport', date: dateStr(Y, M, 7) },
  { id: 't009', title: '健身房会员', amount: 99.98, type: 'expense', category: 'Healthcare', date: dateStr(Y, M, 8) },
  { id: 't010', title: '网购日用品', amount: 313.4, type: 'expense', category: 'Shopping', date: dateStr(Y, M, 9) },
  { id: 't011', title: '投资收益', amount: 680, type: 'income', category: 'Investment', date: dateStr(Y, M, 10), note: '侯双双' },
  { id: 't012', title: '餐厅聚餐', amount: 174.6, type: 'expense', category: 'Food', date: dateStr(Y, M, 11), note: '李松' },
  { id: 't013', title: '宽带费', amount: 120, type: 'expense', category: 'Utilities', date: dateStr(Y, M, 12) },
  { id: 't014', title: '音乐会员', amount: 20, type: 'expense', category: 'Entertainment', date: dateStr(Y, M, 13) },
  { id: 't015', title: '在线课程', amount: 398, type: 'expense', category: 'Education', date: dateStr(Y, M, 14) },
  { id: 't016', title: '门诊看病', amount: 240, type: 'expense', category: 'Healthcare', date: dateStr(Y, M, 15) },
  { id: 't017', title: '添置衣物', amount: 431.6, type: 'expense', category: 'Shopping', date: dateStr(Y, M, 16) },
  { id: 't018', title: '外包项目', amount: 1300, type: 'income', category: 'Freelance', date: dateStr(Y, M, 17), note: '李松' },
  { id: 't019', title: '电影票', amount: 70, type: 'expense', category: 'Entertainment', date: dateStr(Y, M, 18), note: '侯双双' },
  { id: 't020', title: '油费', amount: 156.8, type: 'expense', category: 'Transport', date: dateStr(Y, M, 19), note: '李松' },
  // 上月
  { id: 't021', title: '工资', amount: 17000, type: 'income', category: 'Salary', date: dateStr(Y, M - 1 < 1 ? 12 : M - 1, 1) },
  { id: 't022', title: '房租', amount: 3600, type: 'expense', category: 'Housing', date: dateStr(Y, M - 1 < 1 ? 12 : M - 1, 1) },
  { id: 't023', title: '超市购物', amount: 624.8, type: 'expense', category: 'Food', date: dateStr(Y, M - 1 < 1 ? 12 : M - 1, 3) },
  { id: 't024', title: '设计外包', amount: 1800, type: 'income', category: 'Freelance', date: dateStr(Y, M - 1 < 1 ? 12 : M - 1, 5) },
  { id: 't025', title: '电费', amount: 190.4, type: 'expense', category: 'Utilities', date: dateStr(Y, M - 1 < 1 ? 12 : M - 1, 6) },
  { id: 't026', title: '视频会员', amount: 32, type: 'expense', category: 'Entertainment', date: dateStr(Y, M - 1 < 1 ? 12 : M - 1, 8) },
  { id: 't027', title: '出租车费', amount: 177, type: 'expense', category: 'Transport', date: dateStr(Y, M - 1 < 1 ? 12 : M - 1, 10) },
  { id: 't028', title: '投资收益', amount: 840, type: 'income', category: 'Investment', date: dateStr(Y, M - 1 < 1 ? 12 : M - 1, 12) },
  { id: 't029', title: '牙科检查', amount: 360, type: 'expense', category: 'Healthcare', date: dateStr(Y, M - 1 < 1 ? 12 : M - 1, 14) },
  { id: 't030', title: '电子产品', amount: 978, type: 'expense', category: 'Shopping', date: dateStr(Y, M - 1 < 1 ? 12 : M - 1, 16) },
  // 两个月前
  { id: 't031', title: '工资', amount: 17000, type: 'income', category: 'Salary', date: dateStr(Y, M - 2 < 1 ? 12 : M - 2, 1) },
  { id: 't032', title: '房租', amount: 3600, type: 'expense', category: 'Housing', date: dateStr(Y, M - 2 < 1 ? 12 : M - 2, 1) },
  { id: 't033', title: '超市购物', amount: 557.8, type: 'expense', category: 'Food', date: dateStr(Y, M - 2 < 1 ? 12 : M - 2, 4) },
  { id: 't034', title: '技术咨询', amount: 3000, type: 'income', category: 'Freelance', date: dateStr(Y, M - 2 < 1 ? 12 : M - 2, 7) },
  { id: 't035', title: '手机话费', amount: 130, type: 'expense', category: 'Utilities', date: dateStr(Y, M - 2 < 1 ? 12 : M - 2, 9) },
  { id: 't036', title: '演唱会门票', amount: 240, type: 'expense', category: 'Entertainment', date: dateStr(Y, M - 2 < 1 ? 12 : M - 2, 11) },
  { id: 't037', title: '汽车保养', amount: 690, type: 'expense', category: 'Transport', date: dateStr(Y, M - 2 < 1 ? 12 : M - 2, 13) },
  { id: 't038', title: '年终奖金', amount: 4000, type: 'income', category: 'Salary', date: dateStr(Y, M - 2 < 1 ? 12 : M - 2, 15) },
  { id: 't039', title: '运动装备', amount: 560, type: 'expense', category: 'Shopping', date: dateStr(Y, M - 2 < 1 ? 12 : M - 2, 18) },
  { id: 't040', title: '软件订阅', amount: 59.98, type: 'expense', category: 'Entertainment', date: dateStr(Y, M - 2 < 1 ? 12 : M - 2, 20) },
];

// 添加交易函数
export const addTransaction = (transaction: Transaction) => {
  mockTransactions.unshift(transaction);
};

// ─── 预算数据 ─────────────────────────────────────────────────────────────────
export const mockBudgets: BudgetItem[] = [
  { id: 'b001', category: 'Food', limit: 1200, spent: 734, color: '#10B981' },
  { id: 'b002', category: 'Transport', limit: 600, spent: 282, color: '#3B82F6' },
  { id: 'b003', category: 'Entertainment', limit: 400, spent: 354, color: '#A855F7' },
  { id: 'b004', category: 'Shopping', limit: 800, spent: 745, color: '#F59E0B' },
  { id: 'b005', category: 'Healthcare', limit: 500, spent: 340, color: '#EF4444' },
  { id: 'b006', category: 'Utilities', limit: 400, spent: 299, color: '#06B6D4' },
  { id: 'b007', category: 'Education', limit: 600, spent: 398, color: '#8B5CF6' },
  { id: 'b008', category: 'Other', limit: 300, spent: 90, color: '#6B7280' },
];

// ─── 定期账单 ─────────────────────────────────────────────────────────────────
export const mockRecurringBills: RecurringBill[] = [
  { id: 'r001', name: '房租', amount: 3600, frequency: 'monthly', nextDate: dateStr(Y, M + 1 > 12 ? 1 : M + 1, 1), category: 'Housing', color: '#3B82F6', status: 'active', autopay: true },
  { id: 'r002', name: '视频会员', amount: 32, frequency: 'monthly', nextDate: dateStr(Y, M, 3), category: 'Entertainment', color: '#A855F7', status: 'active', autopay: true },
  { id: 'r003', name: '音乐会员', amount: 20, frequency: 'monthly', nextDate: dateStr(Y, M, 13), category: 'Entertainment', color: '#F59E0B', status: 'active', autopay: false },
  { id: 'r004', name: '健身房', amount: 99.98, frequency: 'monthly', nextDate: dateStr(Y, M, 8), category: 'Healthcare', color: '#10B981', status: 'active', autopay: true },
  { id: 'r005', name: '宽带费', amount: 120, frequency: 'monthly', nextDate: dateStr(Y, M, 12), category: 'Utilities', color: '#06B6D4', status: 'active', autopay: true },
  { id: 'r006', name: '电费', amount: 178.8, frequency: 'monthly', nextDate: dateStr(Y, M, 5), category: 'Utilities', color: '#8B5CF6', status: 'active', autopay: true },
  { id: 'r007', name: '手机套餐', amount: 130, frequency: 'monthly', nextDate: dateStr(Y, M, 15), category: 'Utilities', color: '#6366F1', status: 'active', autopay: true },
  { id: 'r008', name: '设计软件', amount: 110, frequency: 'monthly', nextDate: dateStr(Y, M, 20), category: 'Education', color: '#F97316', status: 'paused', autopay: false },
  { id: 'r009', name: '云存储', amount: 49, frequency: 'monthly', nextDate: dateStr(Y, M, 25), category: 'Education', color: '#14B8A6', status: 'active', autopay: false },
  { id: 'r010', name: '车险', amount: 960, frequency: 'quarterly', nextDate: dateStr(Y, M + 2 > 12 ? 1 : M + 2, 1), category: 'Transport', color: '#EF4444', status: 'active', autopay: true },
  { id: 'r011', name: '体检套餐', amount: 500, frequency: 'yearly', nextDate: dateStr(Y + 1, 3, 15), category: 'Healthcare', color: '#EC4899', status: 'active', autopay: false },
];

// ─── 月度汇总 (最近6个月) ─────────────────────────────────────────────────────
const getMonthLabel = (offset: number) => {
  const d = new Date(Y, M - 1 - offset, 1);
  return d.toLocaleString('zh-CN', { month: 'short' });
};

export const mockMonthlySummary = [
  { month: getMonthLabel(5), income: 18400, expense: 8240 },
  { month: getMonthLabel(4), income: 21000, expense: 10680 },
  { month: getMonthLabel(3), income: 17600, expense: 9780 },
  { month: getMonthLabel(2), income: 24000, expense: 12460 },
  { month: getMonthLabel(1), income: 21640, expense: 11202 },
  { month: getMonthLabel(0), income: 21380, expense: 6827.96 },
];

// ─── 分类支出 ─────────────────────────────────────────────────────────────────
export const mockCategorySpending = [
  { name: '住房', value: 3600, color: '#3B82F6' },
  { name: '餐饮', value: 734, color: '#10B981' },
  { name: '交通', value: 282, color: '#06B6D4' },
  { name: '娱乐', value: 354, color: '#A855F7' },
  { name: '购物', value: 745, color: '#F59E0B' },
  { name: '医疗', value: 340, color: '#EF4444' },
  { name: '水电账单', value: 299, color: '#8B5CF6' },
  { name: '教育', value: 398, color: '#F97316' },
];

// ─── KPI 统计 ─────────────────────────────────────────────────────────────────
export const mockKPIStats = {
  totalIncome: 21380,
  totalExpense: 6827.96,
  netSavings: 14552.04,
  savingsRate: 68.1,
  totalBalance: 85700.6,
  monthlyBudget: 8400,
  budgetUsed: 6827.96,
};
