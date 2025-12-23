
import { Employee } from "@/types/employee.types";
import { Mail, Phone, MapPin, Briefcase, Calendar, User } from "lucide-react";
import { format } from "date-fns";

const ProfileDetails = ({ employee }: { employee: Employee }) => {
  return (
    <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar / Initials */}
        <div className="w-24 h-24 rounded-full bg-[rgb(var(--color-accent))] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
          {employee.fullName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 w-full space-y-6">
          {/* Header Info */}
          <div>
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text))]">
              {employee.fullName}
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))] flex items-center gap-2 mt-1">
              <Briefcase size={16} /> {employee.jobTitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="space-y-4">
              <InfoItem
                icon={<Mail size={16} />}
                label="Company Email"
                value={employee.companyEmail}
              />
              <InfoItem
                icon={<Phone size={16} />}
                label="Phone"
                value={employee.phoneNumber || "N/A"}
              />
              <InfoItem
                icon={<MapPin size={16} />}
                label="Address"
                value={employee.address || "N/A"}
              />
            </div>
            <div className="space-y-4">
              <InfoItem
                icon={<Calendar size={16} />}
                label="Date of Joining"
                value={format(new Date(employee.hireDate), "PPP")}
              />
              <InfoItem
                icon={<User size={16} />}
                label="Employee Type"
                value={employee.employeeType}
                capitalize
              />
              <InfoItem
                icon={<User size={16} />}
                label="Manager"
                value={employee.managerDetails?.fullName || "N/A"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
  capitalize = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
}) => (
  <div className="flex items-center gap-3">
    <div className="text-[rgb(var(--color-text-secondary))]">{icon}</div>
    <div>
      <p className="text-xs text-[rgb(var(--color-text-secondary))] font-medium uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-sm text-[rgb(var(--color-text))] font-medium ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

export default ProfileDetails;
