# FinTrkued - Personal Finance Tracker

## 1. 项目概述

个人财务追踪应用，基于 Vite + React + TypeScript + Tailwind CSS 构建，使用 shadcn/ui 组件库。

### 技术栈
- **框架**: Vite + React 19 + TypeScript
- **UI**: Tailwind CSS 4 + shadcn/ui (基于 Radix UI)
- **图表**: Recharts
- **路由**: React Router DOM
- **通知**: Sonner
- **图标**: Lucide React

## 2. 目录结构

```
src/
├── components/
│   ├── ui/           # shadcn/ui 基础组件
│   ├── KPICard.tsx   # KPI 卡片组件
│   ├── Navbar.tsx    # 导航栏
│   ├── TransactionRow.tsx  # 交易行组件
│   └── AddTransactionModal.tsx  # 添加交易弹窗
├── data/
│   └── mockData.ts   # 模拟数据
├── lib/
│   ├── utils.ts      # 工具函数
│   └── categoryConfig.ts  # 分类配置
└── pages/
    ├── Dashboard.tsx  # 主仪表盘
    ├── Transactions.tsx  # 交易列表
    ├── Budget.tsx     # 预算管理
    ├── Recurring.tsx  # 定期账单
    ├── CalendarPage.tsx  # 日历视图
    └── Statistics.tsx  # 统计分析
```

## 3. 构建与运行

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm run build

# 预览生产版本
pnpm run preview
```

## 4. 核心功能

### Dashboard 页面
- KPI 卡片展示（总余额、月收入、月支出、净储蓄）
- 收入支出趋势图（Area Chart）
- 分类支出饼图（Donut Chart）
- 最近交易列表
- 预算状态
- **添加交易按钮**：点击打开 Modal 弹窗

### AddTransactionModal 组件
- 毛玻璃背景遮罩
- 表单字段：
  - 金额输入框
  - 类型选择（收入/支出）
  - 分类下拉菜单（从 categoryConfig 读取）
  - 描述文本框
  - 日期选择器
- 提交后更新 mockData.transactions 并刷新 KPI 数据

## 5. 数据类型

```typescript
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: TransactionCategory;
  date: string;
  note?: string;
  tags?: string[];
}

type TransactionCategory = 
  | 'Salary' | 'Freelance' | 'Investment' | 'Gift'
  | 'Food' | 'Transport' | 'Housing' | 'Entertainment'
  | 'Healthcare' | 'Shopping' | 'Utilities' | 'Education' | 'Other';
```

## 6. 动画

项目使用自定义 CSS 动画，关键帧定义在 `src/index.css`:
- `.animate-fade-in`: 淡入动画
- `.animate-slide-up`: 上滑动画
- `.animate-slide-in-left`: 左侧滑入

## 7. 注意事项

- mockData 是全局状态，修改后会同步到所有页面
- Modal 弹窗使用 Radix UI Dialog 组件
- 收入类型分类：Salary, Freelance, Investment, Gift
- 支出类型分类：Food, Transport, Housing, Entertainment, Healthcare, Shopping, Utilities, Education, Other
