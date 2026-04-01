"use server";
// app/actions.js — Server Actions: write to and delete from Firebase Firestore.
// revalidatePath("/") is called after every mutation so Next.js re-fetches
// data and the dashboard updates instantly without a manual page refresh.
//
// BUG-12 FIX: Added an upper-bound guard of 100,000,000 LKR on all amounts to
// prevent mis-keyed values (e.g. "1999999999") from reaching Firestore silently.

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidatePath } from "next/cache";

const MAX_AMOUNT = 100_000_000; // Rs. 100 million — reasonable upper cap for LKR

function validatePayload(payload) {
  if (!payload.description || String(payload.description).trim() === "") {
    throw new Error("Description is required.");
  }
  if (isNaN(payload.amount) || payload.amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }
  if (payload.amount > MAX_AMOUNT) {
    throw new Error(`Amount cannot exceed Rs. ${MAX_AMOUNT.toLocaleString("en-LK")}.`);
  }
}

/**
 * Adds a new transaction document to the "transactions" Firestore collection.
 */
export async function addTransaction(formData) {
  const payload = {
    user: formData.get("user") || "DASUN",
    description: String(formData.get("description") || "").trim(),
    amount: parseFloat(formData.get("amount")),
    type: formData.get("type"),
    category: formData.get("category"),
    date: formData.get("date"),
    createdAt: serverTimestamp(),
  };

  validatePayload(payload);

  await addDoc(collection(db, "transactions"), payload);
  revalidatePath("/");
}

/**
 * Deletes a transaction document from Firestore by its document ID.
 */
export async function deleteTransaction(formData) {
  const id = formData.get("id");
  if (!id) throw new Error("Missing transaction ID.");

  await deleteDoc(doc(db, "transactions", id));
  revalidatePath("/");
}

/**
 * Updates an existing transaction document in Firestore by its document ID.
 */
export async function updateTransaction(formData) {
  const id = formData.get("id");
  if (!id) throw new Error("Missing transaction ID.");

  const payload = {
    description: String(formData.get("description") || "").trim(),
    amount: parseFloat(formData.get("amount")),
    type: formData.get("type"),
    category: formData.get("category"),
    date: formData.get("date"),
  };

  validatePayload(payload);

  await updateDoc(doc(db, "transactions", id), payload);
  revalidatePath("/");
}