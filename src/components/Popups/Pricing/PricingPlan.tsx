"use client";
import React from "react";
import type { PricingPlanProps } from "./types";
import { usePricingPlan } from "./usePricingPlan";
import { PlanCard } from "./PlanCard";
import { PricingSkeleton } from "./PricingSkeleton";
import { HeaderSection } from "@/components/common/PopupHeader";

export const PricingPlan: React.FC<PricingPlanProps> = (props) => {
  const { isOpen, onClose } = props;
  const {
    billingCycle,
    sortedPlans,
    highlightedPlanId,
    activePlan,
    loading,
    error,
    processingPlanId,
    handlePlanSelect,
  } = usePricingPlan(props);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-plan-title"
    >
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-br from-amber-50 via-white to-blue-50 shadow-2xl dark:border-white/10 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 my-auto">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(254,240,138,0.35),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(191,219,254,0.55),transparent_60%)]" />

        <div className="flex flex-col gap-8 px-8 pb-10 pt-8 md:px-12">
          <HeaderSection
            label="Flexible Pricing"
            title="Choose the right plan for your team"
            description="Select a plan that fits your needs. Switch billing anytime."
            onClose={onClose}
            ariaLabel="Close pricing plans"
            id="pricing-plan-title"
          />
          {error && !loading && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <section className="grid gap-6 lg:grid-cols-3">
            {loading ? (
              <PricingSkeleton />
            ) : error && sortedPlans.length === 0 ? (
              <div className="lg:col-span-3 flex justify-center py-12">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : sortedPlans.length > 0 ? (
              sortedPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  billingCycle={billingCycle}
                  isHighlighted={plan.id === highlightedPlanId}
                  isActive={activePlan?.id === plan.id}
                  isLoading={processingPlanId === plan.id}
                  onSelect={handlePlanSelect}
                />
              ))
            ) : (
              <div className="lg:col-span-3 flex justify-center py-12">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  No pricing plans available at the moment.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

