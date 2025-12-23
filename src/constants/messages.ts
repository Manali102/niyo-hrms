/**
 * Centralized static messages for forms and UI
 */
export const messages = {
  // Generic
  required: "This field is required",
  invalidEmail: "Enter a valid email address",
  invalidPhone: "Enter a valid phone number (e.g., +15551234567)",
  passwordMin: "Password must be at least 8 characters",
  passwordUpper: "Include at least one uppercase letter",
  passwordLower: "Include at least one lowercase letter",
  passwordNumber: "Include at least one number",
  passwordsMismatch: "Passwords do not match",
  acceptTerms: "You must accept the terms and conditions",

  // UI copy
  loginTitle: "Welcome to Niyo",
  loginSubtitle: "Log in to your account",
  loginCta: "Login",
  loginLoading: "Signing in...",
  signupTitle: "Sign up to continue",
  signupCta: "Sign up",
  signupLoading: "Creating account...",
  forgotPassword: "Forgot Password?",
  rememberMe: "Remember me",
  noAccount: "Don't have an account?",
  haveAccount: "Already have an account?",
  termsAndConditions: "Terms and Conditions",
  registerTitle: "Register to continue",
  registerCta: "Register",
  noHolidays: "No holiday packages available at the moment.",
  customHolidays: "Customize my own holidays.",
  skipHolidays: "Skip with no Holidays"
};

export type Messages = typeof messages;


