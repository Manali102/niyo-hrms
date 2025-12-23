import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEmployeeList, createEmployee, updateEmployee } from "@/server/employee.action";
import { EmployeeType, EmployeeGender, type Employee } from "@/types/employee.types";
import { Search, Loader2 } from "lucide-react";

// Schema for Step 1: Basic Details
const step1Schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  companyEmail: z.string().email("Invalid email"),
  personalEmail: z.string().email("Invalid email"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  jobTitle: z.string().min(1, "Job title is required"),
  gender: z.enum([
    EmployeeGender.MALE,
    EmployeeGender.FEMALE,
    EmployeeGender.OTHER,
  ]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  hireDate: z.string().min(1, "Hire date is required"),
  employeeType: z.enum([
    EmployeeType.CONTRACT,
    EmployeeType.FULL_TIME,
    EmployeeType.PART_TIME,
    EmployeeType.INTERN,
  ]),
  address: z.string().min(1, "Address is required"),
});

// Schema for Step 2: Assign Team (Optional managerId)
const step2Schema = z.object({
  managerId: z.string().optional(),
});

// Combined Schema
const employeeSchema = step1Schema.merge(step2Schema);

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeData?: Employee | null;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employeeData,
}) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Employee Dropdown State
  const [employees, setEmployees] = useState<
    { _id: string; fullName: string }[]
  >([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  const fetchEmployees = React.useCallback(
    async (pageNum: number, search: string) => {
      if (isLoadingEmployees) return;
      setIsLoadingEmployees(true);
      setFetchError(null);
      try {
        const res = await getEmployeeList({
          page: pageNum,
          limit: 10,
          name: search,
        });
        if (res.ok && res.data) {
          setEmployees((prev) =>
            pageNum === 1
              ? res.data!.employeeList
              : [...prev, ...res.data!.employeeList]
          );
          const currentCount =
            (pageNum - 1) * 10 + res.data!.employeeList.length;
          setHasMore(currentCount < res.data!.total);
        } else {
          setFetchError(res.error || "Failed to load employees");
          setHasMore(false); // Stop trying to load more on error
        }
      } catch (error) {
        console.error("Failed to fetch employees", error);
        setFetchError("An unexpected error occurred");
        setHasMore(false); // Stop trying to load more on error
      } finally {
        setIsLoadingEmployees(false);
      }
    },
    []
  );

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchEmployees(1, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchEmployees]);

  // Load more on scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingEmployees) {
          setPage((prev) => {
            const nextPage = prev + 1;
            fetchEmployees(nextPage, searchTerm);
            return nextPage;
          });
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingEmployees, searchTerm, fetchEmployees]);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    getValues,
    setValue,
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    mode: "onChange",
    defaultValues: {
      gender: EmployeeGender.MALE,
      employeeType: EmployeeType.FULL_TIME,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (employeeData) {
      reset({
        fullName: employeeData.fullName,
        companyEmail: employeeData.companyEmail,
        personalEmail: employeeData.personalEmail || "",
        phoneNumber: employeeData.phoneNumber || "",
        jobTitle: employeeData.jobTitle,
        gender: employeeData.gender as EmployeeGender,
        dateOfBirth: employeeData.dateOfBirth || "",
        hireDate: employeeData.hireDate,
        employeeType: employeeData.employeeType,
        address: employeeData.address || "",
        managerId: employeeData.managerId || "",
      });
    } else {
      reset({
        gender: EmployeeGender.MALE,
        employeeType: EmployeeType.FULL_TIME,
      });
    }
  }, [employeeData, reset]);


  const handleNext = async () => {
    const isStep1Valid = await trigger([
      "fullName",
      "companyEmail",
      "personalEmail",
      "phoneNumber",
      "jobTitle",
      "gender",
      "dateOfBirth",
      "hireDate",
      "employeeType",
      "address",
    ]);

    if (isStep1Valid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        fullName: data.fullName,
        companyEmail: data.companyEmail,
        personalEmail: data.personalEmail,
        jobTitle: data.jobTitle,
        phoneNumber: data.phoneNumber,
        address: data.address,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        hireDate: data.hireDate,
        employeeType: data.employeeType,
        isActive: true,
        offBoardDate: employeeData?.offBoardDate || new Date().toISOString().split("T")[0],
        managerId: data.managerId || undefined,
        organizationId: employeeData?.organizationId,
      };

      let response;
      if (employeeData) {
        // Update existing employee
        response = await updateEmployee(employeeData._id, payload);
      } else {
        // Create new employee
        response = await createEmployee(payload);
      }

      if (response.ok) {
        reset();
        setStep(1);
        onSuccess();
        onClose();
      } else {
        setError(response.error || `Failed to ${employeeData ? 'update' : 'create'} employee`);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {employeeData 
                ? (step === 1 ? "Edit Employee Details" : "Update Team Assignment")
                : (step === 1 ? "Onboard New Employee" : "Assign Team")}
            </h2>
            <p className="text-sm text-gray-500">
              {step === 1
                ? employeeData 
                  ? "Update the employee's information."
                  : "Enter the basic details of the new employee."
                : "Select a manager for the new employee. - For Leave request & approval process"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  {...register("fullName")}
                  placeholder="John Doe"
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Company Email
                </label>
                <Input
                  {...register("companyEmail")}
                  type="email"
                  placeholder="john.doe@company.com"
                  className={errors.companyEmail ? "border-red-500" : ""}
                />
                {errors.companyEmail && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.companyEmail.message}
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Personal Email
                </label>
                <Input
                  {...register("personalEmail")}
                  type="email"
                  placeholder="john.doe@gmail.com"
                  className={errors.personalEmail ? "border-red-500" : ""}
                />
                {errors.personalEmail && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.personalEmail.message}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <Input
                  {...register("phoneNumber")}
                  placeholder="9898656532"
                  type="number"
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Job Title
                </label>
                <Input
                  {...register("jobTitle")}
                  placeholder="Software Engineer"
                  className={errors.jobTitle ? "border-red-500" : ""}
                />
                {errors.jobTitle && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.jobTitle.message}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  {...register("gender")}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none h-10"
                >
                  <option value={EmployeeGender.MALE}>Male</option>
                  <option value={EmployeeGender.FEMALE}>Female</option>
                  <option value={EmployeeGender.OTHER}>Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.gender.message}
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Employee Type
                </label>
                <select
                  {...register("employeeType")}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none h-10"
                >
                  <option value={EmployeeType.FULL_TIME}>Full-time</option>
                  <option value={EmployeeType.PART_TIME}>Part-time</option>
                  <option value={EmployeeType.CONTRACT}>Contract</option>
                  <option value={EmployeeType.INTERN}>Intern</option>
                </select>
                {errors.employeeType && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.employeeType.message}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <Input
                  {...register("dateOfBirth")}
                  type="date"
                  className={errors.dateOfBirth ? "border-red-500" : ""}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Hire Date
                </label>
                <Input
                  {...register("hireDate")}
                  type="date"
                  className={errors.hireDate ? "border-red-500" : ""}
                />
                {errors.hireDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.hireDate.message}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Address
                </label>
                <Input
                  {...register("address")}
                  placeholder="123 Main St, City, Country"
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Select Manager (Optional)
                </label>

                <div className="relative" ref={dropdownRef}>
                  <div
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span
                      className={!getValues("managerId") ? "text-gray-500" : ""}
                    >
                      {employees.find((e) => e._id === getValues("managerId"))
                        ?.fullName || "Select Manager"}
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        isDropdownOpen ? "rotate-90" : ""
                      }`}
                    />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      <div className="sticky top-0 z-10 bg-white px-2 py-1.5">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4" />
                          <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto">
                        {fetchError ? (
                          <div className="px-4 py-2 text-sm text-red-500">
                            {fetchError}
                          </div>
                        ) : employees.length === 0 && !isLoadingEmployees ? (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            No employees found
                          </div>
                        ) : (
                          employees.map((employee) => (
                            <div
                              key={employee._id}
                              className={`relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-blue-50 ${
                                getValues("managerId") === employee._id
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-900"
                              }`}
                              onClick={() => {
                                setValue("managerId", employee._id, {
                                  shouldValidate: true,
                                });
                                setIsDropdownOpen(false);
                              }}
                            >
                              <span className="block truncate">
                                {employee.fullName}
                              </span>
                              {getValues("managerId") === employee._id && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                  <Check className="h-4 w-4" />
                                </span>
                              )}
                            </div>
                          ))
                        )}

                        {/* Loading indicator and observer target */}
                        <div
                          ref={observerTarget}
                          className="flex justify-center p-2"
                        >
                          {isLoadingEmployees && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hidden input to register the field if needed, but setValue handles it. 
                    However, we should keep the registration or just rely on setValue. 
                    Since we used register before, we can keep a hidden input or just use setValue.
                    The schema validation will check the value in the form state.
                */}
                <input type="hidden" {...register("managerId")} />

                <p className="mt-1 text-xs text-gray-500">
                  Select the employee under which the new employee will work.
                </p>
              </div>

              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Check
                      className="h-5 w-5 text-blue-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Note</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Any Leave approvals, Birthday, etc will be Notified to
                        all the Team members.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            {step === 1 ? (
              <Button type="button" onClick={handleNext}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleSubmit(onSubmit)()} // Submit without managerId effectively skipping
                  disabled={isLoading}
                >
                  Skip
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Finish"}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
