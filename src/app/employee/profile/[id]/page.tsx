
import { getSessionAction } from "@/server/auth.action";
import { getEmployeeDetails, getEmployeeHierarchy } from "@/server/employee.action";
import ProfileDetails from "@/components/profile/ProfileDetails";
import MyTeam from "@/components/profile/MyTeam";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamMemberProfilePage({ params }: PageProps) {
  const session = await getSessionAction();

  if (!session.ok || !session.data?.authenticated || !session.data.user) {
    redirect("/login");
  }

  const { id } = await params;
  const employeeRes = await getEmployeeDetails(id);

  if (!employeeRes.ok || !employeeRes.data) {
    return (
      <div className="p-6 text-[rgb(var(--color-text))]">
        Error loading profile. Please try again later.
      </div>
    );
  }

  const employee = employeeRes.data;
  
  // Determine manager ID for hierarchy fetching
  let hierarchyId = employee._id;
  
  if (employee.managerId) {
    if (typeof employee.managerId === 'object' && employee.managerId !== null && '_id' in employee.managerId) {
      hierarchyId = (employee.managerId as { _id: string })._id;
    } else if (typeof employee.managerId === 'string') {
      hierarchyId = employee.managerId;
    }
  }

  const hierarchyRes = await getEmployeeHierarchy(hierarchyId);
  const team = hierarchyRes.data || [];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto pb-20">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] tracking-tight">Team Member</h1>
       </div>
       
       <ProfileDetails employee={employee} />
       
       <div className="pt-2">
         <MyTeam team={team} currentProfileId={employee._id} />
       </div>
    </div>
  );
}
