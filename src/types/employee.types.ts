export enum EmployeeType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  CONTRACT = "contract",
  INTERN = "intern",
}

export enum EmployeeGender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export type Employee = {
  _id: string;
  fullName: string;
  companyEmail: string;
  personalEmail?: string;
  phoneNumber?: string;
  address?: string;
  managerDetails?: { fullName: string };
  managerId?: string;
  jobTitle: string;
  hireDate: string;
  dateOfBirth?: string;
  gender: string;
  employeeType: EmployeeType;
  isActive?: boolean;
  offBoardDate?: string;
  organizationId?: string;
  created_at: string;
  updated_at?: string;
};

