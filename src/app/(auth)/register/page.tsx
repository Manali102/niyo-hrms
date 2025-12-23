import React from "react";
import RegisterForm from "@/components/auth/RegisterForm";

/**
 * RegisterPage Component
 * 
 * Renders the registration page with a centered card layout containing the Register form.
 * Features a responsive single-column design with fade-in animation.
 * 
 * @returns {React.ReactElement} The Register page layout
 */
export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-8 md:p-12 animate-fade-in-up">
        <RegisterForm />
      </div>
    </div>
  );
}


