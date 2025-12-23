"use server";

import { apiClient } from "@/lib/api/api-client.server";
import { endpoints } from "@/lib/api/endpoints";
import { LeaveRequest, LeaveRequestStatus } from "@/types/leave.types";
import { isRedirectError } from "@/lib/utils";

type GetEmployeeLeaveRequestsParams = {
  employeeId?: string;
  page?: number;
  limit?: number;
  status?: string;
};

type GetEmployeeLeaveRequestsResponse = {
  success: boolean;
  message: string;
  data: {
    leaveRequests: LeaveRequest[];
    totalLeaveRequests: number;
  };
};

type ActionResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export async function getEmployeeLeaveRequests(
  params: GetEmployeeLeaveRequestsParams
): Promise<ActionResult<GetEmployeeLeaveRequestsResponse["data"]>> {
  try {
    // Construct query string manually or let apiClient handle it if it supported query params in get
    // The current apiClient.get takes path and options. It doesn't seem to automatically serialize params to query string in the 'get' wrapper shown in previous steps.
    // However, looking at 'getEmployeeDetails' in 'src/server/employee.action.ts', it constructs the URL.
    // But 'getEmployeeList' uses 'apiClient.post'.
    // The user request shows a GET request with query params for this endpoint:
    // /api/leave-request/employee-requests?page=1&limit=5&status=pending&employeeId=...
    
    const queryParams = new URLSearchParams();
    if (params.employeeId) queryParams.append("employeeId", params.employeeId);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.status) queryParams.append("status", params.status);

    const qs = queryParams.toString();
    const url = `${endpoints.leaveRequest.employeeRequests}?${qs}`;

    const response = await apiClient.get<GetEmployeeLeaveRequestsResponse>(
      url,
      { auth: true }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: response.error || "Failed to fetch leave requests",
      };
    }

    if (!response.data?.success) {
      return {
        ok: false,
        error: response.data?.message || "Failed to fetch leave requests",
      };
    }

    return { ok: true, data: response.data.data };

  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error fetching leave requests:", error);
    return { ok: false, error: "Internal server error" };
  }
}

type UpdateLeaveRequestStatusParams = {
  leaveRequestId: string;
  status: LeaveRequestStatus;
};

type UpdateLeaveRequestResponse = {
  success: boolean;
  message: string;
};

export async function updateLeaveRequestStatus(
  params: UpdateLeaveRequestStatusParams
): Promise<ActionResult<UpdateLeaveRequestResponse>> {
  try {
    const response = await apiClient.put<UpdateLeaveRequestResponse>(
      endpoints.leaveRequest.update,
      params,
      { auth: true }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: response.error || "Failed to update leave request",
      };
    }
    
     // The example response for update wasn't fully shown but usually follows { success: true, ... } pattern
     // Assuming standard response check
     if (response.data && response.data.success === false) { 
        return {
            ok: false,
             error: response.data.message || "Failed to update leave request"
        }
     }

    return { ok: true, data: response.data };

  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error updating leave request:", error);
    return { ok: false, error: "Internal server error" };
  }
}

type GetTotalLeaveBalanceResponse = {
  success: boolean;
  message: string;
  data: {
    leaveBalanceList: {
      _id: string;
      leave_type_name: string;
      hex_color_code: string;
      total_leaves: number;
      utilized_leaves: number;
    }[];
  };
};

export async function getTotalLeaveBalance(): Promise<
  ActionResult<GetTotalLeaveBalanceResponse["data"]>
> {
  try {
    const response = await apiClient.get<GetTotalLeaveBalanceResponse>(
      endpoints.leaveRequest.totalLeaveBalance,
      { auth: true }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: response.error || "Failed to fetch leave balance",
      };
    }

    if (!response.data?.success) {
      return {
        ok: false,
        error: response.data?.message || "Failed to fetch leave balance",
      };
    }

    return { ok: true, data: response.data.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error fetching leave balance:", error);
    return { ok: false, error: "Internal server error" };
  }
}

type ApplyLeaveParams = {
  leaveTypeId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
};

export async function applyLeave(
  params: ApplyLeaveParams
): Promise<ActionResult<unknown>> {
  try {
    const response = await apiClient.post(
      endpoints.leaveRequest.request,
      params,
      { auth: true }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: response.error || "Failed to apply for leave",
      };
    }

    const data = response.data as { success?: boolean; message?: string };
    if (data && !data.success) {
      return { ok: false, error: data.message || "Failed to apply for leave" };
    }

    return { ok: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error applying for leave:", error);
    return { ok: false, error: "Internal server error" };
  }
}

// Re-using LeaveRequest type if compatible, or defining a new one if structure differs
// The user provided API returns a list. I'll assume it matches LeaveRequest[] for now or check types later.
// For now, I'll use 'any' or define a specific type based on typical response,
// but the user didn't provide specific fields for list-requests response other than it being a list.
// I'll assume it returns { success: true, message: "...", data: LeaveRequest[] } similar to others.

type ListLeaveRequestsResponse = {
  success: boolean;
  message: string;
  data: {
    leaveRequestList: LeaveRequest[];
  };
};

type ListLeaveRequestsParams = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
};

export async function listLeaveRequests(params?: ListLeaveRequestsParams): Promise<
  ActionResult<{ list: LeaveRequest[], total: number }>
> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.leaveTypeId) queryParams.append("leaveTypeId", params.leaveTypeId);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const qs = queryParams.toString();
    const url = `${endpoints.leaveRequest.listRequests}?${qs}`;

    const response = await apiClient.get<ListLeaveRequestsResponse>(
      url,
      { auth: true }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: response.error || "Failed to list leave requests",
      };
    }

    if (!response.data?.success) {
      return {
        ok: false,
        error: response.data?.message || "Failed to list leave requests",
      };
    }

    // Return the nested list (try multiple common keys)
    const listData = response.data.data;
    // @ts-expect-error - checking multiple possible keys dynamically
    const list = listData?.leaveRequestList || listData?.leaveRequests || listData?.leave_requests || listData?.requests || [];
    // @ts-expect-error - trying to find total count if available
    const total = listData?.total || listData?.totalCount || listData?.total_count || 0;
    
    return { ok: true, data: { list, total } };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error listing leave requests:", error);
    return { ok: false, error: "Internal server error" };
  }
}

type CancelLeaveParams = {
  leaveTypeName?: string;
  totalDays?: number;
  creditType?: string;
  hexColorCode?: string;
};

export async function cancelLeaveRequest(
  leaveRequestId: string,
  data: CancelLeaveParams
): Promise<ActionResult<unknown>> {
  try {
    // delete request
    // Note: The user provided a body for the DELETE request.
    // Standard apiClient.delete might not support body if it relies on standard fetch where DELETE body support is tricky or depends on implementation.
    // My apiClient definition: delete: <T = unknown>(path: string, options?: RequestOptions) => request<T>(path, { ...(options ?? {}), method: 'DELETE' }),
    // RequestOptions has 'body?: unknown'. So it should work.
    
    const response = await apiClient.delete(
      endpoints.leaveRequest.cancel(leaveRequestId),
      { body: data, auth: true }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: response.error || "Failed to cancel leave request",
      };
    }

    const resData = response.data as { success?: boolean; message?: string };
    if (resData && !resData.success) {
      return { ok: false, error: resData.message || "Failed to cancel leave request" };
    }

    return { ok: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error cancelling leave request:", error);
    return { ok: false, error: "Internal server error" };
  }
}
