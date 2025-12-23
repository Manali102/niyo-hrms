import type { BillingCycle } from "@/store/usePricingPlanStore";
import type { SubscriptionPlan } from "@/server/subscription.action";

/**
 * Format price based on currency and billing cycle
 */
export const formatPrice = (amount: number, currency: string, billingCycle?: BillingCycle): string => {
  const symbol = currency === "usd" ? "$" : currency.toUpperCase();
  return `${symbol}${amount}`;
};

/**
 * Get plan range label from metadata or default based on plan name
 */
export const getPlanRange = (plan: SubscriptionPlan): string => {
  if (plan.features?.title) {
    return plan.features.title;
  }

  if (plan.metadata?.range) {
    return plan.metadata.range;
  }

  return "STANDARD PACKAGE";
};

/**
 * Get plan badge from metadata or default for premium
 */
export const getPlanBadge = (plan: SubscriptionPlan): string | undefined => {
  if (plan.metadata?.badge) {
    return plan.metadata.badge;
  }

  const metadataName = plan.metadata?.name?.toLowerCase();
  return metadataName === "premium" ? "BEST VALUE" : undefined;
};

/**
 * Check if a plan is free
 */
export const isFreePlan = (plan: SubscriptionPlan): boolean => {
  return plan.prices.amount === 0 || plan.metadata?.name?.toLowerCase() === "free";
};

/**
 * Sort plans by price (ascending)
 */
export const sortPlansByPrice = (plans: SubscriptionPlan[]): SubscriptionPlan[] => {
  if (!plans.length) return [];
  return [...plans].sort((a, b) => a.prices.amount - b.prices.amount);
};

/**
 * Find the plan ID that should be highlighted
 */
export const getHighlightedPlanId = (sortedPlans: SubscriptionPlan[]): string | null => {
  // First, try to find premium plan
  const premiumPlan = sortedPlans.find(
    (plan) => plan.metadata?.name?.toLowerCase() === "premium"
  );
  if (premiumPlan) {
    return premiumPlan.id;
  }

  // Otherwise, find the middle paid plan
  const paidPlans = sortedPlans.filter((p) => p.prices.amount > 0);
  if (paidPlans.length === 0) return null;
  return paidPlans[Math.floor((paidPlans.length - 1) / 2)]?.id || paidPlans[0]?.id;
};

