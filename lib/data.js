import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getTransactions() {
  const q = query(collection(db, "transactions"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      user: data.user || "DASUN",
      description: data.description,
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: data.date?.toDate ? data.date.toDate().toISOString().split("T")[0] : data.date,
    };
  });
}

export async function getSummary() {
  const transactions = await getTransactions();
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
}