"use client";
import { useEffect, useMemo, useState } from "react";
import type { BillingCycle } from "@/store/usePricingPlanStore";
import { usePricingPlanStore } from "@/store/usePricingPlanStore";
import { getSubscriptionPlans, buySubscription, type SubscriptionPlan } from "@/server/subscription.action";
import { sortPlansByPrice, getHighlightedPlanId, isFreePlan } from "./utils";
import type { PricingPlanProps } from "./types";

export const usePricingPlan = ({ isOpen, plans: initialPlans, onSelectPlan }: PricingPlanProps) => {
    const [billingCycle] = useState<BillingCycle>("monthly");
    const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans ?? []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
    const { initializeActivePlan, setActivePlan, selectPlan, activePlan } = usePricingPlanStore();

    // Fetch plans when popup opens
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (initialPlans && initialPlans.length > 0) {
            setPlans(initialPlans);
            setError(null);
            setLoading(false);
            initializeActivePlan(initialPlans);
            return;
        }

        let cancelled = false;
        const fetchPlans = async () => {
            try {
                setLoading(true);
                setError(null);

                const result = await getSubscriptionPlans();
                if (cancelled) return;

                if (result.ok) {
                    const fetchedPlans = result.data ?? [];
                    setPlans(fetchedPlans);
                    setError(null);
                    if (fetchedPlans.length > 0) {
                        initializeActivePlan(fetchedPlans);
                    }
                } else {
                    setPlans([]);
                    setError(result.error || "Unable to load pricing plans.");
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Unable to load pricing plans.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchPlans();

        return () => {
            cancelled = true;
        };
    }, [isOpen, initialPlans, initializeActivePlan]);

    // Sort plans by price
    const sortedPlans = useMemo(() => {
        return sortPlansByPrice(plans);
    }, [plans]);

    // Determine which plan should be highlighted
    const highlightedPlanId = useMemo(() => {
        return getHighlightedPlanId(sortedPlans);
    }, [sortedPlans]);

    // Handle plan selection
    const handlePlanSelect = async (planId: string, billingCycle: BillingCycle) => {
        const selectedPlan = sortedPlans.find((p) => p.id === planId);
        if (!selectedPlan) return;

        // Handle free plan
        if (isFreePlan(selectedPlan)) {
            setActivePlan(selectedPlan);
            selectPlan(planId, billingCycle);
            onSelectPlan?.(planId, billingCycle);
            return;
        }

        // Handle paid plan - create Stripe checkout session
        setProcessingPlanId(planId);
        setError(null);

        try {
            const result = await buySubscription(selectedPlan.prices.id);

            if (result.ok && result.data?.stripeCheckoutURL) {
                // Update store before navigating
                setActivePlan(selectedPlan);
                selectPlan(planId, billingCycle);
                onSelectPlan?.(planId, billingCycle);

                // Navigate to Stripe checkout (external URL, so we use window.location)
                window.location.href = result.data.stripeCheckoutURL;
            } else {
                setError(result.error || "Failed to create checkout session. Please try again.");
                setProcessingPlanId(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
            setProcessingPlanId(null);
        }
    };

    return {
        billingCycle,
        sortedPlans,
        highlightedPlanId,
        activePlan,
        loading,
        error,
        processingPlanId,
        handlePlanSelect,
    };
};

