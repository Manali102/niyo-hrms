"use server";

import { apiClient } from "@/lib/api/api-client.server";
import { endpoints } from "@/lib/api/endpoints";
import { type Employee } from "@/types/employee.types";
import { isRedirectError } from "@/lib/utils";

type EmployeeListParams = {
  page: number;
  limit: number;
  name?: string;
};

type EmployeeListResponse = {
  success: boolean;
  message?: string;
  data: {
    employeeList: Employee[];
    total: number;
  };
};

type ActionResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export async function getEmployeeList(
  params: EmployeeListParams
): Promise<ActionResult<EmployeeListResponse["data"]>> {
  try {
    const response = await apiClient.post<EmployeeListResponse>(
      endpoints.employee.list,
      params,
      { auth: true }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: response.error || "Failed to fetch employees",
      };
    }

    if (!response.data?.success) {
      return {
        ok: false,
        error: response.data?.message || "Failed to fetch employees",
      };
    }

    return { ok: true, data: response.data.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error fetching employee list:", error);
    return { ok: false, error: "Internal server error" };
  }
}

type CreateEmployeeParams = {
  fullName: string;
  companyEmail: string;
  personalEmail: string;
  jobTitle: string;
  phoneNumber: string;
  address: string;
  gender: string;
  dateOfBirth: string;
  hireDate: string;
  employeeType: string;
  isActive: boolean;
  offBoardDate: string;
  managerId?: string;
};

export async function createEmployee(
  params: CreateEmployeeParams
): Promise<ActionResult<unknown>> {
  try {
    const response = await apiClient.post(endpoints.employee.create, params, {
      auth: true,
    });

    if (!response.ok) {
      return {
        ok: false,
        error: response.error || "Failed to create employee",
      };
    }

    // Check for success in the response body if needed, similar to list
    // Assuming standard response format
    const data = response.data as { success?: boolean; message?: string };
    if (data && !data.success) {
      return { ok: false, error: data.message || "Failed to create employee" };
    }

    return { ok: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error creating employee:", error);
    return { ok: false, error: "Internal server error" };
  }
}

type EmployeeDetailsResponse = {
  success: boolean;
  message?: string;
  data: Employee;
};

export async function getEmployeeDetails(
  employeeId: string
): Promise<ActionResult<Employee>> {
  try {
    const response = await apiClient.get<EmployeeDetailsResponse>(
      endpoints.employee.get(employeeId),
      { auth: true }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: response.error || "Failed to fetch employee details",
      };
    }

    if (!response.data?.success) {
      return {
        ok: false,
        error: response.data?.message || "Failed to fetch employee details",
      };
    }

    return { ok: true, data: response.data.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error fetching employee details:", error);
    return { ok: false, error: "Internal server error" };
  }
}

type UpdateEmployeeParams = {
  fullName: string;
  companyEmail: string;
  personalEmail: string;
  jobTitle: string;
  phoneNumber: string;
  address: string;
  gender: string;
  dateOfBirth: string;
  hireDate: string;
  employeeType: string;
  isActive: boolean;
  offBoardDate: string;
  managerId?: string;
  organizationId?: string;
};

export async function updateEmployee(
  employeeId: string,
  params: UpdateEmployeeParams
): Promise<ActionResult<unknown>> {
  try {
    const response = await apiClient.put(
      endpoints.employee.update(employeeId),
      params,
      { auth: true }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: response.error || "Failed to update employee",
      };
    }

    const data = response.data as { success?: boolean; message?: string };
    if (data && !data.success) {
      return { ok: false, error: data.message || "Failed to update employee" };
    }

    return { ok: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error updating employee:", error);
    return { ok: false, error: "Internal server error" };
  }
}

type EmployeeHierarchyResponse = {
  success: boolean;
  message: string;
  data: Employee[];
};

export async function getEmployeeHierarchy(
  managerId: string
): Promise<ActionResult<Employee[]>> {
  try {
    const response = await apiClient.get<EmployeeHierarchyResponse>(
      endpoints.employee.hierarchy(managerId),
      { auth: true }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: response.error || "Failed to fetch employee hierarchy",
      };
    }

    if (!response.data?.success) {
      return {
        ok: false,
        error: response.data?.message || "Failed to fetch employee hierarchy",
      };
    }

    return { ok: true, data: response.data.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error fetching employee hierarchy:", error);
    return { ok: false, error: "Internal server error" };
  }
}

type ResetPasswordParams = {
  employeeId: string;
  password: string;
};

export async function resetEmployeePassword(
  params: ResetPasswordParams
): Promise<ActionResult<unknown>> {
  try {
    const response = await apiClient.post(
      endpoints.employee.resetPassword,
      params,
      { auth: true }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: response.error || "Failed to reset password",
      };
    }

    const data = response.data as { success?: boolean; message?: string };
    if (data && !data.success) {
      return { ok: false, error: data.message || "Failed to reset password" };
    }

    return { ok: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error resetting password:", error);
    return { ok: false, error: "Internal server error" };
  }
}
