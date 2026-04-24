import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Transaction } from '../data/mockData';

export function useFinance() {
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: api.getTransactions,
  });

  const kpiQuery = useQuery({
    queryKey: ['kpi'],
    queryFn: api.getKPI,
  });

  const summaryQuery = useQuery({
    queryKey: ['summary'],
    queryFn: api.getSummary,
  });

  const budgetsQuery = useQuery({
    queryKey: ['budgets'],
    queryFn: api.getBudgets,
  });

  const recurringQuery = useQuery({
    queryKey: ['recurring'],
    queryFn: api.getRecurringBills,
  });

  const addTransactionMutation = useMutation({
    mutationFn: api.addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['kpi'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const addBudgetMutation = useMutation({
    mutationFn: api.addBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['kpi'] });
    },
  });

  const addRecurringMutation = useMutation({
    mutationFn: api.addRecurringBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: api.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['kpi'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  return {
    transactions: transactionsQuery.data || [],
    kpi: kpiQuery.data || {
      totalIncome: 0,
      totalExpense: 0,
      netSavings: 0,
      savingsRate: 0,
      totalBalance: 0,
      monthlyBudget: 0,
      budgetUsed: 0
    },
    summary: summaryQuery.data || [],
    budgets: budgetsQuery.data || [],
    recurring: recurringQuery.data || [],
    isLoading: transactionsQuery.isLoading || kpiQuery.isLoading || summaryQuery.isLoading || budgetsQuery.isLoading || recurringQuery.isLoading,
    addTransaction: addTransactionMutation.mutateAsync,
    addBudget: addBudgetMutation.mutateAsync,
    addRecurring: addRecurringMutation.mutateAsync,
    deleteTransaction: deleteTransactionMutation.mutateAsync,
    isAdding: addTransactionMutation.isPending,
  };
}
