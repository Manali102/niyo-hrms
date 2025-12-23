"use client";

import React from "react";
import type { HolidaysPackage } from "./types";
import { Button } from "@/components/ui/button";

const getRegionDisplayName = (region: string): string => {
  const regionMap: Record<string, string> = {
    'IN': 'India',
    'USA': 'United States',
    'UK': 'United Kingdom',
  };
  return regionMap[region] || region;
};

const getRegionTitle = (region: string): string => {
  const titleMap: Record<string, string> = {
    'IN': 'Indian Holidays',
    'USA': 'US Federal Holidays',
    'UK': 'UK Bank Holidays',
  };
  return titleMap[region] || `${region} Holidays`;
};

export const HolidayCard: React.FC<{
  pkg: HolidaysPackage;
  isLoading?: boolean;
  onSelect?: (region: string) => void;
}> = ({ pkg, isLoading = false, onSelect }) => {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border transition-all duration-300 transform hover:scale-105 border-white/70 bg-white/90 text-gray-900 dark:text-white shadow-lg shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-gray-900/90">

      <div className="flex flex-col gap-3 px-8 pt-10 pb-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              {getRegionDisplayName(pkg.region)}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {getRegionTitle(pkg.region)}
            </h3>
          </div>
        </div>

        {/* Always visible holidays list */}
        <div className="mt-4">
          <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Included Holidays ({pkg.holidays.length})
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 scrollbar-thumb-rounded-full transition-all duration-300 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:opacity-0 group-hover:[&::-webkit-scrollbar]:opacity-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-track]:bg-transparent">
            {pkg.holidays.map((h) => (
              <li key={h._id} className="py-0.5">
                {h.holiday_name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-auto px-8 pb-8 relative z-10">
        <Button
          fullWidth
          variant="primary"
          className="cursor-pointer rounded-full"
          onClick={() => onSelect?.(pkg.region)}
          disabled={isLoading}
        >
          {isLoading ? "Applying..." : "Choose this package"}
        </Button>
      </div>
    </div>
  );
};
