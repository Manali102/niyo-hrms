"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthHeader from "@/components/auth/AuthHeader";
import { EmailIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/components/icons";
import { useRouter } from "next/navigation";
import { loginSchema, LoginFormValues } from "@/lib/api/validation";
import { messages } from "@/constants/messages";
import { login } from "@/server/auth.action";

// schema and types imported from @/lib/validation


/**
 * useLoginForm hook
 * Sets up form state, validation and submission
 */
const useLoginForm = () => {
  const router = useRouter();
  const [loginError, setLoginError] = React.useState<string | null>(null);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", keepLoggedIn: false },
    mode: "onTouched",
  });
  
  const onSubmit = async (data: LoginFormValues): Promise<void> => {
    try {
      setLoginError(null);

      const result = await login(data);
      if (!result.ok) throw new Error(result.error || 'Login failed');

      // Login successful - redirect to dashboard or requested page
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/';
      router.push(redirectTo);
      router.refresh(); // Refresh to update server components
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setLoginError(errorMessage);
      console.error('Login error:', error);
    }
  };
  
  return { ...form, onSubmit, loginError };
};

/** Inline error text helper */
const ErrorText = ({ text }: { text?: string }) => (
  <div className="mt-1 min-h-4">{text && <p className="text-xs text-red-600">{text}</p>}</div>
);

type EmailFieldProps = { register: UseFormRegister<LoginFormValues>; error?: string; show: boolean };
/** Email field */
const EmailField: React.FC<EmailFieldProps> = ({ register, error, show }) => (
  <div>
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="Enter your email" {...register("email")} leftIcon={<EmailIcon />} />
    <ErrorText text={show ? error : undefined} />
  </div>
);

type PasswordFieldProps = {
  register: UseFormRegister<LoginFormValues>;
  error?: string;
  show: boolean;
  toggle: () => void;
  visible: boolean;
};
/** Password field with toggle */
const PasswordField: React.FC<PasswordFieldProps> = ({ register, error, show, toggle, visible }) => (
  <div>
    <Label htmlFor="password">Password</Label>
    <Input
      id="password"
      type={visible ? "text" : "password"}
      placeholder="Enter your password"
      {...register("password")}
      leftIcon={<LockIcon />}
      rightIcon={
        <button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={toggle} className="text-gray-400 hover:text-gray-600">
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      }
    />
    <ErrorText text={show ? error : undefined} />
  </div>
);

type RememberRowProps = { register: UseFormRegister<LoginFormValues> };
/** Remember + forgot row */
const RememberRow: React.FC<RememberRowProps> = ({ register }) => (
  <div className="flex items-center justify-between">
    <label className="flex items-center gap-2 text-sm text-gray-600">
      <Checkbox className="text-blue-600" {...register("keepLoggedIn")} />
      Remember me
    </label>
    <Link href="#" className="text-sm text-blue-600 hover:underline">Forgot Password?</Link>
  </div>
);

/** Submit button */
const SubmitButton = ({ disabled, loading }: { disabled: boolean; loading: boolean }) => (
  <Button type="submit" size="lg" fullWidth disabled={disabled}>{loading ? "Signing in..." : "Login"}</Button>
);

/** Register link */
const RegisterLink = () => (
  <p className="text-sm text-gray-600 text-center">
    Don&#39;t have an account? <Link href="/register" className="text-blue-600 hover:underline">{messages.registerCta}</Link>
  </p>
);

/**
 * LoginForm Component (composed)
 */
const LoginForm: React.FC = () => {
  const { register, handleSubmit, formState, watch, onSubmit, loginError } = useLoginForm();
  const [showPassword, setShowPassword] = React.useState(false);
  const emailShown = !!watch("email");
  const passShown = !!watch("password");
  const toggle = () => setShowPassword((v) => !v);
  const disabled = !formState.isValid || formState.isSubmitting;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <AuthHeader title={messages.loginTitle} subtitle={messages.loginSubtitle} />
      {loginError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {loginError}
        </div>
      )}
      <EmailField register={register} error={formState.errors.email?.message} show={emailShown} />
      <PasswordField register={register} error={formState.errors.password?.message} show={passShown} toggle={toggle} visible={showPassword} />
      <RememberRow register={register} />
      <SubmitButton disabled={disabled} loading={formState.isSubmitting} />
      <RegisterLink />
    </form>
  );
};

export default LoginForm;