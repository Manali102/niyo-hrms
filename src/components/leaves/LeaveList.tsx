"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
    listLeaveRequests, 
    cancelLeaveRequest, 
    getTotalLeaveBalance 
} from "@/server/leave.action";
import { LeaveRequest, LeaveRequestStatus } from "@/types/leave.types";
import { format } from "date-fns";
import { Trash2, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";

type LeaveListProps = {
    refreshTrigger?: number;
    onDeleteSuccess?: () => void;
};

export const LeaveList = ({ refreshTrigger, onDeleteSuccess }: LeaveListProps) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  // Filters State
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Data for filters
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  // Fetch leave types for dropdown
  useEffect(() => {
      getTotalLeaveBalance().then(res => {
          if (res.ok && res.data) {
              setLeaveTypes(res.data.leaveBalanceList);
          }
      });
  }, []);

  // Function to refresh list
  const fetchRequests = async () => {
    setLoading(true);
    const params = {
        page,
        limit: 10,
        status: status || undefined,
        search: search || undefined,
        leaveTypeId: leaveTypeId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    };

    const res = await listLeaveRequests(params);
    if (res.ok && res.data) {
      setRequests(res.data.list);
      setTotalCount(res.data.total); // Assuming API returns total now, if not we handle safely
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [refreshTrigger, page, status, search, leaveTypeId, startDate, endDate]);

  const handleCancel = async (request: LeaveRequest) => {
    if (!confirm("Are you sure you want to cancel this leave request?")) return;
    
    setCancellingId(request._id);
    
    // Fallback logic for nested object access
    const leaveTypeName = request.leave_type_id?.leave_type_name || "Unknown";
    const hexColorCode = request.leave_type_id?.hex_color_code || "#ccc";

    const cancelData = {
        leaveTypeName,
        totalDays: request.total_days,
        creditType: "monthly",
        hexColorCode,
    };

    const res = await cancelLeaveRequest(request._id, cancelData);
    if (res.ok) {
        onDeleteSuccess?.();
        // Also refresh list locally to show update immediately
        fetchRequests();
    } else {
        alert("Failed to cancel request: " + res.error);
    }
    setCancellingId(null);
  };
  
  const clearFilters = () => {
      setStatus("");
      setSearch("");
      setLeaveTypeId("");
      setStartDate("");
      setEndDate("");
      setPage(1);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = React.useRef<HTMLDivElement>(null);

  // Close filter on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasFilters = status || leaveTypeId || startDate || endDate;

  // Helper to get status badge styles
  const getStatusBadge = (status: LeaveRequestStatus | string) => {
      // Assuming status comes as lowercase from Type but might be mixed case from API.
      const s = String(status).toLowerCase();
      let classes = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ";
      if (s === 'approved') {
          classes += "bg-green-100 text-green-800 hover:bg-green-100";
      } else if (s === 'rejected') {
           classes += "bg-red-100 text-red-800 hover:bg-red-100";
      } else {
           classes += "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      }
      return <span className={classes}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
  };

  return (
    <div className="space-y-4">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             {/* Search Bar */}
             <div className="relative w-full sm:max-w-xs">
                 <Input 
                    placeholder="Search requests..." 
                    value={search} 
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
                    className="h-10 w-full"
                 />
             </div>
             
             {/* Filter Button & Popup */}
             <div className="relative" ref={filterRef}>
                 <Button 
                    variant={hasFilters ? "default" : "outline"} 
                    className="flex items-center gap-2 h-10"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                 >
                     <Filter className="h-4 w-4" /> 
                     Filter
                     {hasFilters && <span className="flex h-2 w-2 rounded-full bg-red-500 absolute top-2 right-2 ring-1 ring-white" />}
                 </Button>

                 {isFilterOpen && (
                     <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                         <div className="flex items-center justify-between mb-4">
                             <h4 className="font-semibold text-gray-900">Filters</h4>
                             {hasFilters && (
                                <button onClick={clearFilters} className="text-xs text-red-600 hover:underline">
                                    Clear all
                                </button>
                             )}
                         </div>
                         
                         <div className="space-y-4">
                             <div className="space-y-1.5">
                                 <label className="text-xs font-medium text-gray-500">Status</label>
                                 <select
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={status}
                                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                                 >
                                     <option value="">All Status</option>
                                     <option value="pending">Pending</option>
                                     <option value="approved">Approved</option>
                                     <option value="rejected">Rejected</option>
                                 </select>
                             </div>

                             <div className="space-y-1.5">
                                 <label className="text-xs font-medium text-gray-500">Leave Type</label>
                                 <select
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={leaveTypeId}
                                    onChange={(e) => { setLeaveTypeId(e.target.value); setPage(1); }}
                                 >
                                     <option value="">All Types</option>
                                     {leaveTypes.map(lt => (
                                         <option key={lt._id} value={lt._id}>{lt.leave_type_name}</option>
                                     ))}
                                 </select>
                             </div>

                             <div className="grid grid-cols-2 gap-2">
                                 <div className="space-y-1.5">
                                     <label className="text-xs font-medium text-gray-500">From</label>
                                     <Input 
                                        type="date"
                                        value={startDate} 
                                        onChange={(e) => { setStartDate(e.target.value); setPage(1); }} 
                                        className="h-9"
                                     />
                                 </div>
                                 <div className="space-y-1.5">
                                     <label className="text-xs font-medium text-gray-500">To</label>
                                     <Input 
                                        type="date"
                                        value={endDate} 
                                        onChange={(e) => { setEndDate(e.target.value); setPage(1); }} 
                                        className="h-9"
                                     />
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}
             </div>
        </div>

        {/* Results Table */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Dates</th>
                        <th className="px-6 py-3">Days</th>
                        <th className="px-6 py-3">Reason</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {loading ? (
                         <tr>
                          <td colSpan={6} className="px-6 py-8">
                             <div className="space-y-3">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                             </div>
                          </td>
                        </tr>
                    ) : requests.length === 0 ? (
                        <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No leave requests found.
                        </td>
                        </tr>
                    ) : (
                        (Array.isArray(requests) ? requests : []).map((request) => (
                        <tr key={request._id} className="bg-white hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: request.leave_type_id?.hex_color_code || '#ccc' }} />
                                <span className="font-medium text-gray-900">{request.leave_type_id?.leave_type_name || 'Unknown'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {request.start_date ? format(new Date(request.start_date), "MMM d, yyyy") : '-'} -{" "}
                            {request.end_date ? format(new Date(request.end_date), "MMM d, yyyy") : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{request.total_days}</td>
                        <td className="px-6 py-4 max-w-[200px] truncate" title={request.reason}>
                            {request.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(request.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {(String(request.status).toLowerCase() === 'pending') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleCancel(request)}
                                disabled={cancellingId === request._id}
                            >
                                {cancellingId === request._id ? (
                                    <span className="animate-spin h-4 w-4 border-2 border-red-500 rounded-full border-t-transparent"></span>
                                ) : (
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                )}
                            </Button>
                            )}
                        </td>
                        </tr>
                    )))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Controls */}
            {!loading && requests.length > 0 && (
                <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
                     <div className="flex flex-1 justify-between sm:hidden">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={requests.length < 10} // Simple check if less than limit, assuming 10
                        >
                            Next
                        </Button>
                     </div>
                     <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                         <div>
                             <p className="text-sm text-gray-700">
                                 Showing page <span className="font-medium">{page}</span>
                             </p>
                         </div>
                         <div>
                             <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setPage(p => p + 1)}
                                     disabled={requests.length < 10}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                             </div>
                         </div>
                     </div>
                </div>
            )}
        </div>
    </div>
  );
};
