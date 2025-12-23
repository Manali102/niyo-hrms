"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyLeave, getTotalLeaveBalance } from "@/server/leave.action";
import { differenceInDays } from "date-fns";
import { X, Loader2 } from "lucide-react";

export const ApplyLeaveModal = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState<{
    _id: string;
    leave_type_name: string;
    hex_color_code: string;
    total_leaves: number;
    utilized_leaves: number;
  }[]>([]); 
  
  // Form State
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalDays, setTotalDays] = useState<number | string>(1);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        // Fetch balances to populate dropdown
        getTotalLeaveBalance().then(res => {
            if (res.ok && res.data) {
                setBalances(res.data.leaveBalanceList);
                if (res.data.leaveBalanceList.length > 0) {
                     setLeaveTypeId(res.data.leaveBalanceList[0]._id);
                }
            }
        });
    }
  }, [isOpen]);

  const calculateDays = (start: string, end: string) => {
      if (!start || !end) return;
      const d1 = new Date(start);
      const d2 = new Date(end);
      if (d1 > d2) {
          setTotalDays(0);
          return;
      }
      
      const diff = differenceInDays(d2, d1) + 1; // inclusive
      setTotalDays(diff);
  };

  const handleDateChange = (type: 'start' | 'end', val: string) => {
      if (type === 'start') {
          setStartDate(val);
          calculateDays(val, endDate);
      } else {
          setEndDate(val);
          calculateDays(startDate, val);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await applyLeave({
        leaveTypeId,
        startDate,
        endDate,
        totalDays: Number(totalDays),
        reason
    });

    setLoading(false);

    if (res.ok) {
        setIsOpen(false);
        // Reset form
        setStartDate("");
        setEndDate("");
        setTotalDays(1);
        setReason("");
        onSuccess?.();
    } else {
        setError(res.error || "Failed to apply leave");
    }
  };

  if (!isOpen) {
      return (
          <Button onClick={() => setIsOpen(true)}>Apply Leave</Button>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Apply for Leave</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">Leave Type</label>
            <select
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none h-10"
              required
            >
                <option value="" disabled>Select type</option>
                {balances.map((b) => (
                    <option key={b._id} value={b._id}>
                        {b.leave_type_name} (Avail: {b.total_leaves - b.utilized_leaves})
                    </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => handleDateChange('start', e.target.value)} required />
            </div>
             <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => handleDateChange('end', e.target.value)} required />
            </div>
          </div>
          
           <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Total Days (can be partial)</label>
                <Input 
                    type="number" 
                    step="0.5" 
                    value={totalDays} 
                    onChange={(e) => setTotalDays(e.target.value)} 
                    required 
                />
            </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">Reason</label>
            <textarea 
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none min-h-[80px]"
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                required 
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
                {loading ? <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Applying...</div> : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
