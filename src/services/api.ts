import { Transaction, RecurringBill, BudgetItem } from '../data/mockData';

export interface KPIResponse {
  totalBalance: number;
  monthlyBudget: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  budgetUsed: number;
}

export interface SummaryItem {
  month: string;
  income: number;
  expense: number;
}

const API_BASE = '/api';

export const api = {
  getTransactions: async (): Promise<Transaction[]> => {
    const res = await fetch(`${API_BASE}/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  addTransaction: async (transaction: Transaction): Promise<void> => {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!res.ok) throw new Error('Failed to add transaction');
  },

  deleteTransaction: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
  },

  getKPI: async (): Promise<KPIResponse> => {
    const res = await fetch(`${API_BASE}/kpi`);
    if (!res.ok) throw new Error('Failed to fetch KPI');
    return res.json();
  },

  getSummary: async (): Promise<SummaryItem[]> => {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  },

  getBudgets: async (): Promise<BudgetItem[]> => {
    const res = await fetch(`${API_BASE}/budgets`);
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return res.json();
  },

  addBudget: async (budget: BudgetItem): Promise<void> => {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget),
    });
    if (!res.ok) throw new Error('Failed to add budget');
  },

  getRecurringBills: async (): Promise<RecurringBill[]> => {
    const res = await fetch(`${API_BASE}/recurring`);
    if (!res.ok) throw new Error('Failed to fetch recurring bills');
    return res.json();
  },

  addRecurringBill: async (bill: RecurringBill): Promise<void> => {
    const res = await fetch(`${API_BASE}/recurring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bill),
    });
    if (!res.ok) throw new Error('Failed to add recurring bill');
  }
};
