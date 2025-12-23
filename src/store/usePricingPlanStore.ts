"use client";

import { create } from "zustand";
import type { SubscriptionPlan } from "@/server/subscription.action";

export type BillingCycle = "monthly" | "annual";
export type PricingPlanId = string;
export type PricingPlanTrigger = "registration" | "manual";

interface PricingPlanState {
  isOpen: boolean;
  trigger: PricingPlanTrigger | null;
  selectedPlanId: PricingPlanId | null;
  selectedBillingCycle: BillingCycle;
  activePlan: SubscriptionPlan | null;
  open: (options?: { trigger?: PricingPlanTrigger; billingCycle?: BillingCycle }) => void;
  close: () => void;
  selectPlan: (planId: PricingPlanId, billingCycle: BillingCycle) => void;
  setActivePlan: (plan: SubscriptionPlan | null) => void;
  initializeActivePlan: (plans: SubscriptionPlan[]) => void;
  reset: () => void;
}

const defaultBillingCycle: BillingCycle = "monthly";

// Helper function to find the free plan or active plan from the plans array
const findDefaultActivePlan = (plans: SubscriptionPlan[]): SubscriptionPlan | null => {
  if (!plans || plans.length === 0) return null;

  // First, try to find a plan with active: true
  const activePlan = plans.find((plan) => plan.active === true);
  if (activePlan) return activePlan;

  // Otherwise, find the free plan (amount === 0 or metadata.name === "free")
  const freePlan = plans.find(
    (plan) => plan.prices.amount === 0 || plan.metadata?.name?.toLowerCase() === "free"
  );
  if (freePlan) return freePlan;

  // If no free plan found, return the first plan as fallback
  return plans[0] || null;
};

export const usePricingPlanStore = create<PricingPlanState>((set) => ({
  isOpen: false,
  trigger: null,
  selectedPlanId: null,
  selectedBillingCycle: defaultBillingCycle,
  activePlan: null,
  open: (options = {}) =>
    set((state) => ({
      isOpen: true,
      trigger: options.trigger ?? state.trigger,
      selectedBillingCycle: options.billingCycle ?? state.selectedBillingCycle,
    })),
  close: () =>
    set((state) => ({
      ...state,
      isOpen: false,
      trigger: null,
    })),
  selectPlan: (planId, billingCycle) =>
    set({
      selectedPlanId: planId,
      selectedBillingCycle: billingCycle,
    }),
  setActivePlan: (plan) =>
    set({
      activePlan: plan,
    }),
  initializeActivePlan: (plans) =>
    set({
      activePlan: findDefaultActivePlan(plans),
    }),
  reset: () =>
    set({
      isOpen: false,
      trigger: null,
      selectedPlanId: null,
      selectedBillingCycle: defaultBillingCycle,
      activePlan: null,
    }),
}));