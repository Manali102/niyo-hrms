
import { Employee } from "@/types/employee.types";
import Link from 'next/link';

const MyTeam = ({ team, currentProfileId }: { team: Employee[]; currentProfileId?: string }) => {
  if (!team || team.length === 0) {
    return (
      <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4">
          My Team
        </h3>
        <p className="text-[rgb(var(--color-text-secondary))] text-sm">
          No team members found.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4">
        My Team
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => {
          const isCurrentProfile = member._id === currentProfileId;
          const CardContent = (
            <>
              <div className="w-10 h-10 rounded-full bg-[rgb(var(--color-accent))] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {member.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-[rgb(var(--color-text))] truncate">
                  {member.fullName}
                </p>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] truncate">
                  {member.jobTitle}
                </p>
              </div>
            </>
          );

          if (isCurrentProfile) {
            return (
              <div
                key={member._id}
                className="flex items-center gap-3 p-3 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] opacity-70 cursor-default"
                title="Current Profile"
              >
                {CardContent}
              </div>
            );
          }

          return (
            <Link
              href={`/employee/profile/${member._id}`}
              key={member._id}
              className="flex items-center gap-3 p-3 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] hover:border-[rgb(var(--color-accent))] transition-colors cursor-pointer"
            >
              {CardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MyTeam;
