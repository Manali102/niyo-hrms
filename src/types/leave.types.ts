export enum LeaveRequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export type LeaveType = {
  _id: string;
  leave_type_name: string;
  hex_color_code: string;
};

export type LeaveRequestEmployeeDetails = {
  _id: string;
  fullName: string;
  companyEmail: string;
  jobTitle: string;
};

export type LeaveRequest = {
  _id: string;
  leave_type_id: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveRequestStatus;
  created_at: string;
  employee_details: LeaveRequestEmployeeDetails;
  approved_by?: Record<string, unknown>; // Use Record<string, unknown> or a specific type if known, for now empty object in example matches this default
};
