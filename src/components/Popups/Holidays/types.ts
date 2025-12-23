"use client";

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

export type HolidaysProps = {
  isOpen: boolean;
  packages?: HolidaysPackage[];
  onClose?: () => void;
  onSelectPackage?: (region: string) => void;
  onCustom?: () => void;
  onSkip?: () => void;
};


