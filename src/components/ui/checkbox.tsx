import React from "react";

/**
 * Props for the Checkbox component
 * Extends all native HTML input attributes
 */
type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Checkbox Component
 * 
 * A styled checkbox input with consistent styling and focus states.
 * Features a blue accent color and rounded corners.
 * 
 * @param {CheckboxProps} props - Component props including all native input attributes
 * @returns {React.ReactElement} The styled checkbox input
 * 
 * @example
 * <Checkbox checked={isChecked} onChange={handleChange} />
 * <Checkbox disabled />
 */
export const Checkbox: React.FC<CheckboxProps> = ({ className = "", ...p }) => (
  <input
    type="checkbox"
    className={`h-4 w-4 rounded border-gray-300 accent-blue-600 focus:ring-blue-600 ${className}`}
    {...p}
  />
);

export default Checkbox;