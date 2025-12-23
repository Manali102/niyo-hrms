import React from "react";
import { notFound } from "next/navigation";
import { getEmployeeDetails } from "@/server/employee.action";
import EmployeeDetails from "@/components/employee/EmployeeDetails";

interface EmployeePageProps {
  params: {
    id: string;
  };
}

const EmployeePage = async ({ params }: EmployeePageProps) => {
  const { id } = params;

  // Fetch employee details
  const result = await getEmployeeDetails(id);

  // Handle errors
  if (!result.ok || !result.data) {
    notFound();
  }

  return <EmployeeDetails employee={result.data} />;
};

export default EmployeePage;
