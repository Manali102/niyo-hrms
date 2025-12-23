"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { SIDEBAR_CONTENT } from "../../constants/constant";

/**
 * Sidebar component for navigation
 * @returns JSX.Element
 */
const Sidebar = ({ role }: { role?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  /** 🧩 Track screen size for SSR-safe rendering */
  useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth >= 1024);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  /** 🖱️ Desktop hover expand only for lg and above */
  const handleMouseEnter = () => {
    if (!isDesktop) return;
    hoverTimer.current = setTimeout(() => setIsExpanded(true), 100);
  };

  const handleMouseLeave = () => {
    if (!isDesktop) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setIsExpanded(false);
  };

  /** 🚫 Lock body scroll when mobile sidebar open */
  useEffect(() => {
    if (isMobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [isMobileOpen]);

  // Filter items based on role
  // If role is undefined, show nothing or basic items? 
  // Assuming role will be provided for auth users.
  // If item.allowedRoles is undefined, show to everyone (though we defined them all)
  const filteredItems = SIDEBAR_CONTENT.filter(item => {
      if (!role) return false;
      const normalizedRole = role.toLowerCase();
      // If item has no allowedRoles, show it (or hide? logic says !allowedRoles means public?)
      // Original logic: !item.allowedRoles || item.allowedRoles.includes(role)
      // If allowedRoles is defined, check if it includes the normalized role
      // We need to normalize allowedRoles too if they might be mixed case (though they seem lowercase in constant)
      // Being safe:
      return !item.allowedRoles || item.allowedRoles.map(r => r.toLowerCase()).includes(normalizedRole);
  });

  return (
    <>
      {/* 📱 Mobile toggle button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg lg:hidden"
        onClick={() => setIsMobileOpen((prev) => !prev)}
      >
        {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* 🧭 Sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={clsx(
          "fixed lg:static top-0 left-0 h-screen flex flex-col border-r border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))] shadow-sm overflow-hidden transition-all duration-300 ease-in-out z-40",
          {
            "translate-x-0": isDesktop || isMobileOpen, // always visible on lg+
            "-translate-x-full": !isDesktop && !isMobileOpen, // hidden only on mobile when closed
          }
        )}
        style={{
          width:
            isMobileOpen || isExpanded
              ? "14rem"
              : isDesktop
              ? "5rem"
              : "5rem",
        }}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center h-16 border-b border-[rgb(var(--color-border))] transition-all duration-200">
          {isExpanded || isMobileOpen ? (
            <h2 className="text-xl font-bold tracking-wide">Niyo</h2>
          ) : (
            <span className="text-2xl font-bold">N</span>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 mt-4 space-y-1">
          {filteredItems.map((item) => (
            <SidebarItem
              key={item.key}
              label={item.label}
              href={item.href}
              Icon={item.icon}
              expanded={isExpanded || isMobileOpen}
              onClick={() => setIsMobileOpen(false)} // close on click in mobile
            />
          ))}
        </nav>
      </aside>

      {/* 🔲 Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

type SidebarItemProps = {
  Icon: React.ElementType;
  label: string;
  href: string;
  expanded: boolean;
  onClick?: () => void;
};

/**
 * Sidebar item for navigation
 */
const SidebarItem = ({ Icon, label, href, expanded, onClick }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 p-3 rounded-lg mx-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-bg))] transition-all duration-200",
        expanded ? "justify-start" : "justify-center"
      )}
    >
      <Icon size={22} />
      <span
        className={clsx(
          "whitespace-nowrap text-sm overflow-hidden transition-opacity duration-200",
          expanded ? "opacity-100 ml-1" : "opacity-0 w-0"
        )}
      >
        {label}
      </span>
    </Link>
  );
};

export default Sidebar;
