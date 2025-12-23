"use client";

import { create } from "zustand";

export type Holiday = {
  _id: string;
  holiday_name: string;
  date: string;
  technical_name: string;
  region: string;
};

export type HolidaysPackage = {
  region: string;
  holidays: Holiday[];
};

type HolidaysStoreState = {
  isOpen: boolean;
  packages: HolidaysPackage[];
  selectedRegion: string | null;
  open: (packages?: HolidaysPackage[]) => void;
  close: () => void;
  selectPackage: (region: string) => void;
  reset: () => void;
};

/**
 * Zustand store for managing holidays package modal state.
 * Tracks visibility, available packages, and the currently selected package.
 */
export const useHolidaysStore = create<HolidaysStoreState>((set) => ({
  isOpen: false,
  packages: [],
  selectedRegion: null,
  open: (packages) =>
    set((state) => ({
      isOpen: true,
      packages: packages ?? state.packages,
    })),
  close: () =>
    set((state) => ({
      ...state,
      isOpen: false,
    })),
  selectPackage: (region) =>
    set({
      selectedRegion: region,
    }),
  reset: () =>
    set({
      isOpen: false,
      packages: [],
      selectedRegion: null,
    }),
}));


