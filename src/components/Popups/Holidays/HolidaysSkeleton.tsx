"use client";

import React from "react";

export const HolidaysSkeleton: React.FC = () => {
  return (
    <div className="lg:col-span-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-full rounded-3xl border border-gray-200 bg-white/90 dark:border-white/10 dark:bg-gray-900/90 p-8 animate-pulse flex flex-col justify-between"
        >
          <div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-3 w-4/6 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="mt-6">
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};


