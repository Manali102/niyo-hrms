"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { format } from "date-fns";
import { Check, X, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEmployeeLeaveRequests, updateLeaveRequestStatus } from "@/server/leave.action";
import { LeaveRequest, LeaveRequestStatus } from "@/types/leave.types";
// If use-toast doesn't exist, I'll remove it in next step or use simple alert. 
// I'll check imports in other files if possible, but let's assume it might not exist and use a simple error handling or just console. 
// Wait, I see "components/ui/button" so likely shadcn. I'll stick to console/alert if I'm not sure, or try to find it. 
// Let's use console.error for now to be safe, I can add toast later if found.
// Actually, let's look for toast in file list. I didn't see `hooks` folder in level 1, but maybe it's in `components/ui/use-toast`.
// I will not import useToast to avoid breaking if not present.

interface EmployeeLeaveRequestsProps {
  employeeId: string;
}

export const EmployeeLeaveRequests: React.FC<EmployeeLeaveRequestsProps> = ({
  employeeId,
}) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchRequests = async () => {
    setLoading(true);
    // Hardcoded limit as per requirement (or reasonable default)
    const limit = 5; 
    const result = await getEmployeeLeaveRequests({
      employeeId,
      page,
      limit,
      status: "pending",
    });

    if (result.ok && result.data) {
      setRequests((prev) => {
        // Filter out duplicates just in case
        const newRequests = result.data!.leaveRequests.filter(
          (newReq) => !prev.some((p) => p._id === newReq._id)
        );
        return [...prev, ...newRequests];
      });
      if (result.data.leaveRequests.length < limit) {
        setHasMore(false);
      }
    } else {
      console.error(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [page]);

  const handleStatusUpdate = async (
    leaveRequestId: string,
    status: LeaveRequestStatus
  ) => {
    // Optimistic update
    const previousRequests = [...requests];
    setRequests((prev) => prev.filter((req) => req._id !== leaveRequestId));

    const result = await updateLeaveRequestStatus({ leaveRequestId, status });
    if (!result.ok) {
      // Revert if failed
      setRequests(previousRequests);
      console.error(result.error);
      alert("Failed to update status");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 h-full">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Pending Leave Requests
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {requests.length === 0 && !loading && (
           <div className="p-6 text-center text-gray-500 dark:text-gray-400">
             No pending leave requests.
           </div>
        )}
        
        {requests.map((request, index) => {
          const isLast = index === requests.length - 1;
          return (
            <div
              key={request._id}
              ref={isLast ? lastElementRef : null}
              className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${request.leave_type_id.hex_color_code}20`,
                      color: request.leave_type_id.hex_color_code,
                      border: `1px solid ${request.leave_type_id.hex_color_code}40`,
                    }}
                  >
                    {request.leave_type_id.leave_type_name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {request.total_days} {request.total_days === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                 Reason: {request.reason}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(new Date(request.start_date), "MMM d, yyyy")} 
                  {request.total_days > 1 && ` - ${format(new Date(request.end_date), "MMM d, yyyy")}`}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStatusUpdate(request._id, LeaveRequestStatus.APPROVED)}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleStatusUpdate(request._id, LeaveRequestStatus.REJECTED)}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          );
        })}
        
        {loading && (
          <div className="p-4 text-center text-gray-400 text-sm">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};
