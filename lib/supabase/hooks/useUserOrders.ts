// lib/supabase/hooks/useUserOrders.ts
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

export function useUserOrders(userId: number | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders(data ?? []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [userId]);

  return { orders, loading, error };
}