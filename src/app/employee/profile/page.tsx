
import { getSessionAction } from "@/server/auth.action";
import { getEmployeeDetails, getEmployeeHierarchy } from "@/server/employee.action";
import ProfileDetails from "@/components/profile/ProfileDetails";
import MyTeam from "@/components/profile/MyTeam";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getSessionAction();

  if (!session.ok || !session.data?.authenticated || !session.data.user) {
    redirect("/login");
  }

  const userId = session.data.user.userId;
  const employeeRes = await getEmployeeDetails(userId);

  if (!employeeRes.ok || !employeeRes.data) {
    return (
      <div className="p-6 text-[rgb(var(--color-text))]">
        Error loading profile. Please try again later.
      </div>
    );
  }

  const employee = employeeRes.data;
  
  // Determine manager ID for hierarchy fetching
  // Handle case where managerId is populated (object) or unpopulated (string)
  // Based on user input: "here the employeeId will be managerId you get from the previous API response, managerId is not found in the response share _id there"
  let hierarchyId = employee._id;
  
  if (employee.managerId) {
    if (typeof employee.managerId === 'object' && '_id' in (employee.managerId as any)) {
      hierarchyId = (employee.managerId as any)._id;
    } else if (typeof employee.managerId === 'string') {
      hierarchyId = employee.managerId;
    }
  }

  const hierarchyRes = await getEmployeeHierarchy(hierarchyId);
  const team = hierarchyRes.data || [];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto pb-20">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] tracking-tight">My Profile</h1>
       </div>
       
       <ProfileDetails employee={employee} />
       
       <div className="pt-2">
         <MyTeam team={team} currentProfileId={employee._id} />
       </div>
    </div>
  );
}
