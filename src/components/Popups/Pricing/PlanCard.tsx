"use client";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { PlanCardProps } from "./types";
import { formatPrice, getPlanRange, getPlanBadge } from "./utils";

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  billingCycle,
  isHighlighted = false,
  isLoading = false,
  onSelect,
}) => {
  const displayPrice = useMemo(
    () => formatPrice(plan.prices.amount, plan.prices.currency, billingCycle),
    [plan.prices.amount, plan.prices.currency, billingCycle]
  );

  const range = getPlanRange(plan);
  const badge = getPlanBadge(plan);
  const ctaLabel = plan.metadata?.ctaLabel || "Select Plan";
  const footnote = plan.metadata?.footnote;

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl border transition-all duration-300 transform hover:scale-105 ${
        isHighlighted
          ? "border-yellow-400 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white shadow-xl shadow-yellow-400/20"
          : "border-white/70 bg-white/90 text-gray-900 dark:text-white shadow-lg shadow-black/5 backdrop-blur"
      } dark:border-white/10 dark:bg-gray-900/90`}
    >
      {badge && (
        <span className="absolute right-4 top-4 rounded-full bg-yellow-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-900 shadow-sm">
          {badge}
        </span>
      )}

      <div className="flex flex-col gap-3 px-8 pt-10 pb-6">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${
              isHighlighted ? "text-yellow-300/90" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {range}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-gray-900 dark:text-white">{displayPrice}</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">per month</span>
          </div>
        </div>
        {plan.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
        )}
      </div>

      <div className="mt-auto px-8 pb-8">
        <Button
          fullWidth
          variant={isHighlighted ? "secondary" : "primary"}
          className={
            isHighlighted
              ? "cursor-pointer rounded-full bg-yellow-300 text-gray-900 hover:bg-yellow-200 focus-visible:ring-yellow-300"
              : "cursor-pointer rounded-full"
          }
          onClick={() => onSelect?.(plan.id, billingCycle)}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : ctaLabel}
        </Button>
        {footnote && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{footnote}</p>
        )}
      </div>
    </div>
  );
};

