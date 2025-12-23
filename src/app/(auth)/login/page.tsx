import React from "react";
import LoginForm from "@/components/auth/LoginForm";
import Image from "next/image";

/**
 * LoginPage Component
 * 
 * Renders the main login page with a split-screen layout featuring
 * a login form on the left and an illustration on the right.
 * 
 * Layout Features:
 * - Centered card design with shadow and rounded corners
 * - Responsive grid: single column on mobile, two columns on desktop
 * - Full-screen height with centered content
 * - Fade-in animation on page load
 * - Illustration hidden on mobile devices
 * 
 * Visual Design:
 * - Light gray background (#F9FAFB)
 * - White card container with rounded corners
 * - Subtle shadow for depth
 * - Responsive padding for different screen sizes
 * 
 * @returns {React.ReactElement} The login page layout
 * 
 * @example
 * export default function LoginPage() { ... }
 */
export default function LoginPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {/* Main Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-2 overflow-hidden animate-fade-in-up">

        {/* Left Section - Login Form */}
        <div className="p-8 md:p-10">
          <LoginForm />
        </div>

        {/* Right Section - Illustration (Hidden on Mobile) */}
        <div className="hidden md:block">
          <Image
            src="/images/login-illustration.svg"
            alt="Login illustration"
            width={800}
            height={600}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}