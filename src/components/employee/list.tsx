"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddEmployeeModal } from "@/components/Popups/Employee/AddEmployeeModal";
import { getEmployeeList } from "@/server/employee.action";
import {
  EmployeeGender,
  EmployeeType,
  type Employee,
} from "@/types/employee.types";
import { format } from "date-fns";

/**
 * EmployeeList component for application header
 * @returns JSX.Element
 */
const EmployeeList = () => {
  function formatEnumLabel(value: string) {
    return value
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const result = await getEmployeeList({ page, limit });
      if (result.ok && result.data) {
        result.data.employeeList = result.data.employeeList.map((employee) => {
          employee.gender = formatEnumLabel(employee.gender) as EmployeeGender;

          employee.employeeType = formatEnumLabel(
            employee.employeeType
          ) as EmployeeType;
          return employee;
        });

        setEmployees(result.data.employeeList);
        setTotal(result.data.total);
      } else {
        console.error("Failed to fetch employees:", result.error);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, limit]);

  const handleAddSuccess = () => {
    fetchEmployees();
  };

  const handleRowClick = (employeeId: string) => {
    router.push(`/employee/${employeeId}`);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500">
            Manage your organization's employees
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          On Board new Employee
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No employees found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-3">Full Name</th>
                  <th className="px-6 py-3">Company Email</th>
                  <th className="px-6 py-3">Manager</th>
                  <th className="px-6 py-3">Job Title</th>
                  <th className="px-6 py-3">Hire Date</th>
                  <th className="px-6 py-3">Gender</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Created At</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee._id}
                    className="border-b bg-white hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(employee._id)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {employee.fullName}
                    </td>
                    <td className="px-6 py-4">{employee.companyEmail}</td>
                    <td className="px-6 py-4">
                      {employee.managerDetails?.fullName || "-"}
                    </td>
                    <td className="px-6 py-4">{employee.jobTitle}</td>
                    <td className="px-6 py-4">
                      {employee.hireDate
                        ? format(new Date(employee.hireDate), "MMM d, yyyy")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 capitalize">{employee.gender}</td>
                    <td className="px-6 py-4 capitalize">
                      {employee.employeeType}
                    </td>
                    <td className="px-6 py-4">
                      {employee.created_at
                        ? format(new Date(employee.created_at), "MMM d, yyyy")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{(page - 1) * limit + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * limit, total)}
                  </span>{" "}
                  of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <Button
                    variant="ghost"
                    className="rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default EmployeeList;
