"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Transaction } from "@/app/page";

import { useAuth } from "./AuthContext";

type TransactionContextType = {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  isLoading: boolean;
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error (Transactions):', error.message, error.details);
        throw error;
      }
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const addTransaction = async (t: Omit<Transaction, "id">) => {
    if (!user) return;
    try {
      // Omit invoiceFile for now as it requires Supabase Storage setup
      const { invoiceFile, ...transactionData } = t as any;
      
      const { error } = await supabase
        .from('transactions')
        .insert([{ ...transactionData, user_id: user.id }]);

      if (error) throw error;
      await fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;
    
    // Backup state for rollback
    const prevTransactions = [...transactions];
    
    // Optimistic Update
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

    try {
      const { error, count } = await supabase
        .from('transactions')
        .update(updates, { count: 'exact' })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (count === 0) {
        console.warn(`[TRANSACTION] Row not found or RLS blocked UPDATE for ID ${id}. Resulting in rollback.`);
        alert("Action blocked by database. Please check your Supabase UPDATE permissions.");
        setTransactions(prevTransactions);
      } else {
        await fetchTransactions(); // Refresh completely just to be safe
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      setTransactions(prevTransactions);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    
    // Backup state for rollback
    const prevTransactions = [...transactions];
    
    // Optimistic Delete
    setTransactions(prev => prev.filter(t => t.id !== id));

    try {
      const { error, count } = await supabase
        .from('transactions')
        .delete({ count: 'exact' })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (count === 0) {
        console.warn(`[TRANSACTION] Row not found or RLS blocked DELETE for ID ${id}. Resulting in rollback.`);
        alert("Action blocked by database. Please check your Supabase DELETE permissions.");
        setTransactions(prevTransactions);
      } else {
        await fetchTransactions(); // Refresh completely just to be safe
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setTransactions(prevTransactions);
    }
  };

  const contextValue = React.useMemo(() => ({
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading
  }), [transactions, isLoading]);

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
}
