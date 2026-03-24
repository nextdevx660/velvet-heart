"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

import { db } from "@/lib/firebase";
import { getUsageDocumentId } from "@/lib/utils";

// This hook subscribes to the user's plan and daily usage document.
export function useUsage(user) {
  const [plan, setPlan] = useState("free");
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const refreshAttemptedRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setPlan("free");
      setUsageCount(0);
      setLoading(false);
      refreshAttemptedRef.current = null;
      return undefined;
    }

    const usageId = getUsageDocumentId(user.uid);
    const unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      setPlan(snapshot.data()?.plan || "free");
      setLoading(false);
    });

    const unsubscribeUsage = onSnapshot(doc(db, "usage", usageId), (snapshot) => {
      setUsageCount(snapshot.data()?.count || 0);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeUsage();
    };
  }, [user]);

  useEffect(() => {
    if (!user || loading || plan === "pro" || refreshAttemptedRef.current === user.uid) {
      return;
    }

    let cancelled = false;

    async function refreshPlan() {
      refreshAttemptedRef.current = user.uid;

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/account/refresh-plan", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok || cancelled) {
          return;
        }

        const payload = await response.json();

        if (payload.success && payload.data?.plan === "pro") {
          setPlan("pro");
        }
      } catch {
        // Leave the current plan unchanged if the Stripe refresh check fails.
      }
    }

    refreshPlan();

    return () => {
      cancelled = true;
    };
  }, [loading, plan, user]);

  return { plan, usageCount, loading };
}
