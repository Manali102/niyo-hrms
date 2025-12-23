import React from "react";
import { DefaultIcon } from "../icons";

/**
 * Props for the AuthHeader component
 */
type AuthHeaderProps = {
  /** The main heading text */
  title: string;
  /** Optional subtitle text displayed below the title */
  subtitle?: string;
  /** Optional custom icon to replace the default user icon */
  icon?: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
};


/**
 * AuthHeader Component
 * 
 * Displays a centered header for authentication pages (login/register).
 * Shows an icon, title, and optional subtitle in a vertical layout.
 * 
 * @param {AuthHeaderProps} props - Component props
 * @returns {React.ReactElement} The auth header component
 */
export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  icon,
  className = ""
}) => {
  return (
    <div className={`flex flex-col justify-center items-center ${className}`}>
      {icon ?? <DefaultIcon />}
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mb-8">{subtitle}</p>}
    </div>
  );
};

export default AuthHeader;