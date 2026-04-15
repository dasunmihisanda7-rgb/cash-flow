"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

import { useAuth } from './AuthContext';

type CategoryContextType = {
  incomeCategories: string[];
  expenseCategories: string[];
  addCategory: (type: 'income' | 'expense', name: string) => Promise<void>;
  removeCategory: (type: 'income' | 'expense', name: string) => Promise<void>;
  isLoading: boolean;
};

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

const DEFAULT_INCOME = ["SALARY", "FREELANCE", "INVESTMENT", "GIFTS"];
const DEFAULT_EXPENSE = ["FOOD", "RENT", "TRANSPORT", "ENTERTAINMENT", "HEALTHCARE"];

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchCategories = async () => {
    if (!user) {
      setIncomeCategories([]);
      setExpenseCategories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name, type, user_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase query error (Categories):', error?.message || error);
        throw error;
      }

      // Claim logic: If we have null user IDs in this view, claim them for the user
      // But wait, the SELECT above filters by user_id === user.id.
      // If we want to find "null" categories, we need a separate check or a broader SELECT.
      
      const { data: allData, error: allErr } = await supabase
        .from('categories')
        .select('name, type, user_id')
        .or(`user_id.eq.${user.id},user_id.is.null`);

      if (allErr) {
        console.error('Failed to fetch categories with OR logic:', allErr?.message || allErr);
        throw allErr;
      }

      const needsClaiming = allData?.filter(c => c.user_id === null) || [];
      if (needsClaiming.length > 0) {
        console.log(`[STORAGE MAINTENANCE] Claiming ${needsClaiming.length} public categories for current user...`);
        for (const cat of needsClaiming) {
          await supabase
            .from('categories')
            .update({ user_id: user.id })
            .match({ name: cat.name, type: cat.type })
            .is('user_id', null);
        }
        // Refetch after claiming
        return fetchCategories();
      }

      if (allData && allData.length > 0) {
        const income = allData.filter(c => c.type === 'income').map(c => c.name);
        const expense = allData.filter(c => c.type === 'expense').map(c => c.name);
        setIncomeCategories(income);
        setExpenseCategories(expense);
      } else {
        // Only seed if no categories exist AT ALL for this account (neither user owned nor public)
        const seeds = [
          ...DEFAULT_INCOME.map(name => ({ name, type: 'income', user_id: user.id })),
          ...DEFAULT_EXPENSE.map(name => ({ name, type: 'expense', user_id: user.id }))
        ];
        
        const { error: seedError } = await supabase
          .from('categories')
          .insert(seeds);
        
        if (seedError) {
          console.warn('Could not seed default categories to database:', seedError?.message || seedError);
          // Don't throw, just fallback to local defaults so the app remains usable
        }
        
        setIncomeCategories(DEFAULT_INCOME);
        setExpenseCategories(DEFAULT_EXPENSE);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error?.message || JSON.stringify(error) || String(error));
      
      // Fallback to defaults to prevent an empty state crash
      setIncomeCategories(DEFAULT_INCOME);
      setExpenseCategories(DEFAULT_EXPENSE);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const addCategory = async (type: 'income' | 'expense', name: string) => {
    const upperName = name.toUpperCase().trim();
    if (!upperName || !user) return;

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: upperName, type, user_id: user.id }]);

      if (error) {
        if (error.code === '23505') {
          console.warn('Category already exists');
        } else {
          throw error;
        }
      }

      await fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const removeCategory = async (type: 'income' | 'expense', name: string) => {
    if (!user) return;

    // Preserve previous state for rollback
    const prevIncome = [...incomeCategories];
    const prevExpense = [...expenseCategories];

    // Optimistic UI Update
    if (type === 'income') {
      setIncomeCategories(prev => prev.filter(c => c !== name));
    } else {
      setExpenseCategories(prev => prev.filter(c => c !== name));
    }

    try {
      const { error, count } = await supabase
        .from('categories')
        .delete({ count: 'exact' })
        .eq('name', name)
        .eq('type', type)
        .or(`user_id.eq.${user.id},user_id.is.null`);

      if (error) throw error;
      
      if (count === 0) {
        console.warn(`[CATEGORY] No matching row found to delete for ${name} (${type}). Resulting in rollback.`);
        // If nothing was deleted on the server, rollback for data integrity
        setIncomeCategories(prevIncome);
        setExpenseCategories(prevExpense);
      }

    } catch (error) {
      console.error('Error removing category:', error);
      // Rollback on network failure or permission error
      setIncomeCategories(prevIncome);
      setExpenseCategories(prevExpense);
    }
  };


  const contextValue = React.useMemo(() => ({
    incomeCategories,
    expenseCategories,
    addCategory,
    removeCategory,
    isLoading
  }), [incomeCategories, expenseCategories, isLoading]);

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
