"use client";

import React from "react";

type HeaderSectionProps = {
    label: string;               // e.g. "Flexible Pricing" or "Holiday Packages"
    title: string;               // e.g. "Choose the right plan for your team"
    description: string;         // e.g. "Select a plan that fits your needs..."
    onClose?: () => void;
    ariaLabel?: string;          // accessibility for close button
    id?: string;                 // optional id for <h2>
};

export const HeaderSection: React.FC<HeaderSectionProps> = ({
    label,
    title,
    description,
    onClose,
    ariaLabel = "Close section",
    id,
}) => {
    return (
        <header className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-600 dark:text-gray-400">
                    {label}
                </p>
                <h2 id={id} className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                    {title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                    {description}
                </p>
            </div>

            {onClose && (
                <div className="absolute right-0 top-0 md:static">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/60 text-gray-600 transition hover:border-gray-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-white"
                        aria-label={ariaLabel}
                    >
                        <span className="text-lg font-semibold leading-none group-hover:rotate-90 transition-transform duration-200">
                            ×
                        </span>
                    </button>
                </div>
            )}
        </header>
    );
};
