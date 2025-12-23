"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, UseFormRegister, UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthHeader from "@/components/auth/AuthHeader";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeOffIcon, LockIcon, EmailIcon, BuildingIcon } from "@/components/icons";
import { messages } from "@/constants/messages";
import { registerSchema, RegisterFormValues } from "@/lib/api/validation";
import { registerOrganization } from "@/server/auth.action";
import { usePricingPlanStore } from "@/store/usePricingPlanStore";

/**
 * Validation schema for register form
 * Ensures all required fields meet specific criteria including email format,
 * phone number validation, strong password requirements, and terms acceptance
 */
// schema and types imported from @/lib/validation

/**
 * Props for FormField component
 */
interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  register: UseFormRegisterReturn;
  error?: string;
  min?: number;
  leftIcon?: React.ReactNode;
}

/**
 * Reusable FormField component
 * Renders a labeled input field with error message display
 * 
 * @param {FormFieldProps} props - The form field properties
 * @returns {React.ReactElement} A labeled input with error handling
 */
const FormField: React.FC<FormFieldProps> = ({ id, label, type = "text", placeholder, register, error, min, leftIcon }) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} type={type} placeholder={placeholder} min={min} leftIcon={leftIcon} {...register} />
    <div className="mt-1 min-h-4">{error && <p className="text-xs text-red-600">{error}</p>}</div>
  </div>
);

/**
 * RegisterForm Component
 * 
 * A comprehensive registration form with multi-field validation and error handling.
 * Features:
 * - Email and phone number validation
 * - Password strength requirements and confirmation matching
 * - Company information collection
 * - Terms and conditions acceptance
 * - Disabled submit button until all fields are valid
 * - Loading state during submission
 * - Responsive grid layout (single column on mobile, two columns on desktop)
 * 
 * @returns {React.ReactElement} The register form component
 */
const useRegisterForm = () => {
  const router = useRouter();
  const [registerError, setRegisterError] = React.useState<string | null>(null);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      ownerName: "",
      ownerEmail: "",
      name: "",
      companyEmail: "",
      password: "",
      confirmPassword: "",
      terms: false
    },
    mode: "onChange",
  });
  
  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setRegisterError(null);
      
      // Remove confirmPassword before sending to API (it's only for validation)
      const registerData = {
        ownerName: values.ownerName,
        ownerEmail: values.ownerEmail,
        name: values.name,
        companyEmail: values.companyEmail,
        password: values.password,
      };
      const result = await registerOrganization(registerData);
      if (!result.ok) throw new Error(result.error || 'Register failed');

      // Register successful - redirect to dashboard (user is auto-logged in)
      usePricingPlanStore.getState().open({ trigger: "registration" });
      router.push('/');
      router.refresh(); // Refresh to update server components
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setRegisterError(errorMessage);
      console.error('Register error:', error);
    }
  };
  
  return { ...form, onSubmit, registerError };
};

/**
 * Terms: Renders the terms acceptance checkbox and error message.
 */
type TermsProps = { register: UseFormRegister<RegisterFormValues>; error?: string };
const Terms: React.FC<TermsProps> = ({ register, error }) => (
  <div className="md:col-span-2">
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <Checkbox className="text-blue-600" {...register("terms")} />
      <span>
        I agree to the <Link href="#" className="text-blue-600 hover:underline">Terms and Conditions</Link>
      </span>
    </label>
    <div className="min-h-4">{error && <p className="text-xs text-red-600">{error}</p>}</div>
  </div>
);

type PasswordFieldId = keyof Pick<RegisterFormValues, "password" | "confirmPassword">;
interface PasswordFieldProps {
  id: PasswordFieldId;
  label: string;
  valueShown?: string;
  register: UseFormRegister<RegisterFormValues>;
  visible: boolean;
  toggle: () => void;
  error?: string;
}
/**
 * PasswordField: Input with show/hide toggle and inline error.
 */
const PasswordField: React.FC<PasswordFieldProps> = ({ id, label, valueShown, register, visible, toggle, error }) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type={visible ? "text" : "password"}
      placeholder={label === "Password" ? "Enter your password" : "Re-enter your password"}
      {...register(id)}
      leftIcon={<LockIcon />}
      rightIcon={
        <button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={toggle} className="text-gray-400 hover:text-gray-600">
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      }
    />
    <div className="mt-1 min-h-4">{valueShown && error && <p className="text-xs text-red-600">{error}</p>}</div>
  </div>
);

/**
 * Submit: Primary CTA button for submitting the register form.
 */
const Submit = ({ disabled, loading }: { disabled: boolean; loading: boolean }) => (
  <div className="md:col-span-2 w-full flex justify-center items-center">
    <Button type="submit" size="lg" fullWidth disabled={disabled}>{loading ? "Creating account..." : "Sign up"}</Button>
  </div>
);

/**
 * LoginLink: Secondary link to navigate to the login page.
 */
const LoginLink = () => (
  <div className="md:col-span-2 text-sm text-gray-600 text-center">
    Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
  </div>
);

/**
 * RegisterForm: Displays the registration form, validates inputs via Zod, and submits.
 */
const RegisterForm: React.FC = () => {
  const { register, handleSubmit, formState, watch, onSubmit, registerError } = useRegisterForm();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const disabled = !formState.isValid || formState.isSubmitting;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <AuthHeader title={messages.registerTitle} subtitle="" />
      {registerError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {registerError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-4 gap-y-5">
        <FormField
          id="ownerName"
          label="Owner name"
          placeholder="Enter Owner name"
          register={register("ownerName")}
          error={watch("ownerName") ? formState.errors.ownerName?.message : undefined}
        />
        <FormField
          id="ownerEmail"
          label="Owner email"
          type="email"
          placeholder="Enter owner email"
          register={register("ownerEmail")}
          leftIcon={<EmailIcon />}
          error={watch("ownerEmail") ? formState.errors.ownerEmail?.message : undefined}
        />
        <FormField
          id="name"
          label="Company name"
          placeholder="Enter company name"
          register={register("name")}
          leftIcon={<BuildingIcon />}
          error={watch("name") ? formState.errors.name?.message : undefined}
        />
        <FormField
          id="companyEmail"
          label="Company email"
          type="email"
          placeholder="Enter company email"
          register={register("companyEmail")}
          leftIcon={<EmailIcon />}
          error={watch("companyEmail") ? formState.errors.companyEmail?.message : undefined}
        />
        <PasswordField id="password" label="Password" valueShown={watch("password")} register={register} visible={showPassword} toggle={() => setShowPassword((v: boolean) => !v)} error={formState.errors.password?.message} />
        <PasswordField id="confirmPassword" label="Confirm password" valueShown={watch("confirmPassword")} register={register} visible={showConfirm} toggle={() => setShowConfirm((v: boolean) => !v)} error={formState.errors.confirmPassword?.message} />
        <Terms register={register} error={formState.errors.terms?.message as string} />
        <Submit disabled={disabled} loading={formState.isSubmitting} />
        <LoginLink />
      </div>
    </form>
  );
};

export default RegisterForm;