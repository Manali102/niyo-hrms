"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AddEmployeeModal } from "@/components/Popups/Employee/AddEmployeeModal";
import { ChangePasswordModal } from "@/components/Popups/Employee/ChangePasswordModal";
import { EmployeeLeaveRequests } from "./EmployeeLeaveRequests";
import { type Employee } from "@/types/employee.types";
import { format } from "date-fns";
import { ArrowLeft, Edit, DollarSign, Lock } from "lucide-react";

interface EmployeeDetailsProps {
  employee: Employee;
}

const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ employee }) => {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    // Refresh the page to get updated data
    router.refresh();
  };

  const formatEnumLabel = (value: string) => {
    return value
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | boolean;
  }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">
        {typeof value === "boolean" ? (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {value ? "Active" : "Inactive"}
          </span>
        ) : (
          value || "-"
        )}
      </dd>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/employee")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employees
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {employee.fullName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{employee.jobTitle}</p>
          </div>
          <div className="flex gap-3">
            <Button 
                onClick={() => setIsChangePasswordModalOpen(true)} 
                variant="secondary" 
                className="border"
            >
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <Button onClick={() => setIsEditModalOpen(true)} variant="secondary" className="border">
              <Edit className="mr-2 h-4 w-4" />
              Edit Employee
            </Button>
            <Button onClick={() => router.push(`/payroll/${employee._id}`)}>
              <DollarSign className="mr-2 h-4 w-4" />
              Go to Payroll
            </Button>
          </div>
        </div>
      </div>

      {/* Employee Details */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="px-6 py-5">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Employee Information
          </h2>
          <dl className="divide-y divide-gray-200 dark:divide-gray-700">
            <InfoRow label="Full Name" value={employee.fullName} />
            <InfoRow label="Company Email" value={employee.companyEmail} />
            <InfoRow label="Personal Email" value={employee.personalEmail || "-"} />
            <InfoRow
              label="Manager"
              value={employee.managerDetails?.fullName || "-"}
            />
            <InfoRow label="Job Title" value={employee.jobTitle} />
            <InfoRow
              label="Hire Date"
              value={
                employee.hireDate
                  ? format(new Date(employee.hireDate), "MMMM d, yyyy")
                  : "-"
              }
            />
            <InfoRow
              label="Date of Birth"
              value={
                employee.dateOfBirth
                  ? format(new Date(employee.dateOfBirth), "MMMM d, yyyy")
                  : "-"
              }
            />
            <InfoRow label="Phone Number" value={employee.phoneNumber || "-"} />
            <InfoRow label="Address" value={employee.address || "-"} />
            <InfoRow label="Gender" value={formatEnumLabel(employee.gender)} />
            <InfoRow
              label="Employee Type"
              value={formatEnumLabel(employee.employeeType)}
            />
            <InfoRow label="Status" value={employee.isActive ?? false} />
            <InfoRow
              label="Created At"
              value={
                employee.created_at
                  ? format(
                      new Date(employee.created_at),
                      "MMMM d, yyyy 'at' h:mm a"
                    )
                  : "-"
              }
            />
            {employee.updated_at && (
              <InfoRow
                label="Last Updated"
                value={format(
                  new Date(employee.updated_at),
                  "MMMM d, yyyy 'at' h:mm a"
                )}
              />
            )}
          </dl>
        </div>
      </div>

      {/* Bottom Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Requests */}
        <EmployeeLeaveRequests employeeId={employee._id} />
        
        {/* Placeholder for future section or just empty space for now */}
        <div></div>
      </div>

      {/* Edit Modal */}
      <AddEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        employeeData={employee}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        employeeId={employee._id}
        employeeName={employee.fullName}
      />
    </div>
  );
};

export default EmployeeDetails;
