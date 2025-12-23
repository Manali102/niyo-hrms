"use client";

import { Bell, LogOut, Search, User, Key } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../ui/themeToggle";
import { logout } from "@/server/auth.action";
import { ChangePasswordDialog } from "@/components/auth/ChangePasswordDialog";

const MOCK_SEARCH_ITEMS = [
  "Apply Leave",
  "View Attendance",
  "Employee Directory",
  "Payroll Summary",
  "Approve Timesheet",
  "My Profile",
  "Settings",
  "Help Center",
];

/**
 * Navbar component for application header
 * @returns JSX.Element
 */
const Navbar = ({ role }: { role?: string }) => {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  /** Mount flag (prevents hydration mismatch with theme or dynamic UI) */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const result = await logout();
      if (result.ok) {
        router.push("/login");
        router.refresh();
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
      setShowProfileMenu(false);
    }
  };

  /** 🔍 Handle search */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      return;
    }
    const results = MOCK_SEARCH_ITEMS.filter((item) =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredResults(results);
  }, [searchQuery]);

  /** 🧠 Keyboard shortcut: Alt + K to focus search */
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.altKey && event.key === "K") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  /** 🖱️ Close search dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🩹 Wait for mount to prevent SSR hydration mismatches (especially from ThemeToggle)
  if (!mounted) return null;

  const isEmployee = role === "employee";

  return (
    <header
      className="flex items-center lg:pl-4 justify-end md:justify-between px-4 md:px-6 h-16 gap-4
      bg-[rgb(var(--color-surface))] 
      border-b border-[rgb(var(--color-border))] 
      text-[rgb(var(--color-text))] shadow-sm relative"
    >
      {/* LEFT: Company name (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-3">
        <h1 className="font-semibold text-lg tracking-wide">
          QODIC TECHNOSOFT
        </h1>
      </div>

      {/* CENTER: Search bar (hidden on mobile) */}
      <div
        ref={containerRef}
        className="hidden md:flex relative items-center w-[40%] bg-[rgb(var(--color-bg))] 
        border border-[rgb(var(--color-border))] rounded-full px-4 py-1.5 
        focus-within:ring-2 focus-within:ring-[rgb(var(--color-accent))] transition"
      >
        <Search
          size={18}
          className="text-[rgb(var(--color-text-secondary))] flex-shrink-0"
        />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search employees or actions (Ex: Apply Leave)"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setShowResults(true);
          }}
          className="ml-2 w-full bg-transparent outline-none text-sm placeholder-[rgb(var(--color-text-secondary))]"
        />
        <span
          className="text-xs font-medium text-[rgb(var(--color-text-secondary))] 
          bg-[rgb(var(--color-surface))] px-2 py-[3px] rounded-md ml-2 
          border border-[rgb(var(--color-border))] flex items-center justify-center leading-none"
        >
          Alt&nbsp;+&nbsp;K
        </span>

        {/* Search Results */}
        {showResults && filteredResults.length > 0 && (
          <ul
            className="absolute top-[110%] left-0 w-full bg-[rgb(var(--color-surface))] 
            border border-[rgb(var(--color-border))] rounded-lg shadow-md z-50"
          >
            {filteredResults.map((result, idx) => (
              <li
                key={idx}
                className="px-4 py-2 text-sm hover:bg-[rgb(var(--color-bg))] cursor-pointer"
                onClick={() => {
                  setSearchQuery(result);
                  setShowResults(false);
                }}
              >
                {result}
              </li>
            ))}
          </ul>
        )}
        {showResults && searchQuery && filteredResults.length === 0 && (
          <div
            className="absolute top-[110%] left-0 w-full bg-[rgb(var(--color-surface))] 
            border border-[rgb(var(--color-border))] rounded-lg shadow-md z-50 
            px-4 py-2 text-sm text-[rgb(var(--color-text-secondary))]"
          >
            No results found
          </div>
        )}
      </div>

      {/* RIGHT: Icons (always visible) */}
      <div className="flex items-center gap-3 relative">
        {/* Notification Icon */}
        <div className="relative cursor-pointer flex">
          <Bell
            size={22}
            className="text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-accent))] transition"
          />
          <span
            className="absolute -top-1 -right-1 bg-[rgb(var(--color-accent))] 
            text-white text-[10px] font-semibold rounded-full px-[5px] py-[1px]"
          >
            3
          </span>
        </div>

        {/* Theme toggle (hidden on mobile, only after mount) */}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>

        {/* Profile Menu */}
        <div className="relative flex cursor-pointer">
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="focus:outline-none"
          >
            <User />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-3 w-56 rounded-lg shadow-lg 
              bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] 
              text-[rgb(var(--color-text))] z-50 p-3"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <ul className="space-y-2">
                {isEmployee && (
                  <li
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-[rgb(var(--color-bg))] rounded cursor-pointer text-sm"
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push("/employee/profile");
                    }}
                  >
                    <User size={18} /> View Profile
                  </li>
                )}
                <li
                  className="flex items-center gap-2 px-2 py-1.5 
                  hover:bg-[rgb(var(--color-bg))] rounded cursor-pointer text-sm"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowChangePasswordModal(true);
                  }}
                >
                  <Key size={18} /> Change Password
                </li>
                <li
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-[rgb(var(--color-bg))] rounded cursor-pointer text-sm"
                >
                  <LogOut size={18} />{" "}
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <ChangePasswordDialog 
        isOpen={showChangePasswordModal} 
        onClose={() => setShowChangePasswordModal(false)} 
      />
    </header>
  );
};

export default Navbar;
