"use server";
// app/actions.js
// ─────────────────────────────────────────────────────────────────────────────
// Server Actions — write to and delete from Firebase Firestore.
// revalidatePath("/") is called after every mutation so Next.js re-fetches
// data and the dashboard updates instantly without a manual page refresh.
// ─────────────────────────────────────────────────────────────────────────────

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidatePath } from "next/cache";

/**
 * Adds a new transaction document to the "transactions" Firestore collection.
 */
export async function addTransaction(formData) {
  const payload = {
    user: formData.get("user") || "DASUN", // ⬅️ මේක තමයි අලුතින් දැම්මේ!
    description: formData.get("description"),
    amount: parseFloat(formData.get("amount")),
    type: formData.get("type"),
    category: formData.get("category"),
    date: formData.get("date"),
    createdAt: serverTimestamp(),
  };

  // Basic guard: reject obviously invalid payloads
  if (!payload.description || isNaN(payload.amount) || payload.amount <= 0) {
    throw new Error("Invalid transaction payload.");
  }

  // Firestore Database එකට දත්ත සේව් කිරීම
  await addDoc(collection(db, "transactions"), payload);

  // Invalidate the dashboard cache so the new transaction shows immediately
  revalidatePath("/");
}

/**
 * Deletes a transaction document from Firestore by its document ID.
 */
export async function deleteTransaction(formData) {
  const id = formData.get("id");

  if (!id) throw new Error("Missing transaction ID.");

  // Firestore Database එකෙන් දත්ත මැකීම
  await deleteDoc(doc(db, "transactions", id));

  // Invalidate the dashboard cache so the deleted row disappears immediately
  revalidatePath("/");
}