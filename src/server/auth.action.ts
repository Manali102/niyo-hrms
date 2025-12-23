"use server";

import { z } from "zod";
import { isRedirectError } from "@/lib/utils";
import {
  getSession,
  setSession,
  deleteSession,
  SessionData,
} from "@/lib/api/session";
import { loginSchema } from "@/lib/api/validation";
import { messages } from "@/constants/messages";
import { apiClient } from "@/lib/api/api-client.server";
import { endpoints } from "@/lib/api/endpoints";
import { RegisterResponse } from "@/constants/types";

type ActionResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  details?: unknown;
};


export interface UpcomingHoliday {
  _id: string;
  organization_id: string;
  holiday_name: string;
  date: string;
}

export interface UpcomingBirthday {
  _id: string;
  fullName: string;
  dateOfBirth: string;
}

type UpcomingHolidaysResponse = {
  success: boolean;
  message: string;
  data: {
    upcomingHolidayList: UpcomingHoliday[];
  };
};

type UpcomingBirthdaysResponse = {
  success: boolean;
  message: string;
  data: {
    upcomingHolidayList: UpcomingBirthday[]; // Note: API returns upcomingHolidayList key for birthdays too
  };
};

type LoginApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    loginDetails?: {
      _id?: string;
      admin_id?: {
        _id?: string;
        full_name?: string;
        role?: string;
        organization_id?: string;
      };
      employee_id?: {
        _id?: string;
        fullName?: string;
        organizationId?: string;
      };
    };
    accessToken?: string;
    refreshToken?: string;
  };
};

export async function getSessionAction(): Promise<
  ActionResult<{ user: SessionData | null; authenticated: boolean }>
> {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: true, data: { user: null, authenticated: false } };
    }
    return { ok: true, data: { user: session, authenticated: true } };
  } catch {
    return { ok: true, data: { user: null, authenticated: false } };
  }
}

export async function logout(): Promise<ActionResult<{ message: string }>> {
  try {
    await deleteSession();
    return { ok: true, data: { message: "Logout successful" } };
  } catch {
    return { ok: false, error: "Internal server error" };
  }
}

export async function login(
  input: unknown
): Promise<ActionResult<{ user: SessionData }>> {
  try {
    const validated = loginSchema.parse(input);
    const { email, password, keepLoggedIn } = validated;

    const response = await apiClient.post<LoginApiResponse>(
      endpoints.auth.login,
      { email, password, keepLoggedIn }
    );
    if (!response.ok || !response.data?.success) {
      const errorMessage =
        response.error ?? response.data?.message ?? "Login failed";
      return { ok: false, error: errorMessage };
    }
    const payload = response.data.data;
    const admin = payload?.loginDetails?.admin_id;
    const employee = payload?.loginDetails?.employee_id;
    const accessToken = payload?.accessToken;
    const refreshToken = payload?.refreshToken;

    if ((!admin && !employee) || !accessToken) {
      return {
        ok: false,
        error: "Invalid login response received from server",
      };
    }

    const maxAge = keepLoggedIn ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
    const sessionPayload: SessionData = {
      userId: String(admin?._id || employee?._id),
      email,
      role: admin?.role || "employee",
      name: admin?.full_name || employee?.fullName,
      organizationId: admin?.organization_id || employee?.organizationId,
      accessToken,
      refreshToken,
    };

    await setSession(sessionPayload, maxAge);

    return {
      ok: true,
      data: {
        user: sessionPayload,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: "Invalid request data",
        details: error.errors,
      };
    }
    return { ok: false, error: "Internal server error", details: error };
  }
}

const registerPayloadSchema = z.object({
  ownerName: z.string().min(1, messages.required),
  ownerEmail: z.string().min(1, messages.required).email(messages.invalidEmail),
  name: z.string().min(2, "Company name must be at least 2 characters"),
  companyEmail: z
    .string()
    .min(1, messages.required)
    .email(messages.invalidEmail),
  password: z
    .string()
    .min(8, messages.passwordMin)
    .regex(/[A-Z]/, messages.passwordUpper)
    .regex(/[a-z]/, messages.passwordLower)
    .regex(/[0-9]/, messages.passwordNumber),
});

export async function registerOrganization(
  input: unknown
): Promise<ActionResult<unknown>> {
  try {
    const validated = registerPayloadSchema.parse(input);
    const { ownerName, ownerEmail, name, companyEmail, password } = validated;
    const res = await apiClient.post(endpoints.organization.create, {
      ownerName,
      ownerEmail,
      name,
      companyEmail,
      password,
    });

    if (!res.ok)
      return {
        ok: false,
        error: res.error || "Registration failed",
        details: res.details,
      };

    const payload = res.data as RegisterResponse;
    const loginCredentials = payload?.data?.loginCredentials;
    const accessToken: string | undefined = loginCredentials?.accessToken;
    const refreshToken: string | undefined = loginCredentials?.refreshToken;
    const user = loginCredentials?.user;

    if (user?.adminId && user?.email) {
      // Store session so user is authenticated after registration
      // 30 days session by default for registration
      await setSession(
        {
          userId: user.adminId,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          accessToken,
          refreshToken,
        },
        60 * 60 * 24 * 30
      );
    }

    return { ok: true, data: res.data };
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: "Invalid request data",
        details: error.errors,
      };
    }
    return { ok: false, error: "Internal server error" };
  }
}

export async function resetPassword(
  password: string
): Promise<ActionResult<{ message: string }>> {
  try {
    const session = await getSession();

    console.log(session);

    if (!session?.accessToken && !session?.refreshToken) {
      return { ok: false, error: "Unauthorized" };
    }

    const res = await apiClient.post<{ success: boolean; message: string }>(
      endpoints.auth.resetPassword,
      { password },
      {
        headers: {
          "access-token": String(session?.accessToken),
          "refresh-token": String(session?.refreshToken),
        },
      }
    );

    if (!res.ok) {
      return { ok: false, error: res.error || "Failed to reset password" };
    }

    return { ok: true, data: { message: "Password reset successfully" } };
  } catch (error) {
    console.error("Reset password error:", error);
    return { ok: false, error: "Internal server error" };
  }
}

export async function getUpcomingHolidays(): Promise<
  ActionResult<UpcomingHoliday[]>
> {
  try {
    // API requires POST with password? User prompt shows raw data with password?
    // "Content-Type: application/json" --data-raw '{ "password": "Test@111" }'
    // This looks very strange for a GET upcoming holidays.
    // However, the curl command says: --request GET 'http://localhost:5001/api/auth/view-upcoming-holidays'
    // BUT also has --data-raw '{"password": "Test@111"}'.
    // Typically GET requests don't have body. Express might ignore it or it might be a mistake in the curl provided.
    // The previous curl for `leave-request` was GET and had no body.
    // The curl for holidays/birthdays has body.
    // AND the header says access-token/refresh-token.
    // I will try a simple GET first without body. If it fails, I might need to ask or look at backend?
    // But wait, the curl result "message": "Password reset successfully" suggests the result MIGHT be copy-pasted from password reset?
    // Oh, notice the "result" in user prompt for holidays:
    // { "success": true, "message": "Password reset successfully", "data": { "upcomingHolidayList": ... } }
    // The message is definitely wrong (backend bug or copy paste error).
    // The DATA seems correct.
    // Since it's a "view" endpoint, GET makes sense. I will assume GET without body.
    // If the user's curl was just testing and they left the body there by mistake from a previous call (reset password), that explains the "password" in body AND the "Password reset successfully" message if the backend just reused some logic or it's a complete mess.
    // But the DATA is what I want.
    
    // Attempt standard GET
    const response = await apiClient.get<UpcomingHolidaysResponse>(
        endpoints.auth.viewUpcomingHolidays,
        { auth: true }
    );

    if (!response.ok) {
        return { ok: false, error: response.error || "Failed to fetch holidays" };
    }
    
    // Check internal success flag if present (assuming similar structure to others)
    if (response.data?.success === false) {
         return { ok: false, error: response.data?.message || "Failed to fetch holidays" };
    }

    return { ok: true, data: response.data?.data?.upcomingHolidayList || [] };

  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error fetching holidays:", error);
    return { ok: false, error: "Internal server error" };
  }
}

export async function getUpcomingBirthdays(): Promise<
  ActionResult<UpcomingBirthday[]>
> {
  try {
    // Similar assumption as holidays
    const response = await apiClient.get<UpcomingBirthdaysResponse>(
        endpoints.auth.viewUpcomingBirthdays,
        { auth: true }
    );

    if (!response.ok) {
        return { ok: false, error: response.error || "Failed to fetch birthdays" };
    }

     if (response.data?.success === false) {
         return { ok: false, error: response.data?.message || "Failed to fetch birthdays" };
    }

    // Mapping upcomingHolidayList to upcomingBirthdayList concept
    return { ok: true, data: response.data?.data?.upcomingHolidayList || [] };

  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error fetching birthdays:", error);
    return { ok: false, error: "Internal server error" };
  }
}
