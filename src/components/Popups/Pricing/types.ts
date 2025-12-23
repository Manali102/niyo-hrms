import type { BillingCycle } from "@/store/usePricingPlanStore";
import type { SubscriptionPlan } from "@/server/subscription.action";

export type PricingPlanProps = {
  isOpen: boolean;
  plans?: SubscriptionPlan[];
  onClose?: () => void;
  onSelectPlan?: (planId: string, billingCycle: BillingCycle) => void;
};

export type PlanCardProps = {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  isHighlighted?: boolean;
  isActive?: boolean;
  isLoading?: boolean;
  onSelect?: (planId: string, billingCycle: BillingCycle) => void;
};

