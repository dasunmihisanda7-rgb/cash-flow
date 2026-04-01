// lib/data.js — Server-side Firestore data fetching (no "use client")
// BUG-08 FIX: When `data.date` is missing/undefined the record previously
// resolved to `undefined`, silently disappearing from all month-filtered views.
// Now it falls back to today's date so the record always remains visible.
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getTransactions() {
  const q = query(collection(db, "transactions"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    let date;
    if (data.date) {
      // Firestore Timestamp → plain YYYY-MM-DD string
      date = data.date.toDate
        ? data.date.toDate().toISOString().split("T")[0]
        : data.date;
    } else {
      // BUG-08 FIX: Fallback to today so the record is never silently hidden
      date = new Date().toISOString().split("T")[0];
    }

    return {
      id: doc.id,
      user: data.user || "DASUN",
      description: data.description,
      amount: data.amount,
      type: data.type,
      category: data.category,
      date,
    };
  });
}

export async function getSummary() {
  const transactions = await getTransactions();
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
}