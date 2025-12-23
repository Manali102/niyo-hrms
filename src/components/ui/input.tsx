import React from "react";

/**
 * Props for the Input component
 * Extends all native HTML input attributes with optional left icon
 */
export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Optional icon to display on the left side of the input */
  leftIcon?: React.ReactNode;
  /** Optional icon to display on the right side of the input */
  rightIcon?: React.ReactNode;
};

/**
 * Input Component
 * 
 * A styled text input with optional left icon support and consistent styling.
 * Features focus states, rounded corners, and proper spacing for icons.
 * 
 * The component uses forwardRef to allow parent components to access the input element
 * directly via ref, which is useful for form libraries like react-hook-form.
 * 
 * @param {InputProps} props - Component props including all native input attributes
 * @param {React.Ref<HTMLInputElement>} ref - Forward ref to the input element
 * @returns {React.ReactElement} The styled input with optional icon wrapper
 * 
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {leftIcon}
          </span>
        )}
        {rightIcon && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            {rightIcon}
          </span>
        )}
        <input
          ref={ref}
          className={`block w-full rounded-md border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-600/20 outline-none focus-visible:outline-none h-10 ${leftIcon ? "pl-10" : "pl-3"} ${rightIcon ? "pr-10" : "pr-3"} py-2 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;