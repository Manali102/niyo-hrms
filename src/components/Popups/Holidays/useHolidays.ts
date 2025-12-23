"use client";

import { useEffect, useState } from "react";
import { useHolidaysStore } from "@/store/useHolidaysStore";
import type { HolidaysProps, HolidaysPackage } from "./types";
import { getHolidayList, insertHolidays } from "@/server/holidays.action";

/**
 * Hook for managing holiday packages selection and state.
 * Fetches packages from API and handles package selection.
 * @param {HolidaysProps} props - Configuration including isOpen flag, packages array, and selection callback
 * @returns {Object} Package list, loading state, error state, and selection handler
 */
export const useHolidays = ({ isOpen, packages, onSelectPackage, onClose }: HolidaysProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApplyingId, setIsApplyingId] = useState<string | null>(null);
  const [fetchedPackages, setFetchedPackages] = useState<HolidaysPackage[]>([]);

  const { packages: storePkgs, open, selectPackage } = useHolidaysStore();

  // Fetch holiday packages from API
  useEffect(() => {
    if (!isOpen) return;

    const fetchHolidays = async () => {
      // If packages are provided via props, use them
      if (packages && packages.length > 0) {
        setFetchedPackages(packages);
        open(packages);
        return;
      }

      // If packages are already in store, use them
      if (storePkgs && storePkgs.length > 0) {
        setFetchedPackages(storePkgs);
        return;
      }

      // Otherwise fetch from API using server action
      try {
        setLoading(true);
        setError(null);

        const result = await getHolidayList();
        
        if (!result.ok) {
          throw new Error(result.error || "Failed to fetch holiday packages");
        }

        if (result.data && result.data.length > 0) {
          setFetchedPackages(result.data);
          open(result.data);
        } else {
          throw new Error("No holiday packages available");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load holiday packages.");
        setFetchedPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [isOpen, packages, storePkgs, open]);

  const handleSelect = async (region: string) => {
    try {
      setIsApplyingId(region);
      setError(null);

      // Find the selected package
      const selectedPackage = fetchedPackages.find(pkg => pkg.region === region);
      
      if (!selectedPackage) {
        throw new Error("Selected package not found.");
      }
      
      // Make API call to insert holidays
      const result = await insertHolidays(selectedPackage.holidays);

      if (!result.ok) {
        throw new Error(result.error || "Failed to insert holidays.");
      }

      // Persist selected in store
      selectPackage(region);
      // Call callback
      onSelectPackage?.(region);
      // Close popup after successful selection
      onClose?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to apply holidays package.");
    } finally {
      setIsApplyingId(null);
    }
  };

  return {
    packages: fetchedPackages,
    loading,
    error,
    isApplyingId,
    handleSelect,
  };
};


