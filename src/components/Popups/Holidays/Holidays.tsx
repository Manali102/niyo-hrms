"use client";

import React from "react";
import type { HolidaysProps } from "./types";
import { useHolidays } from "./useHolidays";
import { HolidaysSkeleton } from "./HolidaysSkeleton";
import { HolidayCard } from "./HolidayCard";
import { Button } from "@/components/ui/button";
import { HeaderSection } from "@/components/common/PopupHeader";
import { messages } from "@/constants/messages";

export const Holidays: React.FC<HolidaysProps> = (props) => {
  const { isOpen, onClose, onCustom, onSkip } = props;
  const { packages, loading, error, isApplyingId, handleSelect } = useHolidays(props);

  const handleSkip = () => {
    onSkip?.();
    onClose?.();
  };

  const handleCustom = () => {
    onCustom?.();
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="holidays-title"
    >
      <div
        className={`
        relative w-full overflow-hidden rounded-[32px] border border-white/20 shadow-2xl dark:border-white/10 bg-gradient-to-br from-amber-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950
        ${packages.length === 1
            ? "max-w-xl"
            : packages.length === 2
              ? "max-w-4xl"
              : "max-w-6xl"
          }`}
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(254,240,138,0.35),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(191,219,254,0.55),transparent_60%)]" />
          <div className="flex flex-col gap-8 px-8 pb-10 pt-8 md:px-12">
            <HeaderSection
              label="Holiday Packages"
              title="Choose holidays to provide your employees"
              description="Pick from curated country packages or customize your own later."
              onClose={onClose || (() => { })}
              ariaLabel="Close holidays"
              id="holidays-title"
            />

            {error && !loading && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <section
              className={`
              grid gap-6 
              ${packages.length === 1 ? "place-items-center" : ""}
              ${packages.length === 2 ? "lg:grid-cols-2 lg:justify-center lg:[&>*]:max-w-[420px]" : "lg:grid-cols-3"}`}
            >
              {loading ? (
                <HolidaysSkeleton />
              ) : packages.length > 0 ? (
                packages.map((pkg) => (
                  <HolidayCard
                    key={pkg.region}
                    pkg={pkg}
                    isLoading={isApplyingId === pkg.region}
                    onSelect={handleSelect}
                  />
                ))
              ) : (
                <div className="lg:col-span-3 flex justify-center py-12">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {messages.noHolidays}
                  </p>
                </div>
              )}
            </section>

            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="rounded-full cursor-pointer text-gray-900 dark:text-gray-100"
                onClick={handleCustom}
              >
                {messages.customHolidays}
              </Button>
              <div className="md:col-span-2 flex md:justify-end">
                <Button
                  variant="outline"
                  className="rounded-full cursor-pointer text-gray-900 dark:text-gray-100"
                  onClick={handleSkip}
                >
                  {messages.skipHolidays}
                </Button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};


