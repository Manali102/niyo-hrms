import React from "react";
import { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./global.css";
import Sidebar from "./../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import { getSession } from "@/lib/api/session";

/**
 * Metadata for the application
 */
export const metadata: Metadata = {
  title: "Niyo - Human Resource Management System",
  description:
    "Professional human resource management system with dashboard, analytics, and employee tracking",
};

/**
 * Root layout component for the application
 * Only shows Sidebar and Navbar for authenticated users
 * @param param0 - Props containing children elements
 * @returns JSX.Element
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const session = await getSession();
  
  // If no session, the middleware will handle redirect to login
  // But we still need to check here to conditionally show Sidebar/Navbar
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {session ? (
            // Authenticated layout with Sidebar and Navbar
          <div className="flex min-h-screen w-full overflow-hidden h-full max-h-[calc(100vh-4rem)]">
            <Sidebar role={session.role} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Navbar role={session.role} />
              {/* 🧭 Make main area scrollable */}
              <main className="flex-1 overflow-y-auto p-8">{children}</main>
            </div>
            </div>
          ) : (
            // Public layout without Sidebar and Navbar (for pages like login/register)
            <>{children}</>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
