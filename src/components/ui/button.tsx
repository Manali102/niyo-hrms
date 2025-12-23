import React from "react";

/**
 * Props for the Button component
 * Extends native HTML button attributes with custom variant prop
 */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Visual style variant of the button */
  variant?: "primary" | "secondary" | "ghost" | "outline";
  /** Size of the button for consistent paddings */
  size?: "sm" | "md" | "lg";
  /** Make button stretch to full container width */
  fullWidth?: boolean;
};

/**
 * Button Component
 * 
 * A reusable button component with multiple style variants and full accessibility support.
 * Includes focus states, hover effects, and disabled states.
 * 
 * Variants:
 * - primary: Blue background for main actions
 * - secondary: Gray background for secondary actions
 * - ghost: Transparent background with hover effect
 * 
 * @param {ButtonProps} props - Component props including all native button attributes
 * @returns {React.ReactElement} The styled button element
 * 
 * @example
 * <Button variant="primary">Submit</Button>
 * <Button variant="secondary" onClick={handleClick}>Cancel</Button>
 * <Button variant="ghost" disabled>Loading...</Button>
 */
export const Button: React.FC<ButtonProps> = ({
  className = "",
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-300",
    ghost:
      "bg-transparent text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-300",
    outline:
      "border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-300",
  };

  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "h-8 px-3 py-1 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-11 px-6 py-2.5 text-sm",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;