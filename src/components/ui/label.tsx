import React from "react";

/**
 * Props for the Label component
 * Extends all native HTML label attributes
 */
type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

/**
 * Label Component
 * 
 * A styled label element for form inputs with consistent typography and spacing.
 * Automatically includes bottom margin for proper spacing above form fields.
 * 
 * @param {LabelProps} props - Component props including all native label attributes
 * @returns {React.ReactElement} The styled label element
 * 
 * @example
 * <Label htmlFor="email">Email</Label>
 * <Input id="email" type="email" />
 */
export const Label: React.FC<LabelProps> = ({ className = "", ...props }) => (
  <label
    className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
    {...props}
  />
);

export default Label;