import React from "react";

/**
 * Props for icon components
 */
type IconProps = {
  /** Optional CSS classes for custom sizing and styling */
  className?: string;
};

/**
 * EmailIcon Component
 * 
 * Renders an envelope/mail icon, typically used for email input fields.
 * 
 * @param {IconProps} props - Component props
 * @returns {React.ReactElement} The email icon SVG
 */
export const EmailIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
  </svg>
);

/**
 * LockIcon Component
 * 
 * Renders a padlock icon, typically used for password input fields.
 * 
 * @param {IconProps} props - Component props
 * @returns {React.ReactElement} The lock icon SVG
 */
export const LockIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 1 1 6 0v3H9Z" />
  </svg>
);

/**
 * PhoneIcon Component
 */
export const PhoneIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.6 2.63a2 2 0 0 1-.45 2.11L8 9a16 16 0 0 0 7 7l.54-1.21a2 2 0 0 1 2.11-.45c.85.28 1.73.48 2.63.6A2 2 0 0 1 22 16.92z" />
  </svg>
);

/**
 * BuildingIcon Component (Company)
 */
export const BuildingIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 22h18" />
    <path d="M6 22V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v16" />
    <path d="M6 10h8" />
    <path d="M6 14h8" />
    <path d="M10 22v-4h4v4" />
  </svg>
);

/**
 * EyeIcon Component
 *
 * Open eye icon for showing password.
 */
export const EyeIcon: React.FC<IconProps> = ({ className = "h-5 w-5 cursor-pointer" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/**
 * EyeOffIcon Component
 *
 * Slashed eye icon for hiding password.
 */
export const EyeOffIcon: React.FC<IconProps> = ({ className = "h-5 w-5 cursor-pointer" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.94" />
    <path d="M1 1l22 22" />
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.58 5.08A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.4 4.4" />
  </svg>
);

/**
 * Default user icon component
 * Displays a circular blue user avatar icon
 * 
 * @returns {React.ReactElement} The default icon
 */
export const DefaultIcon = (): React.ReactElement => (
  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 text-blue-600 mb-4">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-3.33 0-6 2.69-6 6h12c0-3.31-2.67-6-6-6Z" />
    </svg>
  </div>
);

/**
 * Icons object containing all icon components
 * Allows for named imports or default import usage
 */
const Icons = { EmailIcon, LockIcon, EyeIcon, EyeOffIcon, PhoneIcon, BuildingIcon, DefaultIcon };

export default Icons;