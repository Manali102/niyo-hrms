import React from "react";

/**
 * Auth layout component
 * This layout is used for authentication pages (login, register)
 * and doesn't include the Sidebar and Navbar
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
